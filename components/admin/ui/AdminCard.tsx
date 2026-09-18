import React from "react";
import { cn } from "@/lib/utils";

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "interactive";
  children: React.ReactNode;
}

export function AdminCard({
  variant = "default",
  className,
  children,
  ...props
}: AdminCardProps) {
  const variantStyles = {
    default:
      "bg-[var(--db-surface)] border border-[var(--db-border)] rounded-xl p-4 sm:p-5 text-[var(--db-text-primary)] shadow-sm",
    surface:
      "bg-[var(--db-surface-inner)] border border-[var(--db-border-muted)] rounded-xl p-4 sm:p-5 text-[var(--db-text-primary)]",
    interactive:
      "bg-[var(--db-surface)] border border-[var(--db-border)] rounded-xl p-4 sm:p-5 text-[var(--db-text-primary)] shadow-sm transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:border-[var(--db-brand)]",
  };

  return (
    <div className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  iconTone?: "green" | "blue" | "amber" | "red" | "purple";
  badge?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  icon,
  iconTone = "green",
  badge,
  className,
}: MetricCardProps) {
  const toneStyles = {
    green:
      "bg-[var(--db-success-subtle)] text-[var(--db-success-text)] border border-[var(--db-success-border)]",
    blue: "bg-[var(--db-info-subtle)] text-[var(--db-info-text)] border border-[var(--db-info-border)]",
    amber:
      "bg-[var(--db-warning-subtle)] text-[var(--db-warning-text)] border border-[var(--db-warning-border)]",
    red: "bg-[var(--db-danger-subtle)] text-[var(--db-danger-text)] border border-[var(--db-danger-border)]",
    purple:
      "bg-[var(--db-purple-subtle)] text-[var(--db-purple-text)] border border-[var(--db-purple-border)]",
  };

  return (
    <div
      className={cn(
        "bg-[var(--db-surface)] border border-[var(--db-border)] rounded-xl p-4 sm:p-5 flex flex-col gap-2 shadow-sm transition-all duration-150 hover:border-[var(--db-border-strong)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--db-text-muted)] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              toneStyles[iconTone],
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl sm:text-[1.625rem] font-bold text-[var(--db-text-primary)] tracking-tight leading-tight tabular-nums">
        {value}
      </div>
      {(subtext || badge) && (
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {badge}
          {subtext && (
            <span className="text-xs text-[var(--db-text-subtle)] font-medium">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
