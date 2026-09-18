import React from "react";
import {
  toneForStatus,
  type StatusTone,
} from "@/lib/admin/status";
import { cn } from "@/lib/utils";

export type BadgeTone = StatusTone;

export interface StatusBadgeProps {
  status: string;
  label?: string;
  tone?: BadgeTone;
  showDot?: boolean;
  className?: string;
}

const toneStyles: Record<string, string> = {
  emerald:
    "bg-[var(--db-success-subtle)] text-[var(--db-success-text)] border-[var(--db-success-border)]",
  blue: "bg-[var(--db-info-subtle)] text-[var(--db-info-text)] border-[var(--db-info-border)]",
  amber:
    "bg-[var(--db-warning-subtle)] text-[var(--db-warning-text)] border-[var(--db-warning-border)]",
  red: "bg-[var(--db-danger-subtle)] text-[var(--db-danger-text)] border-[var(--db-danger-border)]",
  teal: "bg-[var(--db-teal-subtle)] text-[var(--db-teal-text)] border-[var(--db-teal-border)]",
  slate:
    "bg-[var(--db-neutral-subtle)] text-[var(--db-neutral-text)] border-[var(--db-neutral-border)]",
  purple:
    "bg-[var(--db-purple-subtle)] text-[var(--db-purple-text)] border-[var(--db-purple-border)]",
};

export function StatusBadge({
  status,
  label,
  tone,
  showDot = false,
  className,
}: StatusBadgeProps) {
  const selectedTone = toneForStatus(status, tone);
  const displayLabel = label || status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold leading-tight capitalize tracking-wide whitespace-nowrap border border-transparent box-border",
        toneStyles[selectedTone] || toneStyles.slate,
        className,
      )}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_5px_currentColor] shrink-0" />
      )}
      {displayLabel}
    </span>
  );
}
