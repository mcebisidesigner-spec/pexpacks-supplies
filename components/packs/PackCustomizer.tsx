"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useDialogFocusTrap } from "@/components/packs/useDialogFocusTrap";
import { customPackAddOns } from "@/data/packAddOns";
import { formatCurrency } from "@/lib/formatCurrency";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import type { GradePackTemplate } from "@/data/phasePacks";
import styles from "./PackCustomiser.module.css";

type PackCustomizerProps = {
  phaseSlug: string;
  gradePack: GradePackTemplate;
  onCancel?: () => void;
};

function buildInitialQuantities(gradePack: GradePackTemplate) {
  return gradePack.items.reduce<Record<string, number>>(
    (acc, item) => ({ ...acc, [item.id]: item.quantity }),
    {}
  );
}

export function PackCustomizer({
  phaseSlug,
  gradePack,
  onCancel,
}: PackCustomizerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const addPack = usePackTrayStore((s) => s.addPack);
  const openTray = usePackTrayStore((s) => s.openTray);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    buildInitialQuantities(gradePack)
  );
  const closeCustomiser = useCallback(() => onCancel?.(), [onCancel]);

  useEffect(() => {
    setQuantities(buildInitialQuantities(gradePack));
  }, [gradePack]);

  useDialogFocusTrap({
    isOpen: true,
    dialogRef: drawerRef,
    initialFocusRef: closeButtonRef,
    onClose: closeCustomiser,
  });

  const handleQuantityChange = (id: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  };

  const setItemSelected = (
    id: string,
    selected: boolean,
    baseQuantity: number
  ) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: selected ? (prev[id] > 0 ? prev[id] : baseQuantity) : 0,
    }));
  };

  const totalPrice = useMemo(() => {
    let total = gradePack.priceFrom;

    gradePack.items.forEach((item) => {
      const baseQty = item.quantity;
      const currentQty = quantities[item.id] || 0;
      const diff = currentQty - baseQty;
      const price = item.unitPrice || 0;
      total += diff * price;
    });

    customPackAddOns.forEach((item) => {
      const currentQty = quantities[item.id] || 0;
      const price = item.unitPrice || 0;
      total += currentQty * price;
    });

    return Math.max(0, total);
  }, [gradePack, quantities]);

  const standardListItems = useMemo(() => gradePack.items, [gradePack.items]);

  const selectedCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSaveToOrder = useCallback(() => {
    if (selectedCount === 0) return;

    const items: Array<{ id: string; name: string; category?: string; quantity: number; unitPrice?: number }> = [];
    const modifications: Record<string, number> = {};

    gradePack.items.forEach((item) => {
      const qty = quantities[item.id] || 0;
      if (qty > 0) {
        items.push({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: qty,
          unitPrice: item.unitPrice,
        });
      }
      if (qty !== item.quantity) {
        modifications[item.id] = qty;
      }
    });

    const addOnItems: Array<{ id: string; name: string; category?: string; quantity: number; unitPrice?: number }> = [];
    customPackAddOns.forEach((item) => {
      const qty = quantities[item.id] || 0;
      if (qty > 0) {
        addOnItems.push({
          id: item.id,
          name: item.name,
          category: item.category || "Add-ons",
          quantity: qty,
          unitPrice: item.unitPrice,
        });
      }
    });

    const now = new Date().toISOString();
    const packId = `phase-${gradePack.id}-${Date.now()}`;

    addPack({
      id: packId,
      packId: gradePack.id,
      basePackId: gradePack.id,
      packName: gradePack.title,
      schoolName: phaseSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      grade: gradePack.grade,
      gradeSlug: gradePack.id,
      learnerName: "",
      packMode: "customised",
      items: items.map((item) => ({
        id: item.id,
        itemId: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice ? item.unitPrice * item.quantity : undefined,
      })),
      modifications: Object.keys(modifications).length > 0 ? modifications : undefined,
      addOns: addOnItems.length > 0
        ? addOnItems.map((item) => ({
            id: item.id,
            itemId: item.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.unitPrice ? item.unitPrice * item.quantity : undefined,
          }))
        : undefined,
      subtotal: totalPrice,
      totalPrice,
      sourcePath: window.location.pathname,
      createdAt: now,
      updatedAt: now,
    });

    closeCustomiser();
    openTray();
  }, [selectedCount, quantities, gradePack, totalPrice, phaseSlug, addPack, closeCustomiser, openTray]);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel?.();
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
            <p>{gradePack.title}</p>
            <h2 id="pack-customiser-title">Customise This Pack</h2>
            <span id="pack-customiser-instructions" className={styles.headerSubtitle}>
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
              <strong className={styles.summaryValue}>
                {formatCurrency(totalPrice)}
              </strong>
            </div>
            <p className={styles.quoteNote}>
              Updates as you untick items or adjust quantities.
            </p>
          </div>

          <div className={styles.itemList}>
            {standardListItems.map((item) => {
              const currentQty = quantities[item.id] || 0;
              const isSelected = currentQty > 0;
              const itemTotal =
                isSelected && item.unitPrice ? item.unitPrice * currentQty : 0;

              return (
                <article className={styles.itemRow} key={item.id}>
                  <label className={styles.itemCheckbox}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) =>
                        setItemSelected(
                          item.id,
                          event.target.checked,
                          item.quantity
                        )
                      }
                    />
                    <span>
                      <span className={styles.itemCategory}>
                        {item.category || "Stationery"}
                      </span>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemMeta}>
                        Required quantity: {item.quantity}
                        {item.unitPrice
                          ? ` - ${formatCurrency(item.unitPrice)} each`
                          : ""}
                      </span>
                      {itemTotal > 0 ? (
                        <span className={styles.lineTotal}>
                          Line total: {formatCurrency(itemTotal)}
                        </span>
                      ) : null}
                    </span>
                  </label>
                  <QuantityStepper
                    value={currentQty}
                    onChange={(value) => handleQuantityChange(item.id, value)}
                    ariaLabel={`quantity for ${item.name}`}
                  />
                </article>
              );
            })}

            {customPackAddOns.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p
                  style={{
                    margin: "0 0 12px",
                    color: "var(--pex-keppel)",
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  Optional extras
                </p>
                <div style={{ display: "grid", gap: 10 }}>
                  {customPackAddOns.map((item) => {
                    const currentQty = quantities[item.id] || 0;
                    const isSelected = currentQty > 0;
                    const itemTotal =
                      isSelected && item.unitPrice
                        ? item.unitPrice * currentQty
                        : 0;

                    return (
                      <article className={styles.itemRow} key={item.id}>
                        <label className={styles.itemCheckbox}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) =>
                              setItemSelected(item.id, event.target.checked, 1)
                            }
                          />
                          <span>
                            <span className={styles.itemCategory}>
                              {item.category}
                            </span>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemMeta}>
                              {item.specification
                                ? `${item.specification} - `
                                : ""}
                              {item.unitPrice
                                ? `${formatCurrency(item.unitPrice)} each`
                                : ""}
                            </span>
                            {itemTotal > 0 ? (
                              <span className={styles.lineTotal}>
                                Line total: {formatCurrency(itemTotal)}
                              </span>
                            ) : null}
                          </span>
                        </label>
                        <QuantityStepper
                          value={currentQty}
                          onChange={(value) =>
                            handleQuantityChange(item.id, value)
                          }
                          ariaLabel={`quantity for ${item.name}`}
                        />
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerSummary} aria-live="polite">
            <strong>Estimated total: {formatCurrency(totalPrice)}</strong>
            {selectedCount === 0 ? (
              <span>Select at least one item to continue.</span>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.submitButton}
            onClick={handleSaveToOrder}
            disabled={selectedCount === 0}
          >
            Add to Order
          </button>
          <button
            type="button"
            className={styles.resetButton}
            onClick={() => setQuantities(buildInitialQuantities(gradePack))}
          >
            Reset to Full Pack
          </button>
        </div>
      </section>
    </div>
  );
}
