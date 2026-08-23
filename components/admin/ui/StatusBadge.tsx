import React from "react";
import clsx from "clsx";
import styles from "./StatusBadge.module.css";

export type BadgeTone = "emerald" | "amber" | "red" | "blue" | "teal" | "slate";

export interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: BadgeTone;
  showDot?: boolean;
  className?: string;
}

const STATUS_TO_TONE: Record<string, BadgeTone> = {
  // Green / Emerald (Success, Complete, Paid, Active, Preferred)
  paid: "emerald",
  delivered: "emerald",
  complete: "emerald",
  completed: "emerald",
  active: "emerald",
  official: "emerald",
  published: "emerald",
  secured: "emerald",
  preferred: "emerald",
  approved: "emerald",
  low: "emerald",
  good: "emerald",

  // Amber / Warning (Pending, Review, In Progress, At Risk)
  pending: "amber",
  pending_payment: "amber",
  scheduled: "amber",
  review: "amber",
  needs_review: "amber",
  needs_work: "amber",
  partially_secured: "amber",
  part_paid: "amber",
  medium: "amber",
  normal: "amber",
  prospect: "amber",

  // Red / Danger (Critical, Blocked, Failed, Cancelled, Overdue)
  cancelled: "red",
  refunded: "red",
  payment_failed: "red",
  failed: "red",
  declined: "red",
  blocked: "red",
  overdue: "red",
  urgent: "red",
  high: "red",
  at_risk: "red",
  refused: "red",

  // Blue / Info (Process, Packing, In Transit, Procurement)
  packing: "blue",
  ready_to_pack: "blue",
  not_ready: "blue",
  dispatched: "blue",
  in_transit: "blue",
  processing: "blue",
  procurement: "blue",
  new: "blue",
  in_progress: "blue",
  open: "blue",

  // Slate / Neutral (Draft, Inactive, Hidden, Archived)
  inactive: "slate",
  hidden: "slate",
  draft: "slate",
  archived: "slate",
};

export function StatusBadge({ status, label, tone, showDot = false, className }: StatusBadgeProps) {
  const normalizedKey = status.toLowerCase().replace(/[\s-]+/g, "_");
  const selectedTone = tone || STATUS_TO_TONE[normalizedKey] || "slate";
  const displayLabel = label || status.replace(/_/g, " ");

  return (
    <span className={clsx(styles.badge, styles[selectedTone], className)}>
      {showDot && <span className={styles.dot} />}
      {displayLabel}
    </span>
  );
}
