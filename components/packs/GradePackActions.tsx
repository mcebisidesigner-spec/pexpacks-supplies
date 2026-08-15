"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  calculateItemLineTotal,
  calculatePackTotal,
} from "@/lib/packs/calculatePackTotal";
import {
  createCustomPackSelection,
  createFullPackSelection,
} from "@/lib/packs/createPackSelection";
import { useDialogFocusTrap } from "./useDialogFocusTrap";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { createFullTrayPack } from "@/lib/order/createTrayPack";
import { trackInitiatePreOrder } from "@/lib/analytics";
import type {
  GradePackForCustomisation,
  PackSelectionItem,
} from "@/lib/packs/types";
import { DownloadListLink } from "./DownloadListLink";
import styles from "./PackCustomiser.module.css";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const addPack = usePackTrayStore((s) => s.addPack);
  const openTray = usePackTrayStore((s) => s.openTray);

  // Stabilise the items reference to prevent infinite re-render loops.
  // Only recalculate when the serialised item list actually changes.
  const itemsKey = useMemo(
    () =>
      pack.items
        .map((i) => `${i.id}:${i.requiredQuantity}:${i.unitPrice ?? ""}`)
        .join(","),
    [pack.items],
  );

  const [selection, setSelection] = useState<PackSelectionItem[]>(() =>
    createCustomPackSelection(pack.items),
  );

  const selectedItems = selection.filter(
    (item) => item.selected && item.selectedQuantity > 0,
  );
  const total = useMemo(() => calculatePackTotal(selection) ?? 0, [selection]);
  const displayedTotal = total > 0 ? formatItemCurrency(total) : "R 0";
  const selectedCount = selectedItems.length;
  const pdfItems = pack.items.map((item) => ({
    name: item.name,
    quantity: item.requiredQuantity,
    description: item.description,
    specification: item.specification,
  }));

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
    const trayItems: Array<{ id: string; name: string; category?: string; quantity: number; unitPrice?: number }> = [];
    const customTotal = calculatePackTotal(selection) ?? 0;

    selection.forEach((item) => {
      if (item.selected && item.selectedQuantity > 0) {
        trayItems.push({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.selectedQuantity,
          unitPrice: item.unitPrice,
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
      modifications: Object.keys(modifications).length > 0 ? modifications : undefined,
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
  }, [selectedCount, selection, pack, addPack, closeCustomiser, openTray]);

  // Mount check for portal rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-open drawer when customize=1 is in the URL
  useEffect(() => {
    if (autoCustomise && isMounted) {
      setIsOpen(true);
    }
  }, [autoCustomise, isMounted]);

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
  }

  function setItemQuantity(id: string, quantity: number) {
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
  }

  function resetToFullPack() {
    setSelection(createFullPackSelection(pack.items));
  }

  const drawerContent = isOpen ? (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeCustomiser();
        }
      }}
    >
      <section
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pack-customiser-title"
        aria-describedby="pack-customiser-instructions"
        ref={drawerRef}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <div>
            <p>
              {pack.schoolName} &ndash; {pack.grade}
            </p>
            <h2 id="pack-customiser-title">Customise This Pack</h2>
            <span id="pack-customiser-instructions">
              Untick what you already have and order the rest.
            </span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeCustomiser}
            aria-label="Close custom pack builder"
            ref={closeButtonRef}
          >
            &times;
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.summaryCard} aria-live="polite">
            <div>
              <span className={styles.summaryLabel}>Estimated total</span>
              <strong className={styles.summaryValue}>{displayedTotal}</strong>
            </div>
            <p className={styles.quoteNote}>
              Updates as you untick items or adjust quantities.
            </p>
          </div>

          {selection.length ? (
            <div className={styles.itemList}>
              {selection.map((item) => {
                const itemTotal =
                  item.selectedQuantity > 0 &&
                  typeof item.unitPrice === "number"
                    ? calculateItemLineTotal(
                        item.unitPrice,
                        item.selectedQuantity,
                      )
                    : undefined;

                return (
                  <article className={styles.itemRow} key={item.id}>
                    <label className={styles.itemCheckbox}>
                      <input
                        id={`custom-pack-item-${item.id}`}
                        name={`customPackItem-${item.id}`}
                        type="checkbox"
                        checked={item.selected}
                        onChange={(event) =>
                          setItemSelected(item.id, event.target.checked)
                        }
                      />
                      <span>
                        <span className={styles.itemCategory}>
                          {item.category}
                        </span>
                        <span className={styles.itemName}>{item.name}</span>
                        {item.description ? (
                          <span className={styles.itemDescription}>
                            {item.description}
                          </span>
                        ) : null}
                        <span className={styles.itemMeta}>
                          School requires: {item.requiredQuantity}
                          {typeof item.unitPrice === "number"
                            ? ` - ${formatItemCurrency(item.unitPrice)} each`
                            : ""}
                        </span>
                        {typeof itemTotal === "number" ? (
                          <span className={styles.lineTotal}>
                            Line total: {formatItemCurrency(itemTotal)}
                          </span>
                        ) : null}
                      </span>
                    </label>
                    <div className={styles.qtyControls}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => setItemQuantity(item.id, item.selectedQuantity - 1)}
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          -
                        </button>
                        <span className={styles.qtyValue}>
                          {item.selectedQuantity}
                        </span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => setItemQuantity(item.id, item.selectedQuantity + 1)}
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
            <div className={styles.emptyState}>
              <p>Pack details are being finalised.</p>
              <strong>
                Request this pack and we will confirm the list with you.
              </strong>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerSummary} aria-live="polite">
            <strong>Estimated total: {displayedTotal}</strong>
            {selectedCount === 0 ? (
              <span>Select at least one item to continue.</span>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSaveCustomPack}
            disabled={selectedCount === 0}
          >
            Add to Order
          </button>
          <button
            type="button"
            className={styles.resetButton}
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
      <div className={styles.actionsCard}>
        <div className={styles.priceRow}>
          <strong className={styles.detailPrice}>
            {formatCurrency(pack.fullPackPrice ?? 0)}
          </strong>
        </div>

        <div className={styles.detailActionRow}>
          <Button
            type="button"
            size="lg"
            className={styles.detailButton}
            onClick={handleAddFullPack}
          >
            Add to Order
          </Button>
          <Button
            id={`customise-${pack.id}`}
            type="button"
            variant="outline"
            size="lg"
            className={styles.detailButton}
            onClick={(event) => {
              triggerButtonRef.current = event.currentTarget;
              setIsOpen(true);
            }}
          >
            Customise This Pack
          </Button>
        </div>

        {showDownloadLink ? (
          <div className={styles.downloadLinkWrapper}>
            <DownloadListLink
              pdfOptions={{
                schoolName: pack.schoolName,
                grade: pack.grade,
                items: pdfItems,
                estimatedPrice: formatCurrency(
                  pack.items.reduce(
                    (sum, item) =>
                      sum + (item.unitPrice ?? 0) * item.requiredQuantity,
                    0,
                  ),
                ),
                fileName: `${pack.schoolSlug}-${pack.gradeSlug}`,
              }}
              className={styles.downloadLink}
            >
              {downloadLabel}
            </DownloadListLink>
          </div>
        ) : null}

        {isMounted && drawerContent
          ? createPortal(drawerContent, document.body)
          : null}
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      {showMicrocopy ? (
        <p className={styles.microcopy}>
          Buy the full pack for convenience, or customise it and only order what
          your child still needs.
        </p>
      ) : null}
      <div className={styles.actionRow}>
        <Button type="button" size="sm" onClick={handleAddFullPack}>
          Add to Order
        </Button>
        <Button
          id={`customise-${pack.id}`}
          type="button"
          variant="outline"
          size="sm"
          onClick={(event) => {
            triggerButtonRef.current = event.currentTarget;
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
            estimatedPrice: formatCurrency(
              pack.items.reduce(
                (sum, item) =>
                  sum + (item.unitPrice ?? 0) * item.requiredQuantity,
                0,
              ),
            ),
            fileName: `${pack.schoolSlug}-${pack.gradeSlug}`,
          }}
        >
          {downloadLabel}
        </DownloadListLink>
      ) : null}

      {isMounted && drawerContent
        ? createPortal(drawerContent, document.body)
        : null}
    </div>
  );
}
