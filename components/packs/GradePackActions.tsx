"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  createCustomPackSelection,
  createFullPackSelection,
} from "@/lib/packs/createPackSelection";
import { useDialogFocusTrap } from "./useDialogFocusTrap";
import { usePortalContainer } from "@/hooks/usePortalContainer";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { createFullTrayPack } from "@/lib/order/createTrayPack";
import {
  trackCustomiserOpened,
  trackCustomiserReset,
  trackInitiatePreOrder,
} from "@/lib/analytics";
import type {
  GradePackForCustomisation,
  PackSelectionItem,
} from "@/lib/packs/types";
import { DownloadListLink } from "./DownloadListLink";

type GradePackActionsProps = {
  pack: GradePackForCustomisation;
  showDownloadLink?: boolean;
  showMicrocopy?: boolean;
  layout?: "compact" | "detail";
  downloadLabel?: string;
  autoCustomise?: boolean;
};

function formatItemCurrency(value: number) {
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

export function GradePackActions({
  pack,
  showDownloadLink = true,
  showMicrocopy = true,
  layout = "compact",
  downloadLabel = "Download list (PDF)",
  autoCustomise,
}: GradePackActionsProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const portalContainer = usePortalContainer();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [, startTransition] = useTransition();
  const addPack = usePackTrayStore((s) => s.addPack);
  const openTray = usePackTrayStore((s) => s.openTray);

  // Stabilise the items reference to prevent infinite re-render loops.
  // Only recalculate when the serialised item list actually changes.
  const itemsKey = useMemo(
    () =>
      pack.items
        .map(
          (i) =>
            `${i.id}:${i.requiredQuantity}:${i.unitPrice ?? ""}:${i.description ?? ""}`,
        )
        .join(","),
    [pack.items],
  );

  const [selection, setSelection] = useState<PackSelectionItem[]>(() =>
    createCustomPackSelection(pack.items),
  );

  const deferredSelection = useDeferredValue(selection);

  const selectedItems = useMemo(
    () =>
      deferredSelection.filter(
        (item) => item.selected && item.selectedQuantity > 0,
      ),
    [deferredSelection],
  );
  const isFullSelection = useMemo(
    () =>
      deferredSelection.length > 0 &&
      deferredSelection.every(
        (item) =>
          item.selected && item.selectedQuantity === item.requiredQuantity,
      ),
    [deferredSelection],
  );
  const [total, setTotal] = useState(pack.fullPackPrice ?? 0);
  const [isPricingTotal, setIsPricingTotal] = useState(false);
  const displayedTotal = total > 0 ? formatItemCurrency(total) : "R 0";
  const selectedCount = selectedItems.length;
  const pdfItems = useMemo(
    () =>
      pack.items.map((item) => ({
        name: item.name,
        quantity: item.requiredQuantity,
        description: item.description,
        specification: item.specification,
      })),
    [pack.items],
  );

  useEffect(() => {
    if (selectedItems.length === 0) {
      setIsPricingTotal(false);
      setTotal(0);
      return;
    }

    if (isFullSelection) {
      setIsPricingTotal(false);
      setTotal(pack.fullPackPrice ?? 0);
      return;
    }

    const controller = new AbortController();
    setIsPricingTotal(true);

    const timer = window.setTimeout(() => {
      fetch("/api/packs/custom-total", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.id,
          items: deferredSelection.map((item) => ({
            id: item.id,
            quantity: item.selected ? item.selectedQuantity : 0,
          })),
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          const payload = (await response.json()) as {
            success?: boolean;
            total?: number;
          };
          if (!response.ok || payload.success !== true) {
            throw new Error("Custom pack pricing failed");
          }
          setTotal(typeof payload.total === "number" ? payload.total : 0);
        })
        .catch((error) => {
          if ((error as Error).name !== "AbortError") {
            console.error("[pack customiser] pricing update failed:", error);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsPricingTotal(false);
        });
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    deferredSelection,
    isFullSelection,
    pack.fullPackPrice,
    pack.id,
    selectedItems.length,
  ]);

  const closeCustomiser = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => {
      triggerButtonRef.current?.focus();
    }, 0);
  }, []);

  const handleAddFullPack = useCallback(() => {
    const trayPack = createFullTrayPack({
      packId: pack.id,
      basePackId: pack.id,
      packName: pack.packName || `${pack.grade} Stationery Pack`,
      schoolId: pack.schoolId,
      schoolSlug: pack.schoolSlug,
      schoolName: pack.schoolName,
      grade: pack.grade,
      gradeSlug: pack.gradeSlug,
      items: pack.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.requiredQuantity,
        unitPrice: item.unitPrice,
        requiresPexcover: item.requiresPexcover,
        pexcoCode: item.pexcoCode,
        pexcoRateCents: item.pexcoRateCents,
        pexcoRateActive: item.pexcoRateActive,
      })),
      totalPrice: pack.fullPackPrice ?? 0,
      sourcePath: window.location.pathname,
    });
    addPack(trayPack);
    trackInitiatePreOrder({
      school: pack.schoolName,
      grade: pack.grade,
      packMode: "full",
      totalPrice: pack.fullPackPrice ?? 0,
    });
    openTray();
  }, [pack, addPack, openTray]);

  const handleSaveCustomPack = useCallback(() => {
    if (selectedCount === 0) return;

    const modifications: Record<string, number> = {};
    const trayItems: Array<{
      id: string;
      name: string;
      category?: string;
      quantity: number;
      unitPrice?: number;
      requiresPexcover?: boolean;
      pexcoCode?: string | null;
      pexcoRateCents?: number | null;
      pexcoRateActive?: boolean;
    }> = [];
    const customTotal = total;

    selection.forEach((item) => {
      if (item.selected && item.selectedQuantity > 0) {
        trayItems.push({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.selectedQuantity,
          unitPrice: item.unitPrice,
          requiresPexcover: item.requiresPexcover,
          pexcoCode: item.pexcoCode,
          pexcoRateCents: item.pexcoRateCents,
          pexcoRateActive: item.pexcoRateActive,
        });
      }
      if (item.selectedQuantity !== item.requiredQuantity) {
        modifications[item.id] = item.selectedQuantity;
      }
    });

    const trayPack = createFullTrayPack({
      packId: `${pack.id}-custom-${Date.now()}`,
      basePackId: pack.id,
      packName: pack.packName || `${pack.grade} Stationery Pack`,
      schoolId: pack.schoolId,
      schoolSlug: pack.schoolSlug,
      schoolName: pack.schoolName,
      grade: pack.grade,
      gradeSlug: pack.gradeSlug,
      items: trayItems,
      totalPrice: customTotal,
      sourcePath: window.location.pathname,
    });

    const customPack = {
      ...trayPack,
      packMode: "customised" as const,
      modifications:
        Object.keys(modifications).length > 0 ? modifications : undefined,
    };

    addPack(customPack);
    trackInitiatePreOrder({
      school: pack.schoolName,
      grade: pack.grade,
      packMode: "customised",
      totalPrice: customTotal,
    });
    closeCustomiser();
    openTray();
  }, [
    selectedCount,
    selection,
    pack,
    addPack,
    closeCustomiser,
    openTray,
    total,
  ]);

  // Mount check for portal rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-open drawer when customize=1 is in the URL
  useEffect(() => {
    if (autoCustomise && isMounted) {
      trackCustomiserOpened({ school: pack.schoolName, grade: pack.grade });
      setIsOpen(true);
    }
  }, [autoCustomise, isMounted, pack.grade, pack.schoolName]);

  useDialogFocusTrap({
    isOpen,
    dialogRef: drawerRef,
    initialFocusRef: closeButtonRef,
    onClose: closeCustomiser,
  });

  // Only reset selection when the actual items content changes, not on every render
  useEffect(() => {
    setSelection(createCustomPackSelection(pack.items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  function setItemSelected(id: string, selected: boolean) {
    startTransition(() => {
      setSelection((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                selected,
                selectedQuantity: selected
                  ? item.selectedQuantity || item.requiredQuantity
                  : 0,
              }
            : item,
        ),
      );
    });
  }

  function setItemQuantity(id: string, quantity: number) {
    startTransition(() => {
      setSelection((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                selected: quantity > 0,
                selectedQuantity: Math.max(0, quantity),
              }
            : item,
        ),
      );
    });
  }

  function resetToFullPack() {
    startTransition(() => {
      setSelection(createFullPackSelection(pack.items));
    });
    trackCustomiserReset({ school: pack.schoolName, grade: pack.grade });
  }

  const drawerContent = isOpen ? (
    <div
      className="fixed inset-0 z-[var(--z-drawer)] bg-[var(--color-overlay)] flex justify-end overflow-hidden animate-[fadeInOverlay_0.25s_ease-out_forwards] motion-reduce:animate-none motion-reduce:opacity-100"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeCustomiser();
        }
      }}
    >
      <section
        className="w-full max-w-[480px] h-screen h-[100dvh] overflow-y-auto bg-[var(--pex-bg)] [box-shadow:var(--shadow-drawer)] flex flex-col animate-[slideInTray_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards] motion-reduce:animate-none motion-reduce:transform-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pack-customiser-title"
        aria-describedby="pack-customiser-instructions"
        ref={drawerRef}
        tabIndex={-1}
      >
        <div className="sticky top-0 z-[3] p-[clamp(16px,3vw,24px)] max-md:pt-[max(var(--space-4),env(safe-area-inset-top))] border-b border-[var(--pex-border)] bg-white/96 backdrop-blur-md grid grid-cols-[1fr_auto] gap-[var(--space-4)] items-start">
          <div>
            <p className="m-0 mb-1 text-[var(--pex-keppel)] text-[var(--text-2xs)] font-extrabold">
              {pack.schoolName} &ndash; {pack.grade}
            </p>
            <h2
              id="pack-customiser-title"
              className="m-0 text-[var(--pex-primary)] font-heading text-[clamp(24px,3.5vw,32px)] font-extrabold leading-none"
            >
              Customise This Pack
            </h2>
            <span
              id="pack-customiser-instructions"
              className="block mt-1.5 text-[var(--pex-text-muted)] text-[var(--text-sm)] font-semibold"
            >
              Untick what you already have and order the rest.
            </span>
          </div>
          <button
            type="button"
            className="w-[44px] h-[44px] border border-[var(--pex-border)] rounded-full bg-[var(--pex-bg)] text-[var(--pex-primary)] text-2xl leading-none p-0 box-border shrink-0 cursor-pointer grid place-items-center transition-[var(--interactive-transition)] hover:border-[var(--pex-keppel)] hover:text-[var(--pex-keppel)] focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px] motion-reduce:transition-none"
            onClick={closeCustomiser}
            aria-label="Close custom pack builder"
            ref={closeButtonRef}
          >
            &times;
          </button>
        </div>

        <div className="p-[clamp(16px,3vw,24px)] grid gap-3.5 flex-1">
          <div
            className="border border-[var(--color-navy-subtle)] rounded-[var(--radius-card)] bg-[var(--pex-bg-soft)] p-[18px_20px] grid gap-[var(--space-2)]"
            aria-live="polite"
          >
            <div>
              <span className="block text-[var(--pex-keppel)] text-[var(--text-2xs)] font-extrabold">
                Estimated total
              </span>
              <strong className="block text-[var(--pex-primary)] text-[clamp(26px,4vw,36px)] font-extrabold leading-none">
                {displayedTotal}
              </strong>
            </div>
            <p className="m-0 text-[var(--pex-text-muted)] text-[var(--text-sm)] leading-[1.45]">
              Updates as you untick items or adjust quantities.
            </p>
          </div>

          {selection.length ? (
            <div className="grid gap-2.5">
              {selection.map((item) => {
                return (
                  <article
                    className="border border-[var(--color-navy-subtle)] rounded-[var(--radius-card)] bg-[var(--pex-bg-soft)] p-3.5 grid grid-cols-[1fr_auto] max-md:grid-cols-1 gap-3.5 items-center"
                    key={item.id}
                  >
                    <label className="min-w-0 flex items-start gap-[var(--space-3)] cursor-pointer">
                      <input
                        id={`custom-pack-item-${item.id}`}
                        name={`customPackItem-${item.id}`}
                        type="checkbox"
                        checked={item.selected}
                        onChange={(event) =>
                          setItemSelected(item.id, event.target.checked)
                        }
                        className="w-[22px] h-[22px] mt-0.5 accent-[var(--pex-coral)] focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2"
                      />
                      <span>
                        <span className="block text-[var(--pex-keppel)] text-xs font-extrabold uppercase tracking-[0.3px] mb-0.5">
                          {item.category}
                        </span>
                        <span className="block text-[var(--pex-primary)] font-extrabold text-[var(--text-base)] leading-[1.2]">
                          {item.name}
                        </span>
                        {item.description ? (
                          <span className="block mt-[3px] text-[var(--pex-text-muted)] text-[var(--text-2xs)] leading-[1.4]">
                            {item.description}
                          </span>
                        ) : null}
                        <span className="block mt-1 text-[var(--pex-text-muted)] text-[var(--text-2xs)]">
                          School requires:{" "}
                          {String(item.requiredQuantity).padStart(2, "0")}
                        </span>
                      </span>
                    </label>
                    <div className="inline-flex gap-1 items-center">
                      <button
                        type="button"
                        className="w-7 h-7 border border-[var(--pex-border)] rounded-[6px] bg-[var(--pex-bg)] text-[var(--pex-text)] text-sm font-bold cursor-pointer transition-colors duration-140 hover:bg-[var(--pex-bg-subtle)] focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2"
                        onClick={() =>
                          setItemQuantity(item.id, item.selectedQuantity - 1)
                        }
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        -
                      </button>
                      <span className="mx-2 text-[var(--text-base)] font-semibold text-[var(--pex-primary)]">
                        {item.selectedQuantity}
                      </span>
                      <button
                        type="button"
                        className="w-7 h-7 border border-[var(--pex-border)] rounded-[6px] bg-[var(--pex-bg)] text-[var(--pex-text)] text-sm font-bold cursor-pointer transition-colors duration-140 hover:bg-[var(--pex-bg-subtle)] focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2"
                        onClick={() =>
                          setItemQuantity(item.id, item.selectedQuantity + 1)
                        }
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--pex-text-muted)] border border-dashed border-[var(--pex-border)] rounded-[var(--radius-card)] bg-[var(--pex-bg-soft)] flex flex-col gap-2 items-center">
              <p>Pack details are being finalised.</p>
              <strong>
                Request this pack and we will confirm the list with you.
              </strong>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-[4] mt-auto p-[var(--space-4)_clamp(16px,3vw,24px)] pb-[calc(var(--space-4)+env(safe-area-inset-bottom,0px))] border-t border-[var(--pex-border)] bg-white/96 [box-shadow:0_-16px_34px_rgba(15,37,55,0.08)] backdrop-blur-md grid gap-[var(--space-3)]">
          <div className="grid gap-[3px]" aria-live="polite">
            <strong className="text-[var(--pex-primary)] text-[var(--text-xl)] font-bold">
              Estimated total: {displayedTotal}
            </strong>
            {selectedCount === 0 ? (
              <span className="text-[var(--pex-text-muted)] text-[var(--text-sm)] font-bold">
                Select at least one item to continue.
              </span>
            ) : null}
          </div>
          <button
            type="button"
            className="w-full min-h-[52px] border-0 rounded-[var(--radius-pill)] px-5 bg-[var(--pex-coral)] text-white text-[17px] font-extrabold flex items-center justify-center gap-[var(--space-2)] transition-[var(--button-transition)] hover:brightness-110 hover:[transform:var(--button-hover-transform)] hover:[box-shadow:var(--button-hover-shadow)] active:brightness-100 active:[transform:var(--button-active-transform)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:filter-none disabled:shadow-none focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px] motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:hover:filter-none motion-reduce:hover:shadow-none"
            onClick={handleSaveCustomPack}
            disabled={selectedCount === 0 || isPricingTotal}
          >
            Add Customised Pack
          </button>
          <button
            type="button"
            className="w-full min-h-[48px] border border-[var(--pex-border)] rounded-[var(--radius-pill)] px-5 bg-[var(--pex-bg)] text-[var(--pex-primary)] text-[15px] font-bold flex items-center justify-center gap-[var(--space-2)] transition-[var(--button-transition)] hover:border-[var(--pex-keppel)] hover:text-[var(--pex-keppel)] hover:[transform:var(--button-hover-transform)] focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px] motion-reduce:transition-none motion-reduce:hover:transform-none"
            onClick={resetToFullPack}
          >
            Reset to Full Pack
          </button>
        </div>
      </section>
    </div>
  ) : null;

  if (layout === "detail") {
    return (
      <div className="bg-[var(--pex-bg)] border border-[var(--color-navy-subtle)] rounded-[28px] [box-shadow:0_10px_30px_rgba(26,42,64,0.04)] p-[var(--space-6)] max-[480px]:p-[var(--space-5)] flex flex-col gap-[var(--space-5)] max-[480px]:gap-5">
        <div className="flex items-baseline justify-between gap-[var(--space-4)] border-b border-dashed border-[var(--color-navy-subtle)] pb-5 max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-2.5">
          <strong className="text-[38px] max-[480px]:text-[32px] font-extrabold text-[var(--pex-primary)] leading-none">
            {formatCurrency(pack.fullPackPrice ?? 0)}
          </strong>
        </div>

        <div className="flex flex-col gap-3.5">
          <Button
            type="button"
            size="lg"
            className="w-full min-h-[54px] relative justify-center text-[var(--text-lg)] px-[var(--space-5)]"
            onClick={handleAddFullPack}
          >
            Add Full Pack
          </Button>
          <Button
            id={`customise-${pack.id}`}
            type="button"
            variant="outline"
            size="lg"
            className="w-full min-h-[54px] relative justify-center text-[var(--text-lg)] px-[var(--space-5)]"
            onClick={(event) => {
              triggerButtonRef.current = event.currentTarget;
              trackCustomiserOpened({
                school: pack.schoolName,
                grade: pack.grade,
              });
              setIsOpen(true);
            }}
          >
            Customise This Pack
          </Button>
        </div>

        {showDownloadLink ? (
          <div className="flex justify-start pt-1">
            <DownloadListLink
              pdfOptions={{
                schoolName: pack.schoolName,
                grade: pack.grade,
                items: pdfItems,
                estimatedPrice: formatCurrency(pack.fullPackPrice ?? 0),
                fileName: `${pack.schoolSlug}-${pack.gradeSlug}`,
              }}
              className="text-[var(--pex-navy)] text-[15px] font-bold underline underline-offset-4 inline-flex items-center gap-[var(--space-2)] transition-[var(--interactive-transition)] hover:text-[var(--pex-keppel)]"
            >
              {downloadLabel}
            </DownloadListLink>
          </div>
        ) : null}

        {isMounted && drawerContent && portalContainer.current
          ? createPortal(drawerContent, portalContainer.current)
          : null}
      </div>
    );
  }

  return (
    <div className="grid gap-2.5">
      {showMicrocopy ? (
        <p className="m-0 text-[var(--pex-text-muted)] text-[15px] leading-[1.45]">
          Buy the full pack for convenience, or customise it and only order what
          your child still needs.
        </p>
      ) : null}
      <div className="grid gap-2.5 [&>*]:w-full [&>*]:min-h-[40px]">
        <Button type="button" size="sm" onClick={handleAddFullPack}>
          Add Full Pack
        </Button>
        <Button
          id={`customise-${pack.id}`}
          type="button"
          variant="outline"
          size="sm"
          onClick={(event) => {
            triggerButtonRef.current = event.currentTarget;
            trackCustomiserOpened({
              school: pack.schoolName,
              grade: pack.grade,
            });
            setIsOpen(true);
          }}
        >
          Customise This Pack
        </Button>
      </div>
      {showDownloadLink ? (
        <DownloadListLink
          pdfOptions={{
            schoolName: pack.schoolName,
            grade: pack.grade,
            items: pdfItems,
            estimatedPrice: formatCurrency(pack.fullPackPrice ?? 0),
            fileName: `${pack.schoolSlug}-${pack.gradeSlug}`,
          }}
        >
          {downloadLabel}
        </DownloadListLink>
      ) : null}

      {isMounted && drawerContent && portalContainer.current
        ? createPortal(drawerContent, portalContainer.current)
        : null}
    </div>
  );
}
