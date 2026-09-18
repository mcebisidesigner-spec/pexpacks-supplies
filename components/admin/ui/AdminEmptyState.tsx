import React, { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  dashed?: boolean;
}

/**
 * Modern Tailwind empty state display for Admin views and data tables.
 */
export function AdminEmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  dashed = true,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl bg-[var(--db-surface,#0c1322)]",
        dashed
          ? "border-2 border-dashed border-[var(--db-border,#1e293b)]"
          : "border border-[var(--db-border,#1e293b)] shadow-sm",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] flex items-center justify-center text-[var(--db-text-subtle,#64748b)] mb-4 shrink-0 shadow-inner">
        {icon || <FolderOpen size={24} aria-hidden="true" />}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[var(--db-text-primary,#f8fafc)] tracking-tight m-0 mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-xs sm:text-sm text-[var(--db-text-muted,#94a3b8)] max-w-md m-0 mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
