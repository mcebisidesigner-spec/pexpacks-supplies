import React from "react";
import clsx from "clsx";
import {
  toneForStatus,
  type StatusTone,
} from "@/lib/admin/status";
import styles from "./StatusBadge.module.css";

export type BadgeTone = StatusTone;

export interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: BadgeTone;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, label, tone, showDot = false, className }: StatusBadgeProps) {
  const selectedTone = toneForStatus(status, tone);
  const displayLabel = label || status.replace(/_/g, " ");

  return (
    <span className={clsx(styles.badge, styles[selectedTone], className)}>
      {showDot && <span className={styles.dot} />}
      {displayLabel}
    </span>
  );
}
