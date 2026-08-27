import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import styles from "./AdminDesignSystem.module.css";

export function AdminPage({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={clsx(styles.page, styles.stack, className)} {...props} />;
}

export function AdminPageHeading({
  title,
  subtitle,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx(styles.pageHeader, className)}>
      <div className={styles.pageHeading}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle ? <p className={styles.pageSubtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.actionGroup}>{actions}</div> : null}
    </div>
  );
}

export function AdminBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={styles.backLink}>
      <ArrowLeft size={14} aria-hidden="true" />
      {children}
    </Link>
  );
}

export function AdminSplitLayout({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={clsx(styles.splitLayout, className)} {...props} />;
}

export function AdminMainColumn({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={clsx(styles.mainColumn, className)} {...props} />;
}

export function AdminSideColumn({ sticky = false, className, ...props }: ComponentPropsWithoutRef<"div"> & { sticky?: boolean }) {
  return <div className={clsx(styles.sideColumn, sticky && styles.stickySide, className)} {...props} />;
}

export function AdminSectionCard({
  title,
  icon,
  actions,
  children,
  className,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={clsx(styles.card, styles.cardPadded, className)}>
      {title || actions ? (
        <div className={styles.cardHeader}>
          {title ? (
            <h2 className={styles.cardTitle}>
              {icon ? <span className={styles.cardIcon}>{icon}</span> : null}
              {title}
            </h2>
          ) : <span />}
          {actions ? <div className={styles.actionGroup}>{actions}</div> : null}
        </div>
      ) : null}
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

export function AdminActionGroup({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return <div className={clsx(styles.actionGroup, className)} {...props} />;
}

export { styles as adminDesignStyles };