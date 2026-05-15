"use client";

import { useState, useMemo, FormEvent } from "react";
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

export function PackCustomizer({ phaseSlug, gradePack, onCancel }: PackCustomizerProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    gradePack.items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {})
  );

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("Collection");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleQuantityChange = (id: string, value: number) => {
    setQuantities(prev => ({ ...prev, [id]: value }));
  };

  const totalPrice = useMemo(() => {
    let total = gradePack.priceFrom;
    gradePack.items.forEach(item => {
      const baseQty = item.quantity;
      const currentQty = quantities[item.id] || 0;
      const diff = currentQty - baseQty;
      const price = item.unitPrice || 0;
      total += (diff * price);
    });
    return Math.max(0, total);
  }, [gradePack, quantities]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, StationeryItem[]> = {
      "Core Essentials": [],
      "Durables": [],
      "Brand Upgrades": []
    };
    
    gradePack.items.forEach(item => {
      const cat = item.category || "Core Essentials";
      if (groups[cat]) {
        groups[cat].push(item);
      } else {
        groups[cat] = [item];
      }
    });
    return groups;
  }, [gradePack]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate submit delay
    await new Promise(res => setTimeout(res, 1000));
    
    setSubmitStatus({
      success: true,
      message: "Order enquiry submitted successfully! Our team will contact you shortly to confirm."
    });
    setSubmitting(false);
  };

  if (submitStatus?.success) {
    return (
      <div className={styles.customizerContainer} style={{ padding: "40px" }}>
        <div className={`${styles.submitStatus} ${styles.submitSuccess}`}>
          {submitStatus.message}
        </div>
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Button onClick={onCancel || (() => window.location.reload())} variant="outline">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.customizerContainer} id="pack-customizer">
      <div className={styles.customizerHeader}>
        <h2>Customise your {gradePack.grade} pack</h2>
        <p style={{ margin: 0, color: "var(--pex-text)" }}>Review the standard requirements below. Add or remove items to match your exact needs.</p>
      </div>

      <form className={styles.formGrid} onSubmit={handleSubmit} id="customizer-form">
        <div className={styles.customizerItems}>
          {Object.entries(groupedItems).map(([category, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={category} className={styles.itemGroup}>
                <h3 className={styles.itemGroupTitle}>{category}</h3>
                <div className={styles.itemList}>
                  {items.map(item => (
                    <div key={item.id} className={styles.itemRow}>
                      <div className={styles.itemInfoWrap}>
                        <div className={styles.itemIconBox}>
                          <ItemIcon name={item.icon} size={24} />
                        </div>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemName}>{item.name}</span>
                          {item.specification && <span className={styles.itemSpec}>{item.specification}</span>}
                        </div>
                      </div>
                      <QuantityStepper 
                        value={quantities[item.id] || 0} 
                        onChange={(val) => handleQuantityChange(item.id, val)} 
                        ariaLabel={`Quantity for ${item.name}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.summarySidebar}>
          <h3 style={{ margin: 0, color: "var(--pex-primary)", fontWeight: 800 }}>Order Details</h3>
          <div className={styles.detailsForm}>
            <label>
              Parent / Guardian Name
              <input type="text" required value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="e.g. Jane Doe" />
            </label>
            <label>
              Email Address
              <input type="email" required value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} placeholder="name@example.com" />
            </label>
            <label>
              Delivery Preference
              <select value={deliveryOption} onChange={e => setDeliveryOption(e.target.value)}>
                <option>Collection</option>
                <option>School Delivery</option>
                <option>Home Delivery</option>
              </select>
            </label>

            {submitStatus && !submitStatus.success && (
              <div className={`${styles.submitStatus} ${styles.submitError}`}>
                {submitStatus.message}
              </div>
            )}
          </div>
        </div>
      </form>

      <div className={styles.stickyFooter}>
        <div className={styles.totalBlock}>
          <span className={styles.totalLabel}>Estimated Total</span>
          <span className={styles.totalValue}>{formatCurrency(totalPrice)}</span>
        </div>
        <div className={styles.footerActions}>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" form="customizer-form" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Order Request"}
          </Button>
        </div>
      </div>
    </div>
  );
}
