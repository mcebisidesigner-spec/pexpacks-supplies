import type { ReactNode } from "react";
import styles from "./ui/AdminPageHeader.module.css";

export type AdminPageHeaderProps = {
  title: string;
  count?: number;
  subtitle?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  title,
  count,
  subtitle,
  actions,
}: AdminPageHeaderProps) {
  const formattedCount = count !== undefined ? `(${count.toLocaleString()})` : undefined;

  return (
    <div className={styles.headerRow}>
      <div className={styles.headerTitleGroup}>
        <h1 className={styles.headerTitle}>
          {title}
          {formattedCount && (
            <span className={styles.headerCount}>{formattedCount}</span>
          )}
        </h1>
        {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.headerActions}>{actions}</div>}
    </div>
  );
}
