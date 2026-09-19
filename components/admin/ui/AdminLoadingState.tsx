import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminLoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Centered spinner loading block for admin panels and async sections.
 */
export function AdminLoadingState({
  message = "Loading data...",
  className,
  size = "md",
}: AdminLoadingStateProps) {
  const iconSizes = {
    sm: 18,
    md: 26,
    lg: 36,
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)]",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2
        size={iconSizes[size]}
        className="text-[var(--db-brand,#10b981)] animate-spin mb-3"
        aria-hidden="true"
      />
      {message && (
        <p className="text-xs sm:text-sm font-medium text-[var(--db-text-muted,#94a3b8)] m-0">
          {message}
        </p>
      )}
    </div>
  );
}

export interface AdminTableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Skeleton placeholder matching Admin TanStack tables for loading states.
 */
export function AdminTableSkeleton({
  rows = 5,
  columns = 5,
  className,
}: AdminTableSkeletonProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-[var(--db-border,#1e293b)] bg-[var(--db-surface,#0c1322)] overflow-hidden shadow-sm",
        className,
      )}
      role="status"
      aria-label="Loading table data"
    >
      {/* Table Header Skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[var(--db-surface-inner,#090e17)] border-b border-[var(--db-border,#1e293b)]">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={`th-skel-${colIndex}`}
            className="h-4 bg-slate-800/80 rounded animate-pulse flex-1"
            style={{ maxWidth: colIndex === 0 ? "180px" : undefined }}
          />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-[var(--db-border,#1e293b)]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`tr-skel-${rowIndex}`}
            className="flex items-center gap-4 px-4 py-3.5"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={`td-skel-${rowIndex}-${colIndex}`}
                className="h-4 bg-slate-800/50 rounded animate-pulse flex-1"
                style={{
                  maxWidth:
                    colIndex === 0
                      ? "140px"
                      : colIndex === columns - 1
                        ? "80px"
                        : undefined,
                  opacity: Math.max(0.4, 1 - rowIndex * 0.1),
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface AdminCardSkeletonProps {
  className?: string;
}

/**
 * Metric card or form section skeleton placeholder.
 */
export function AdminCardSkeleton({ className }: AdminCardSkeletonProps) {
  return (
    <div
      className={cn(
        "p-5 rounded-xl border border-[var(--db-border,#1e293b)] bg-[var(--db-surface,#0c1322)] flex flex-col gap-3 shadow-sm",
        className,
      )}
      role="status"
    >
      <div className="h-3 w-24 bg-slate-800 rounded animate-pulse" />
      <div className="h-7 w-36 bg-slate-800 rounded animate-pulse mt-1" />
      <div className="h-3 w-32 bg-slate-800/60 rounded animate-pulse" />
    </div>
  );
}
