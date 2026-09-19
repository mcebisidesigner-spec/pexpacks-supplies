import Link from "next/link";
import { ArrowUpRight, CheckCircle2, type LucideIcon } from "lucide-react";
import type { NameCount } from "@/lib/admin/dashboard";
import { orderStatusLabel, orderStatusTone } from "@/lib/admin/order-constants";
import { cn } from "@/lib/utils";

export type DashboardTone = "emerald" | "amber" | "info" | "red" | "neutral";

export interface DashboardMetric {
  label: string;
  value: number | string;
  hint: string;
  icon: LucideIcon;
  tone: DashboardTone;
  currency?: boolean;
  href?: string;
}

export interface DashboardAttentionItem {
  tone: DashboardTone;
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  accessibilityLabel: string;
}

export function formatDashboardCurrency(value: number): string {
  return `R ${value.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDashboardCount(value: number): string {
  return Math.trunc(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getToneStyles(tone: DashboardTone) {
  switch (tone) {
    case "emerald":
      return {
        action: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        value: "text-emerald-400",
      };
    case "amber":
      return {
        action: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        value: "text-amber-400",
      };
    case "info":
      return {
        action: "text-sky-400 bg-sky-500/10 border-sky-500/30",
        value: "text-sky-400",
      };
    case "red":
      return {
        action: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        value: "text-rose-400",
      };
    case "neutral":
    default:
      return {
        action: "text-slate-400 bg-slate-800 border-slate-700",
        value: "text-slate-100",
      };
  }
}

export function MetricCard({
  metric,
  highlighted = false,
  loading = false,
}: {
  metric: DashboardMetric;
  highlighted?: boolean;
  loading?: boolean;
}) {
  const toneStyles = getToneStyles(metric.tone);

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "text-[11px] font-extrabold uppercase tracking-wide",
            highlighted ? "text-emerald-100/85" : "text-slate-400",
          )}
        >
          {metric.label}
        </span>
        <span
          className={cn(
            "grid w-7.5 h-7.5 shrink-0 place-items-center rounded-full border transition-colors",
            highlighted
              ? "border-white/50 bg-emerald-950 text-emerald-300"
              : toneStyles.action,
          )}
          aria-hidden="true"
        >
          {metric.href ? (
            <ArrowUpRight size={14} />
          ) : (
            <metric.icon size={14} />
          )}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 mt-4 min-w-0">
        {loading ? (
          <span className="block w-26 h-8 rounded-md bg-slate-800 animate-pulse" />
        ) : (
          <strong
            className={cn(
              "text-3xl font-extrabold tracking-tight truncate leading-none",
              highlighted
                ? "text-white"
                : metric.tone === "emerald"
                  ? toneStyles.value
                  : "text-slate-100",
            )}
          >
            {metric.currency && typeof metric.value === "number"
              ? formatDashboardCurrency(metric.value)
              : typeof metric.value === "number"
                ? metric.value.toLocaleString("en-ZA")
                : metric.value}
          </strong>
        )}
        <span
          className={cn(
            "text-[10px] leading-tight truncate",
            highlighted ? "text-emerald-100/80" : "text-slate-400",
          )}
        >
          {metric.hint}
        </span>
      </div>
    </>
  );

  const cardClasses = cn(
    "relative flex flex-col justify-between min-w-0 min-h-[148px] p-4.5 rounded-2xl border transition-all duration-160 ease-out no-underline shadow-md hover:-translate-y-0.5",
    highlighted
      ? "bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-500/50 text-emerald-50 shadow-emerald-950/40"
      : "bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900/90 shadow-black/20",
  );

  return metric.href ? (
    <Link
      href={metric.href}
      className={cardClasses}
      aria-label={`${metric.label}: ${metric.value}`}
    >
      {content}
    </Link>
  ) : (
    <article className={cardClasses}>{content}</article>
  );
}

export function CapsuleBarChart({
  points,
  valueFormatter,
  label,
}: {
  points: { label: string; shortLabel: string; value: number }[];
  valueFormatter: (value: number) => string;
  label: string;
}) {
  if (!points.length) {
    return (
      <p className="m-0 py-7 px-1.5 text-center text-xs text-slate-400">
        No activity is available for this period.
      </p>
    );
  }

  const max = Math.max(1, ...points.map((point) => point.value));
  const peakValue = Math.max(...points.map((point) => point.value));

  return (
    <div className="min-w-0 w-full" role="img" aria-label={label}>
      <div className="flex h-48 items-end gap-2.5 pt-2 px-0.5">
        {points.map((point, index) => {
          const percentage =
            point.value > 0 ? Math.max(16, (point.value / max) * 100) : 12;
          const isPeak = point.value > 0 && point.value === peakValue;
          return (
            <div
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 group"
              key={`${point.label}-${index}`}
            >
              {isPeak ? (
                <span className="max-w-[62px] truncate px-1.5 py-0.5 border border-slate-700 rounded-md bg-slate-800 text-emerald-400 text-[8px] font-black">
                  {valueFormatter(point.value)}
                </span>
              ) : null}
              <span
                className={cn(
                  "block w-[min(36px,100%)] min-h-[16px] rounded-full transition-all duration-200",
                  point.value === 0
                    ? "border border-slate-800 bg-slate-800/40"
                    : isPeak
                      ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                      : "bg-emerald-600 hover:bg-emerald-500",
                )}
                style={{ height: `${percentage}%` }}
                data-db-tooltip={`${point.label}: ${valueFormatter(point.value)}`}
              />
              <span className="text-slate-400 text-[9px] font-bold">
                {point.shortLabel}
              </span>
              <span className="sr-only">
                {point.label}: {valueFormatter(point.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FulfilmentGauge({
  completed,
  awaiting,
  available,
}: {
  completed: number;
  awaiting: number;
  available: boolean;
}) {
  const total = completed + awaiting;
  const percentage =
    available && total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="relative flex min-h-[210px] flex-col items-center justify-end">
      <svg
        className="w-[min(238px,100%)] h-auto overflow-visible"
        viewBox="0 0 224 132"
        role="img"
        aria-label={
          available
            ? `${percentage}% of fulfilment pipeline orders are delivered`
            : "Fulfilment summary is unavailable"
        }
      >
        <path
          className="fill-none stroke-slate-800"
          style={{ strokeWidth: 24, strokeLinecap: "round" }}
          d="M24 112 A88 88 0 0 1 200 112"
          pathLength="100"
        />
        <path
          className="fill-none stroke-emerald-500 transition-all duration-300 ease-out"
          style={{
            strokeWidth: 24,
            strokeLinecap: "round",
            strokeDasharray: `${percentage} 100`,
          }}
          d="M24 112 A88 88 0 0 1 200 112"
          pathLength="100"
        />
      </svg>
      <div className="absolute top-20 flex flex-col items-center">
        <strong className="text-slate-100 text-3xl font-extrabold leading-none">
          {available ? `${percentage}%` : "-"}
        </strong>
        <span className="mt-1 text-slate-400 text-[9px]">
          {available ? "Delivered" : "Unavailable"}
        </span>
      </div>
      <div className="flex justify-center gap-3 flex-wrap text-slate-400 text-[9px] mt-2">
        <span className="inline-flex items-center gap-1.5">
          <i className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {formatDashboardCount(completed)} completed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          {formatDashboardCount(awaiting)} awaiting
        </span>
      </div>
    </div>
  );
}

export function AttentionList({ items }: { items: DashboardAttentionItem[] }) {
  if (!items.length) {
    return (
      <div className="flex min-h-[126px] flex-1 items-center justify-center gap-2.5 text-emerald-400">
        <CheckCircle2 size={24} aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <strong className="text-slate-100 text-xs">All clear</strong>
          <span className="text-slate-400 text-[9px]">
            Nothing needs your attention right now.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="grid grid-cols-[30px_minmax(0,1fr)_14px] items-center gap-2 p-2 border border-transparent rounded-xl text-slate-300 no-underline transition-colors hover:border-slate-800 hover:bg-slate-800/60"
          aria-label={item.accessibilityLabel}
        >
          <span className="grid w-7.5 h-7.5 place-items-center rounded-lg bg-slate-800 text-slate-200">
            <item.icon size={14} aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <strong className="truncate text-slate-100 text-[10px]">
              {item.title}
            </strong>
            <span className="truncate text-slate-400 text-[9px]">
              {item.body}
            </span>
          </span>
          <ArrowUpRight size={13} className="text-slate-400" aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

export function HorizontalBars({ rows }: { rows: NameCount[] }) {
  if (!rows.length) {
    return (
      <p className="m-0 py-7 px-1.5 text-center text-xs text-slate-400">
        No data available yet.
      </p>
    );
  }
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div className="flex flex-col gap-2 w-full">
      {rows.map((row) => (
        <div
          className="flex items-center gap-2.5 text-xs text-slate-300"
          key={row.label}
        >
          <span
            className="w-28 text-right truncate text-slate-300 text-xs shrink-0"
            data-db-tooltip={row.label}
          >
            {row.label}
          </span>
          <span className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <span
              className="block h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, (row.count / max) * 100)}%` }}
            />
          </span>
          <strong className="text-slate-100 text-xs font-semibold w-12 text-right shrink-0">
            {row.count.toLocaleString("en-ZA")}
          </strong>
        </div>
      ))}
    </div>
  );
}

function getStatusBadgeStyle(tone: string) {
  switch (tone) {
    case "paid":
      return "text-emerald-400 bg-emerald-500/12 border border-emerald-500/25";
    case "pending":
      return "text-amber-400 bg-amber-500/12 border border-amber-500/25";
    case "danger":
      return "text-rose-400 bg-rose-500/12 border border-rose-500/25";
    case "info":
      return "text-sky-400 bg-sky-500/12 border border-sky-500/25";
    case "muted":
    default:
      return "text-slate-400 bg-slate-800 border border-slate-700";
  }
}

export function StatusBadge({ status }: { status: string }) {
  const tone = orderStatusTone(status);
  const badgeStyle = getStatusBadgeStyle(tone);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap",
        badgeStyle,
      )}
    >
      <i className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {orderStatusLabel(status)}
    </span>
  );
}
