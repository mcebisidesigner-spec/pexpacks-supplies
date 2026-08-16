import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { NameCount } from "@/lib/admin/dashboard";
import { orderStatusLabel, orderStatusTone } from "@/lib/admin/order-constants";
import styles from "../DashboardClient.module.css";

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

function toneClass(tone: DashboardTone) {
  return styles[`tone${tone[0].toUpperCase()}${tone.slice(1)}`];
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
  const content = (
    <>
      <div className={styles.metricTop}>
        <span className={styles.metricLabel}>{metric.label}</span>
        <span className={styles.metricAction} aria-hidden="true">
          {metric.href ? <ArrowUpRight /> : <metric.icon />}
        </span>
      </div>
      <div className={styles.metricValueBlock}>
        {loading ? (
          <span className={styles.metricSkeleton} />
        ) : (
          <strong className={styles.metricValue}>
            {metric.currency && typeof metric.value === "number"
              ? formatDashboardCurrency(metric.value)
              : typeof metric.value === "number"
                ? metric.value.toLocaleString("en-ZA")
                : metric.value}
          </strong>
        )}
        <span className={styles.metricHint}>{metric.hint}</span>
      </div>
    </>
  );

  const className = `${styles.metricCard} ${toneClass(metric.tone)} ${
    highlighted ? styles.metricCardHighlighted : ""
  }`;

  return metric.href ? (
    <Link href={metric.href} className={className} aria-label={`${metric.label}: ${metric.value}`}>
      {content}
    </Link>
  ) : (
    <article className={className}>{content}</article>
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
    return <p className={styles.emptyText}>No activity is available for this period.</p>;
  }

  const max = Math.max(1, ...points.map((point) => point.value));
  const peakValue = Math.max(...points.map((point) => point.value));

  return (
    <div className={styles.capsuleChart} role="img" aria-label={label}>
      <div className={styles.capsulePlot}>
        {points.map((point, index) => {
          const percentage = point.value > 0 ? Math.max(16, (point.value / max) * 100) : 12;
          const isPeak = point.value > 0 && point.value === peakValue;
          return (
            <div className={styles.capsuleColumn} key={`${point.label}-${index}`}>
              {isPeak ? (
                <span className={styles.capsuleTooltip}>{valueFormatter(point.value)}</span>
              ) : null}
              <span
                className={`${styles.capsuleBar} ${
                  point.value === 0 ? styles.capsuleBarEmpty : ""
                } ${isPeak ? styles.capsuleBarPeak : ""}`}
                style={{ height: `${percentage}%` }}
                title={`${point.label}: ${valueFormatter(point.value)}`}
              />
              <span className={styles.capsuleLabel}>{point.shortLabel}</span>
              <span className={styles.srOnly}>
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
  const percentage = available && total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={styles.gaugeWrap}>
      <svg
        className={styles.gauge}
        viewBox="0 0 224 132"
        role="img"
        aria-label={
          available
            ? `${percentage}% of fulfilment pipeline orders are delivered`
            : "Fulfilment summary is unavailable"
        }
      >
        <path className={styles.gaugeTrack} d="M24 112 A88 88 0 0 1 200 112" pathLength="100" />
        <path
          className={styles.gaugeValue}
          d="M24 112 A88 88 0 0 1 200 112"
          pathLength="100"
          style={{ strokeDasharray: `${percentage} 100` }}
        />
      </svg>
      <div className={styles.gaugeNumber}>
        <strong>{available ? `${percentage}%` : "-"}</strong>
        <span>{available ? "Delivered" : "Unavailable"}</span>
      </div>
      <div className={styles.gaugeLegend}>
        <span><i className={styles.legendDelivered} />{completed.toLocaleString()} completed</span>
        <span><i className={styles.legendAwaiting} />{awaiting.toLocaleString()} awaiting</span>
      </div>
    </div>
  );
}

export function AttentionList({ items }: { items: DashboardAttentionItem[] }) {
  if (!items.length) {
    return (
      <div className={styles.attentionEmpty}>
        <CheckCircle2 aria-hidden="true" />
        <div>
          <strong>All clear</strong>
          <span>Nothing needs your attention right now.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.attentionList}>
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className={styles.attentionItem}
          aria-label={item.accessibilityLabel}
        >
          <span className={`${styles.attentionIcon} ${toneClass(item.tone)}`}>
            <item.icon aria-hidden="true" />
          </span>
          <span className={styles.attentionCopy}>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </span>
          <ArrowUpRight className={styles.attentionArrow} aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

export function HorizontalBars({ rows }: { rows: NameCount[] }) {
  if (!rows.length) return <p className={styles.emptyText}>No data available yet.</p>;
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div className={styles.horizontalBars}>
      {rows.map((row) => (
        <div className={styles.horizontalBarRow} key={row.label}>
          <span className={styles.horizontalBarLabel} title={row.label}>{row.label}</span>
          <span className={styles.horizontalBarTrack}>
            <span
              className={styles.horizontalBarFill}
              style={{ width: `${Math.max(5, (row.count / max) * 100)}%` }}
            />
          </span>
          <strong>{row.count.toLocaleString("en-ZA")}</strong>
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = orderStatusTone(status);
  return (
    <span className={`${styles.statusBadge} ${styles[`status${tone[0].toUpperCase()}${tone.slice(1)}`]}`}>
      <i aria-hidden="true" />
      {orderStatusLabel(status)}
    </span>
  );
}
