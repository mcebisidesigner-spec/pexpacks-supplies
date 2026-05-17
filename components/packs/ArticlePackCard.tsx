"use client";

import type {
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";
import type { PackListItem } from "./packListTypes";
import { PackPreviewList } from "./PackPreviewList";
import styles from "./ArticlePackCard.module.css";

type ArticlePackCardProps = {
  gradeLabel: string;
  bestFor: string;
  title: string;
  description: string;
  priceLabel: string;
  items: PackListItem[];
  actions: ReactNode;
  className?: string;
  style?: CSSProperties;
  tone?: "default" | "primary" | "high";
  viewCompleteAriaLabel: string;
  onViewCompleteList: MouseEventHandler<HTMLButtonElement>;
};

export function ArticlePackCard({
  gradeLabel,
  bestFor,
  title,
  description,
  priceLabel,
  items,
  actions,
  className = "",
  style,
  tone = "default",
  viewCompleteAriaLabel,
  onViewCompleteList,
}: ArticlePackCardProps) {
  const toneClass =
    tone === "primary"
      ? styles.tonePrimary
      : tone === "high"
        ? styles.toneHigh
        : "";

  return (
    <article
      className={[styles.card, toneClass, className].filter(Boolean).join(" ")}
      style={style}
    >
      <div className={styles.media} aria-hidden="true">
        <span>{gradeLabel}</span>
      </div>

      <div className={styles.body}>
        <p className={styles.bestFor}>{bestFor}</p>
        <h3>{title}</h3>
        <p className={styles.description}>{description}</p>
        <PackPreviewList
          items={items}
          listLabel={`${title} stationery list preview`}
          viewCompleteAriaLabel={viewCompleteAriaLabel}
          onViewCompleteList={onViewCompleteList}
        />
      </div>

      <div className={styles.footer}>
        <p className={styles.price}>{priceLabel}</p>
        <div className={styles.actionSlot}>{actions}</div>
      </div>
    </article>
  );
}
