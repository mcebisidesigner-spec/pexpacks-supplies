"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { formatCurrency } from "@/lib/formatCurrency";
import type { GradePackTemplate, StationeryItem } from "@/data/phasePacks";
import styles from "./PackCustomizer.module.css";

type PackCustomizerProps = {
  phaseSlug: string;
  gradePack: GradePackTemplate;
  onCancel?: () => void;
};

const addOnStationeryItems: StationeryItem[] = [
  {
    id: "addon-coloured-pencils",
    name: "Coloured Pencils",
    quantity: 0,
    specification: "12 Pack",
    category: "Brand Upgrades",
    icon: "pencil",
    unitPrice: 55,
  },
  {
    id: "addon-black-pens",
    name: "Black Ballpoint Pens",
    quantity: 0,
    specification: "Pack of 4",
    category: "Brand Upgrades",
    icon: "pen",
    unitPrice: 45,
  },
  {
    id: "addon-highlighters",
    name: "Highlighters",
    quantity: 0,
    specification: "Assorted Colours",
    category: "Brand Upgrades",
    icon: "highlighter",
    unitPrice: 25,
  },
  {
    id: "addon-exam-pad",
    name: "A4 Exam Pad",
    quantity: 0,
    specification: "100 page punched",
    category: "Core Essentials",
    icon: "pad",
    unitPrice: 35,
  },
  {
    id: "addon-plastic-sleeves",
    name: "Plastic Sleeves",
    quantity: 0,
    specification: "Pack of 10",
    category: "Durables",
    icon: "file",
    unitPrice: 35,
  },
  {
    id: "addon-lever-arch-file",
    name: "Lever Arch File",
    quantity: 0,
    specification: "A4",
    category: "Durables",
    icon: "file",
    unitPrice: 60,
  },
  {
    id: "addon-calculator",
    name: "Scientific Calculator",
    quantity: 0,
    category: "Durables",
    icon: "calculator",
    unitPrice: 350,
  },
  {
    id: "addon-glue-stick",
    name: "Glue Stick",
    quantity: 0,
    specification: "40g",
    category: "Core Essentials",
    icon: "glue",
    unitPrice: 35,
  },
];

function buildInitialQuantities(gradePack: GradePackTemplate) {
  return [...gradePack.items, ...addOnStationeryItems].reduce<Record<string, number>>(
    (acc, item) => ({ ...acc, [item.id]: item.quantity }),
    {}
  );
}

export function PackCustomizer({ phaseSlug, gradePack, onCancel }: PackCustomizerProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>(() => buildInitialQuantities(gradePack));

  useEffect(() => {
    setQuantities(buildInitialQuantities(gradePack));
  }, [gradePack]);

  const handleQuantityChange = (id: string, value: number) => {
    setQuantities((prev) => ({ ...prev, [id]: value }));
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

  const groupedItems = useMemo(() => {
    const groups: Record<string, StationeryItem[]> = {
      "Core Essentials": [],
      Durables: [],
      "Brand Upgrades": [],
    };

    gradePack.items.forEach((item) => {
      const category = item.category || "Core Essentials";
      if (groups[category]) {
        groups[category].push(item);
      } else {
        groups[category] = [item];
      }
    });

    return groups;
  }, [gradePack]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

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
    const customItems = [...standardItems, ...addOnItems].map((item) => `${item.quantity} x ${item.name}`).join("; ");

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

    router.push(`/order?${params.toString()}`);
  };

  return (
    <div className={styles.customizerContainer} id="pack-customizer">
      <div className={styles.customizerHeader}>
        <p>Custom pack builder</p>
        <h2>Customise your {gradePack.grade} pack</h2>
        <span>Review the standard requirements below. Adjust quantities, then continue to checkout.</span>
      </div>

      <form className={styles.formGrid} onSubmit={handleSubmit} id="customizer-form">
        <div className={styles.customizerItems}>
          <div className={styles.preloadBanner}>
            <div>
              <p>Standard pack loaded</p>
              <h3>{gradePack.title}</h3>
              <span>
                {gradePack.items.length} standard items are pre-populated below. Add extras first, then adjust the
                standard quantities if needed.
              </span>
            </div>
            <strong>{formatCurrency(gradePack.priceFrom)}</strong>
          </div>

          <section className={styles.addOnSection} aria-labelledby="custom-add-ons-title">
            <div className={styles.sectionBlockHeader}>
              <p>Optional extras</p>
              <h3 id="custom-add-ons-title">Add more stationery to this pack</h3>
            </div>
            <div className={styles.addOnGrid}>
              {addOnStationeryItems.map((item) => (
                <div key={item.id} className={`${styles.itemRow} ${styles.addOnRow}`}>
                  <div className={styles.itemInfoWrap}>
                    <div className={styles.itemIconBox}>
                      <ItemIcon name={item.icon} size={24} />
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      {item.specification ? <span className={styles.itemSpec}>{item.specification}</span> : null}
                      {item.unitPrice ? <span className={styles.itemPrice}>{formatCurrency(item.unitPrice)} each</span> : null}
                    </div>
                  </div>
                  <QuantityStepper
                    value={quantities[item.id] || 0}
                    onChange={(value) => handleQuantityChange(item.id, value)}
                    ariaLabel={`Quantity for ${item.name}`}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.standardSection} aria-labelledby="standard-items-title">
            <div className={styles.sectionBlockHeader}>
              <p>Preloaded standard list</p>
              <h3 id="standard-items-title">Standard items in your {gradePack.grade} pack</h3>
            </div>
            <div className={styles.standardGrid}>
              {Object.entries(groupedItems).map(([category, items]) => {
                if (items.length === 0) {
                  return null;
                }

                return (
                  <div key={category} className={styles.itemGroup}>
                    <h3 className={styles.itemGroupTitle}>{category}</h3>
                    <div className={styles.itemList}>
                      {items.map((item) => (
                        <div key={item.id} className={styles.itemRow}>
                          <div className={styles.itemInfoWrap}>
                            <div className={styles.itemIconBox}>
                              <ItemIcon name={item.icon} size={24} />
                            </div>
                            <div className={styles.itemInfo}>
                              <span className={styles.itemName}>{item.name}</span>
                              {item.specification ? <span className={styles.itemSpec}>{item.specification}</span> : null}
                            </div>
                          </div>
                          <QuantityStepper
                            value={quantities[item.id] || 0}
                            onChange={(value) => handleQuantityChange(item.id, value)}
                            ariaLabel={`Quantity for ${item.name}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </form>

      <div className={styles.stickyFooter}>
        <div className={styles.totalBlock}>
          <span className={styles.totalLabel}>Estimated total</span>
          <span className={styles.totalValue}>{formatCurrency(totalPrice)}</span>
        </div>
        <div className={styles.footerActions}>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" form="customizer-form">
            Continue to checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
