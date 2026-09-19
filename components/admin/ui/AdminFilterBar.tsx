"use client";

import React from "react";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminFilterChipProps {
  label: string;
  value: string | React.ReactNode;
  onRemove: () => void;
  className?: string;
}

export function AdminFilterChip({
  label,
  value,
  onRemove,
  className,
}: AdminFilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        "bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] text-[var(--db-text-secondary,#94a3b8)]",
        "transition-colors",
        className,
      )}
    >
      <span className="text-[var(--db-text-subtle,#64748b)]">{label}:</span>
      <span className="text-[var(--db-text-primary,#f8fafc)] font-semibold">
        {value}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 p-0.5 rounded-full hover:bg-slate-700/60 hover:text-white transition-colors"
        aria-label={`Remove filter ${label}`}
      >
        <X size={11} aria-hidden="true" />
      </button>
    </span>
  );
}

export interface AdminFilterBarProps {
  chips?: Array<{
    id: string;
    label: string;
    value: string | React.ReactNode;
    onRemove: () => void;
  }>;
  onClearAll?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Filter bar displaying active filters, filter controls, and clear button.
 */
export function AdminFilterBar({
  chips = [],
  onClearAll,
  children,
  className,
}: AdminFilterBarProps) {
  if (chips.length === 0 && !children) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 flex-wrap text-xs text-[var(--db-text-muted,#94a3b8)] py-1",
        className,
      )}
    >
      <div className="inline-flex items-center gap-1 text-[var(--db-text-subtle,#64748b)] font-medium mr-1">
        <Filter size={13} aria-hidden="true" />
        <span>Filters:</span>
      </div>

      {chips.map((chip) => (
        <AdminFilterChip
          key={chip.id}
          label={chip.label}
          value={chip.value}
          onRemove={chip.onRemove}
        />
      ))}

      {children}

      {chips.length > 0 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-[var(--db-brand,#10b981)] hover:text-emerald-400 font-semibold underline-offset-2 hover:underline ml-1"
        >
          Clear all ({chips.length})
        </button>
      )}
    </div>
  );
}
