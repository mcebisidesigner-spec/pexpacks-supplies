"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatCurrency } from "@/lib/formatCurrency";
import { saveOrderDraft } from "@/lib/order/orderDraft";
import { calculatePackTotal } from "@/lib/packs/calculatePackTotal";
import {
  createCustomPackSelection,
  createFullPackSelection,
  serialiseRemovedItems,
  serialiseSelectedItems,
} from "@/lib/packs/createPackSelection";
import { useDialogFocusTrap } from "./useDialogFocusTrap";
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
};

export function buildFullPackHref(pack: GradePackForCustomisation) {
  const params = new URLSearchParams({
    school: pack.schoolSlug,
    grade: pack.gradeSlug,
  });

  return `/checkout?${params.toString()}`;
}

function buildCustomPackHref(pack: GradePackForCustomisation, draftId: string) {
  const params = new URLSearchParams({
    school: pack.schoolSlug,
    grade: pack.gradeSlug,
    type: "custom-school",
    draft: draftId,
  });

  return `/order?${params.toString()}#checkout-form`;
}

export function GradePackActions({
  pack,
  showDownloadLink = true,
  showMicrocopy = true,
  layout = "compact",
  downloadLabel = "Download list (PDF)",
}: GradePackActionsProps) {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Stabilise the items reference to prevent infinite re-render loops.
  // Only recalculate when the serialised item list actually changes.
  const itemsKey = useMemo(
    () => pack.items.map((i) => `${i.id}:${i.requiredQuantity}`).join(","),
    [pack.items],
  );

  const [selection, setSelection] = useState<PackSelectionItem[]>(() =>
    createCustomPackSelection(pack.items),
  );

  const selectedItems = selection.filter(
    (item) => item.selected && item.selectedQuantity > 0,
  );
  const total = useMemo(() => calculatePackTotal(selection) ?? 0, [selection]);
  const displayedTotal = total > 0 ? formatCurrency(total) : "R 0";
  const selectedCount = selectedItems.length;
  const pdfItems = pack.items.map((item) => ({
    name: item.name,
    quantity: item.requiredQuantity,
    specification: "",
  }));

  const closeCustomiser = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => {
      triggerButtonRef.current?.focus();
    }, 0);
  }, []);

  // Mount check for portal rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  function requestCustomPack() {
    if (selectedCount === 0) {
      return;
    }

    const draft = saveOrderDraft({
      schoolSlug: pack.schoolSlug,
      gradeSlug: pack.gradeSlug,
      grade: pack.grade,
      type: "custom-school",
      selectedItems: serialiseSelectedItems(selection),
      removedItems: serialiseRemovedItems(selection),
      estimatedTotal: total,
    });

    router.push(buildCustomPackHref(pack, draft.id));
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
                    ? item.unitPrice * item.selectedQuantity
                    : undefined;

                return (
                  <article className={styles.itemRow} key={item.id}>
                    <label className={styles.itemCheckbox}>
                      <input
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
                        <span className={styles.itemMeta}>
                          Required quantity: {item.requiredQuantity}
                          {typeof item.unitPrice === "number"
                            ? ` - ${formatCurrency(item.unitPrice)} each`
                            : ""}
                        </span>
                        {typeof itemTotal === "number" ? (
                          <span className={styles.lineTotal}>
                            Line total: {formatCurrency(itemTotal)}
                          </span>
                        ) : null}
                      </span>
                    </label>
                    <QuantityStepper
                      value={item.selectedQuantity}
                      onChange={(value) => setItemQuantity(item.id, value)}
                      ariaLabel={`quantity for ${item.name}`}
                    />
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
            className={styles.resetButton}
            onClick={resetToFullPack}
          >
            Reset to Full Pack
          </button>
          <button
            type="button"
            className={styles.submitButton}
            onClick={requestCustomPack}
            disabled={selectedCount === 0}
          >
            Continue to checkout
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
            href={buildFullPackHref(pack)}
            size="lg"
            className={styles.detailButton}
          >
            Buy Full Pack
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
        <Button href={buildFullPackHref(pack)} size="sm">
          Buy Full Pack
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
