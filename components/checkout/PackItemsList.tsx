"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "@/app/checkout/Checkout.module.css";

type PackItemsListProps = {
  items: string[];
  price: number;
};

export function PackItemsList({ items, price }: PackItemsListProps) {
  const [expanded, setExpanded] = useState(false);
  const itemCount = items.length;
  const shouldCollapse = itemCount > 12;
  const visibleItems = shouldCollapse && !expanded ? items.slice(0, 12) : items;

  return (
    <div className={styles.packListCard}>
      <h3>Full stationery pack for 2027</h3>
      <ul className={styles.packList} aria-label="All pack items">
        {visibleItems.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
      {shouldCollapse ? (
        <button
          type="button"
          className={styles.packListToggle}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? "Show fewer items" : `View all ${itemCount} items`}
        </button>
      ) : null}
      <div className={styles.packListMeta}>
        <span>{itemCount} items</span>
        <span>{formatCurrency(price)}</span>
      </div>
    </div>
  );
}
