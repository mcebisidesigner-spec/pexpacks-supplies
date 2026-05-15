"use client";

import { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatCurrency } from "@/lib/formatCurrency";
import type { GradePackTemplate, StationeryItem } from "@/data/phasePacks";
import styles from "../packs/PackCustomiser.module.css";

type PackCustomizerProps = {
  phaseSlug: string;
  gradePack: GradePackTemplate;
  onCancel?: () => void;
};

const addOnStationeryItems: StationeryItem[] = [
  {
    id: "addon-coloured-pencils",
    name: "Coloured Pencils",
    quantity: 1, // Treat base as 1 so checkbox works logically
    specification: "12 Pack",
    category: "Brand Upgrades",
    icon: "pencil",
    unitPrice: 55,
  },
  {
    id: "addon-black-pens",
    name: "Black Ballpoint Pens",
    quantity: 1,
    specification: "Pack of 4",
    category: "Brand Upgrades",
    icon: "pen",
    unitPrice: 45,
  },
  {
    id: "addon-highlighters",
    name: "Highlighters",
    quantity: 1,
    specification: "Assorted Colours",
    category: "Brand Upgrades",
    icon: "highlighter",
    unitPrice: 25,
  },
  {
    id: "addon-exam-pad",
    name: "A4 Exam Pad",
    quantity: 1,
    specification: "100 page punched",
    category: "Core Essentials",
    icon: "pad",
    unitPrice: 35,
  },
  {
    id: "addon-plastic-sleeves",
    name: "Plastic Sleeves",
    quantity: 1,
    specification: "Pack of 10",
    category: "Durables",
    icon: "file",
    unitPrice: 35,
  },
  {
    id: "addon-lever-arch-file",
    name: "Lever Arch File",
    quantity: 1,
    specification: "A4",
    category: "Durables",
    icon: "file",
    unitPrice: 60,
  },
  {
    id: "addon-calculator",
    name: "Scientific Calculator",
    quantity: 1,
    category: "Durables",
    icon: "calculator",
    unitPrice: 350,
  },
  {
    id: "addon-glue-stick",
    name: "Glue Stick",
    quantity: 1,
    specification: "40g",
    category: "Core Essentials",
    icon: "glue",
    unitPrice: 35,
  },
];

function buildInitialQuantities(gradePack: GradePackTemplate) {
  // Only standard items start populated
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
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    buildInitialQuantities(gradePack)
  );

  useEffect(() => {
    setQuantities(buildInitialQuantities(gradePack));
  }, [gradePack]);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handleQuantityChange = (id: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, value) }));
  };

  const setItemSelected = (id: string, selected: boolean, baseQuantity: number) => {
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

    addOnStationeryItems.forEach((item) => {
      const currentQty = quantities[item.id] || 0;
      const price = item.unitPrice || 0;
      total += currentQty * price;
    });

    return Math.max(0, total);
  }, [gradePack, quantities]);

  const standardListItems = useMemo(
    () => gradePack.items,
    [gradePack.items]
  );

  const selectedCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  const handleSubmit = (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (selectedCount === 0) return;

    const standardItems = gradePack.items
      .map((item) => ({
        name: item.name,
        quantity: quantities[item.id] || 0,
      }))
      .filter((item) => item.quantity > 0);
    const addOnItems = addOnStationeryItems
      .map((item) => ({
        name: item.name,
        quantity: quantities[item.id] || 0,
      }))
      .filter((item) => item.quantity > 0);
    const customItems = [...standardItems, ...addOnItems]
      .map((item) => `${item.quantity} x ${item.name}`)
      .join("; ");

    const params = new URLSearchParams({
      phase: phaseSlug,
      pack: gradePack.id,
      grade: gradePack.grade,
      type: "custom",
      total: String(totalPrice),
    });

    if (customItems) {
      params.set("items", customItems);
    }

    router.push(`/order?${params.toString()}#checkout-form`);
  };

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
      >
        <div className={styles.header}>
          <div>
            <p>
              {gradePack.title}
            </p>
            <h2 id="pack-customiser-title">Customise This Pack</h2>
            <span>Untick what you already have and order the rest.</span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onCancel}
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
              const itemTotal = isSelected && item.unitPrice ? item.unitPrice * currentQty : 0;

              return (
                <article className={styles.itemRow} key={item.id}>
                  <label className={styles.itemCheckbox}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(event) => setItemSelected(item.id, event.target.checked, item.quantity)}
                    />
                    <span>
                      <span className={styles.itemCategory}>{item.category || "Stationery"}</span>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemMeta}>
                        Required quantity: {item.quantity}
                        {item.unitPrice ? ` - ${formatCurrency(item.unitPrice)} each` : ""}
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

            {/* Optional Add-Ons Section */}
            {addOnStationeryItems.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p style={{ margin: "0 0 12px", color: "var(--pex-keppel)", fontSize: 13, fontWeight: 800 }}>Optional extras</p>
                <div style={{ display: "grid", gap: 10 }}>
                  {addOnStationeryItems.map((item) => {
                    const currentQty = quantities[item.id] || 0;
                    const isSelected = currentQty > 0;
                    const itemTotal = isSelected && item.unitPrice ? item.unitPrice * currentQty : 0;

                    return (
                      <article className={styles.itemRow} key={item.id}>
                        <label className={styles.itemCheckbox}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => setItemSelected(item.id, event.target.checked, 1)}
                          />
                          <span>
                            <span className={styles.itemCategory}>{item.category}</span>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemMeta}>
                              {item.specification ? `${item.specification} - ` : ""}
                              {item.unitPrice ? `${formatCurrency(item.unitPrice)} each` : ""}
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
            className={styles.resetButton}
            onClick={() => setQuantities(buildInitialQuantities(gradePack))}
          >
            Reset to Full Pack
          </button>
          <button
            type="button"
            className={styles.submitButton}
            onClick={() => handleSubmit()}
            disabled={selectedCount === 0}
          >
            Continue to checkout
          </button>
        </div>
      </section>
    </div>
  );
}
