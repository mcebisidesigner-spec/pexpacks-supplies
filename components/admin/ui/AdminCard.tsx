import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const adminCardVariants = cva(
  "rounded-xl text-[var(--db-text-primary)] transition-all duration-150",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--db-surface)] border border-[var(--db-border)] shadow-sm",
        surface:
          "bg-[var(--db-surface-inner)] border border-[var(--db-border-muted)]",
        interactive:
          "bg-[var(--db-surface)] border border-[var(--db-border)] shadow-sm cursor-pointer hover:-translate-y-0.5 hover:border-[var(--db-brand)]",
      },
      padding: {
        default: "p-4 sm:p-5",
        sm: "p-3 sm:p-4",
        lg: "p-5 sm:p-6",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  },
);

export interface AdminCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof adminCardVariants> {
  children: React.ReactNode;
}

export function AdminCard({
  variant = "default",
  padding = "default",
  className,
  children,
  ...props
}: AdminCardProps) {
  return (
    <div
      className={cn(adminCardVariants({ variant, padding }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

export const metricToneVariants = cva(
  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
  {
    variants: {
      tone: {
        green:
          "bg-[var(--db-success-subtle)] text-[var(--db-success-text)] border-[var(--db-success-border)]",
        blue:
          "bg-[var(--db-info-subtle)] text-[var(--db-info-text)] border-[var(--db-info-border)]",
        amber:
          "bg-[var(--db-warning-subtle)] text-[var(--db-warning-text)] border-[var(--db-warning-border)]",
        red:
          "bg-[var(--db-danger-subtle)] text-[var(--db-danger-text)] border-[var(--db-danger-border)]",
        purple:
          "bg-[var(--db-purple-subtle)] text-[var(--db-purple-text)] border-[var(--db-purple-border)]",
      },
    },
    defaultVariants: {
      tone: "green",
    },
  },
);

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  iconTone?: VariantProps<typeof metricToneVariants>["tone"];
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
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--db-surface)] border border-[var(--db-border)] rounded-xl p-4 sm:p-5 flex flex-col gap-2 shadow-sm transition-all duration-150 hover:border-[var(--db-border-strong)]",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--db-text-muted)] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className={cn(metricToneVariants({ tone: iconTone }))}>
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
