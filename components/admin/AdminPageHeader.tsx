import type { ReactNode } from "react";
import styles from "@/app/admin/admin.module.css";


type AdminPageHeaderProps = {
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
  return (
    <div className={styles.toolbar}>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>
          {title}
          {count !== undefined && (
            <span className={styles.count}>{count}</span>
          )}
        </h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {subtitle && <p className={styles.mutedText}>{subtitle}</p>}
    </div>
  );
}
