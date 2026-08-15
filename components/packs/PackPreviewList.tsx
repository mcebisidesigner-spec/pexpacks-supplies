"use client";

import type { MouseEventHandler } from "react";
import { ItemIcon } from "@/components/ui/ItemIcon";
import type { PackListItem } from "./packListTypes";
import { ViewCompleteListButton } from "./ViewCompleteListButton";
import styles from "./PackPreviewList.module.css";

type PackPreviewListProps = {
  items: PackListItem[];
  listLabel: string;
  previewLimit?: number;
  viewCompleteAriaLabel: string;
  onViewCompleteList: MouseEventHandler<HTMLButtonElement>;
};

export function PackPreviewList({
  items,
  listLabel,
  previewLimit = 5,
  viewCompleteAriaLabel,
  onViewCompleteList,
}: PackPreviewListProps) {
  const visibleItems = items.slice(0, previewLimit);
  const remainingCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <div className={styles.preview}>
      {visibleItems.length ? (
        <ul className={styles.list} aria-label={listLabel}>
          {visibleItems.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              <ItemIcon name={item.icon} size={17} className={styles.icon} />
              <span className={styles.itemText}>
                <span>{item.name}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>The stationery list is being finalised.</p>
      )}

      <div className={styles.metaRow}>
        {remainingCount > 0 ? (
          <span className={styles.remaining}>
            +{remainingCount} more essentials
          </span>
        ) : null}
        <ViewCompleteListButton
          ariaLabel={viewCompleteAriaLabel}
          onClick={onViewCompleteList}
        />
      </div>
    </div>
  );
}
