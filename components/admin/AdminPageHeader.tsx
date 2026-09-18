import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const formattedCount =
    count !== undefined ? `(${count.toLocaleString("en-US")})` : undefined;

  return (
    <div className="flex flex-col gap-2.5 mb-6 w-full">
      {backHref && (
        <div className="flex items-center">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,rgba(30,41,59,0.8))] rounded-lg text-[13px] font-semibold text-[var(--db-text-secondary,#94a3b8)] no-underline transition-colors hover:bg-[var(--db-surface,#0f172a)] hover:border-slate-700 hover:text-emerald-500"
          >
            <ArrowLeft size={14} />
            <span>{backLabel || "Back"}</span>
          </Link>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-5 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-2xl sm:text-[1.85rem] font-extrabold text-white tracking-tight leading-tight flex items-baseline flex-wrap gap-2">
            <span>{title}</span>
            {titleHighlight && (
              <span className="text-emerald-500 font-extrabold">
                {titleHighlight}
              </span>
            )}
            {badge && (
              <span className="inline-flex items-center align-middle">
                {badge}
              </span>
            )}
            {formattedCount && (
              <span className="text-2xl sm:text-[1.85rem] font-extrabold text-slate-400 tracking-tight">
                {formattedCount}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="m-0 text-sm font-normal text-slate-400 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-wrap">{actions}</div>
        )}
      </div>
    </div>
  );
}
