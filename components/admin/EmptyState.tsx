import type { ReactNode } from "react";
import styles from "../../app/admin/admin.module.css";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className={styles.emptyStateContainer}>
      <div className={styles.emptyStateInner}>
        {icon && <div className={styles.emptyIconWrapper}>{icon}</div>}
        <h3 className={styles.emptyStateTitle}>{title}</h3>
        <p className={styles.emptyStateText}>{text}</p>
        {action && <div className={styles.mt16}>{action}</div>}
      </div>
    </div>
  );
}
