import React from "react";
import { cn } from "@/lib/utils";

export interface AdminToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Standard toolbar container for search, filter controls, batch actions, and primary actions.
 */
export function AdminToolbar({
  left,
  right,
  children,
  className,
  ...props
}: AdminToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] shadow-sm",
        className,
      )}
      {...props}
    >
      {left && (
        <div className="flex flex-1 items-center gap-2.5 flex-wrap min-w-0">
          {left}
        </div>
      )}
      {children && (
        <div className="flex flex-1 items-center gap-2.5 flex-wrap min-w-0">
          {children}
        </div>
      )}
      {right && (
        <div className="flex items-center gap-2 flex-wrap sm:justify-end shrink-0">
          {right}
        </div>
      )}
    </div>
  );
}
