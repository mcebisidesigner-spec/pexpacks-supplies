import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPage({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "w-full max-w-[1360px] mx-auto py-2 pb-10 flex flex-col gap-5 text-[var(--db-text-primary,#ffffff)]",
        className,
      )}
      {...props}
    />
  );
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
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 flex-wrap",
        className,
      )}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <h1 className="m-0 text-[var(--db-text-primary,#ffffff)] text-xl sm:text-2xl font-bold tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="m-0 text-[var(--db-text-muted,#94a3b8)] text-xs sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="inline-flex items-center gap-2 flex-wrap">{actions}</div>
      ) : null}
    </div>
  );
}

export function AdminBackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit min-h-8 items-center justify-center gap-2 px-3 border border-[var(--db-border,#1e293b)] rounded-lg bg-[var(--db-surface-inner,#090e17)] text-[var(--db-text-secondary,#94a3b8)] text-xs font-bold no-underline transition-colors hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
    >
      <ArrowLeft size={14} aria-hidden="true" />
      {children}
    </Link>
  );
}

export function AdminSplitLayout({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start",
        className,
      )}
      {...props}
    />
  );
}

export function AdminMainColumn({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-4 min-w-0", className)}
      {...props}
    />
  );
}

export function AdminSideColumn({
  sticky = false,
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & { sticky?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 min-w-0",
        sticky && "lg:sticky lg:top-20",
        className,
      )}
      {...props}
    />
  );
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
    <section
      className={cn(
        "overflow-hidden border border-[var(--db-border,#1e293b)] rounded-xl bg-[var(--db-surface,#0c1322)] shadow-sm p-4 sm:p-5",
        className,
      )}
    >
      {title || actions ? (
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--db-border,#1e293b)]">
          {title ? (
            <h2 className="inline-flex items-center gap-2 m-0 text-[var(--db-text-primary,#ffffff)] text-sm sm:text-base font-extrabold">
              {icon ? <span className="text-emerald-500">{icon}</span> : null}
              {title}
            </h2>
          ) : (
            <span />
          )}
          {actions ? (
            <div className="inline-flex items-center gap-2 flex-wrap">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-4 pt-4">{children}</div>
    </section>
  );
}

export function AdminActionGroup({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 flex-wrap", className)}
      {...props}
    />
  );
}

export const adminDesignStyles: Record<string, string> = {};