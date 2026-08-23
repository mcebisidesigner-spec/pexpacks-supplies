import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./ui/AdminPageHeader.module.css";

export type AdminPageHeaderProps = {
  title: string;
  titleHighlight?: string;
  badge?: ReactNode;
  count?: number;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  title,
  titleHighlight,
  badge,
  count,
  subtitle,
  backHref,
  backLabel,
  actions,
}: AdminPageHeaderProps) {
  const formattedCount = count !== undefined ? `(${count.toLocaleString("en-US")})` : undefined;

  return (
    <div className={styles.headerWrapper}>
      {backHref && (
        <div className={styles.backContainer}>
          <Link href={backHref} className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>{backLabel || "Back"}</span>
          </Link>
        </div>
      )}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            <span>{title}</span>
            {titleHighlight && (
              <span className={styles.headerTitleHighlight}>{titleHighlight}</span>
            )}
            {badge && (
              <span className={styles.headerBadgeWrapper}>{badge}</span>
            )}
            {formattedCount && (
              <span className={styles.headerCount}>{formattedCount}</span>
            )}
          </h1>
          {subtitle && <p className={styles.headerSubtitle}>{subtitle}</p>}
        </div>
        {actions && <div className={styles.headerActions}>{actions}</div>}
      </div>
    </div>
  );
}
