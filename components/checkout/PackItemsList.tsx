"use client";

import { useState } from "react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/Button";
import styles from "./PackItemsList.module.css";

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
      <h3>Stationery pack list</h3>
      <ul className={styles.packList} aria-label="All pack items">
        {visibleItems.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
      {shouldCollapse ? (
        <Button
          type="button"
          variant="secondary"
          className={clsx(styles.packListToggle, "rounded-full")}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? "Show fewer items" : `View all ${itemCount} items`}
        </Button>
      ) : null}
      <div className={styles.packListMeta}>
        <span>{itemCount} items</span>
        <span>{formatCurrency(price)}</span>
      </div>
    </div>
  );
}
