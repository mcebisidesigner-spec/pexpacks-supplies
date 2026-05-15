"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculatePackTotal } from "@/lib/packs/calculatePackTotal";
import {
  createCustomPackSelection,
  createFullPackSelection,
  serialiseRemovedItems,
  serialiseSelectedItems,
} from "@/lib/packs/createPackSelection";
import type {
  GradePackForCustomisation,
  PackSelectionItem,
} from "@/lib/packs/types";
import styles from "./PackCustomiser.module.css";

type GradePackActionsProps = {
  pack: GradePackForCustomisation;
  showDownloadLink?: boolean;
  showMicrocopy?: boolean;
};

function buildFullPackHref(pack: GradePackForCustomisation) {
  const params = new URLSearchParams({
    school: pack.schoolSlug,
    grade: pack.gradeSlug,
    type: "full-school",
  });

  return `/order?${params.toString()}#checkout-form`;
}

function buildCustomPackHref(
  pack: GradePackForCustomisation,
  items: PackSelectionItem[],
  total?: number
) {
  const params = new URLSearchParams({
    school: pack.schoolSlug,
    grade: pack.gradeSlug,
    type: "custom-school",
    items: serialiseSelectedItems(items),
    removed: serialiseRemovedItems(items),
  });

  if (typeof total === "number") {
    params.set("total", String(total));
  }

  return `/order?${params.toString()}#checkout-form`;
}

export function GradePackActions({
  pack,
  showDownloadLink = true,
  showMicrocopy = true,
}: GradePackActionsProps) {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selection, setSelection] = useState<PackSelectionItem[]>(() =>
    createCustomPackSelection(pack.items)
  );

  const selectedItems = selection.filter(
    (item) => item.selected && item.selectedQuantity > 0
  );
  const total = useMemo(() => calculatePackTotal(selection) ?? 0, [selection]);
  const displayedTotal = total > 0 ? formatCurrency(total) : "R 0";
  const selectedCount = selectedItems.length;
  const listText = [
    `${pack.schoolName} ${pack.grade} Stationery Pack`,
    "",
    ...pack.items.map((item) => `- ${item.requiredQuantity} x ${item.name}`),
  ].join("\n");
  const downloadHref = `data:text/plain;charset=utf-8,${encodeURIComponent(
    listText
  )}`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.getElementById(`customise-${pack.id}`)?.focus();
    };
  }, [isOpen, pack.id]);

  useEffect(() => {
    setSelection(createCustomPackSelection(pack.items));
  }, [pack.items]);

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
          : item
      )
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
          : item
      )
    );
  }

  function resetToFullPack() {
    setSelection(createFullPackSelection(pack.items));
  }

  function requestCustomPack() {
    if (selectedCount === 0) {
      return;
    }

    router.push(buildCustomPackHref(pack, selection, total));
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
          onClick={() => setIsOpen(true)}
        >
          Customise This Pack
        </Button>
      </div>
      {showDownloadLink ? (
        <a
          className={styles.downloadLink}
          href={downloadHref}
          download={`${pack.schoolSlug}-${pack.gradeSlug}-stationery-list.txt`}
        >
          Download List
        </a>
      ) : null}

      {isOpen ? (
        <div
          className={styles.overlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pack-customiser-title"
          >
            <div className={styles.header}>
              <div>
                <p>
                  {pack.schoolName} - {pack.grade}
                </p>
                <h2 id="pack-customiser-title">Customise This Pack</h2>
                <span>Untick what you already have and order the rest.</span>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close custom pack builder"
                ref={closeButtonRef}
              >
                ×
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.summaryCard} aria-live="polite">
                <div>
                  <span className={styles.summaryLabel}>Estimated total</span>
                  <strong className={styles.summaryValue}>
                    {displayedTotal}
                  </strong>
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
                            <span className={styles.itemName}>
                              {item.name}
                            </span>
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
      ) : null}
    </div>
  );
}
