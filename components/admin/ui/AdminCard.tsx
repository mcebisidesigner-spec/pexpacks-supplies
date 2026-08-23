import React from "react";
import clsx from "clsx";
import styles from "./AdminCard.module.css";

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "interactive";
  children: React.ReactNode;
}

export function AdminCard({ variant = "default", className, children, ...props }: AdminCardProps) {
  return (
    <div className={clsx(styles.card, styles[variant], className)} {...props}>
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

export function MetricCard({ label, value, subtext, icon, iconTone = "green", badge, className }: MetricCardProps) {
  return (
    <div className={clsx(styles.metricCard, className)}>
      <div className={styles.metricTop}>
        <span className={styles.metricLabel}>{label}</span>
        {icon && (
          <div className={clsx(styles.metricIconWrapper, styles[iconTone])}>
            {icon}
          </div>
        )}
      </div>
      <div className={styles.metricValue}>{value}</div>
      {(subtext || badge) && (
        <div className={styles.metricFooter}>
          {badge}
          {subtext && <span className={styles.metricSubtext}>{subtext}</span>}
        </div>
      )}
    </div>
  );
}
