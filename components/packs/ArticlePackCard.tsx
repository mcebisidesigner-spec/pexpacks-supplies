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
        <span className={styles.gradePill}>{gradeLabel}</span>
        <svg
          className={styles.backpackVector}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5V3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path d="M5 9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9z" />
          <path d="M5 11h14" />
          <path d="M8 6v6" />
          <path d="M16 6v6" />
          <rect x="7.5" y="14" width="9" height="5.5" rx="1.5" />
          <path d="M5 13H3.5a1.5 1.5 0 0 0-1.5 1.5v4A1.5 1.5 0 0 0 3.5 20H5" />
          <path d="M19 13h1.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H19" />
        </svg>
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
