/**
 * Admin dashboard shell — dark, mobile-first, accessible.
 * Renders server-cached stats instantly (no skeleton flash) and layers a
 * 30 s SWR background refresh of the pre-aggregated dashboard_summaries row
 * (hooks/useDashboardSummary) for live paid/pending figures.
 */
"use client";

import { useMemo } from "react";
import {
  Package,
  TrendingUp,
  Wallet,
  School,
  Users,
  Image,
  RefreshCw,
  CheckCircle2,
  Clock,
  Info,
  AlertCircle,
  List,
  type LucideIcon,
} from "lucide-react";
import { orderStatusLabel, orderStatusTone } from "@/lib/admin/order-constants";
import { formatCurrency } from "@/lib/formatCurrency";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import type { DashboardStats } from "@/lib/admin/dashboard";
import "@/styles/admin-dark.css";
import styles from "./DashboardClient.module.css";

interface DashboardClientProps {
  stats: DashboardStats;
  userName: string;
}

const TONE_ICONS: Record<string, LucideIcon> = {
  paid: CheckCircle2,
  pending: Clock,
  info: Info,
  danger: AlertCircle,
  muted: List,
};

function StatusBadge({ status }: { status: string | null | undefined }) {
  const tone = orderStatusTone(status);
  const label = orderStatusLabel(status);
  const Icon = TONE_ICONS[tone] ?? List;
  return (
    <span className={`${styles.badge} ${styles[`badge${tone[0].toUpperCase()}${tone.slice(1)}`]}`}>
      <Icon size={14} />
      <span>{label}</span>
    </span>
  );
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardClient({ stats, userName }: DashboardClientProps) {
  const { summary, isRefreshing, isError, refresh } = useDashboardSummary();

  const kpis = useMemo(
    () => [
      { label: "Total orders", value: stats.orders.total, icon: List, hint: "All time" },
      { label: "This month", value: stats.orders.thisMonth, icon: TrendingUp, hint: "New orders" },
      { label: "Revenue", value: formatCurrency(stats.orders.revenue), icon: Wallet, hint: "Paid orders" },
      { label: "Pending schools", value: stats.schools.pending, icon: Clock, hint: "Awaiting approval" },
      { label: "Schools", value: stats.schools.total, icon: School, hint: "Active + pending" },
      { label: "Packs", value: stats.packs, icon: Package, hint: "Published grade packs" },
      { label: "Users", value: stats.users, icon: Users, hint: "Staff + customers" },
      { label: "Assets", value: stats.assets.total, icon: Image, hint: "Uploaded files" },
    ],
    [stats]
  );

  const lastUpdated = useMemo(() => {
    if (!summary?.last_updated_at) return null;
    const d = new Date(summary.last_updated_at);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  }, [summary]);

  const summaryCards = summary
    ? [
        { label: "Paid orders", value: summary.paid_orders, tone: "paid" as const },
        { label: "Pending payment", value: summary.pending_orders, tone: "pending" as const },
        { label: "Live revenue", value: formatCurrency(summary.total_revenue), tone: "paid" as const },
      ]
    : [];

  const hasCharts =
    stats.ordersDaily.some((d) => d.orders > 0) ||
    stats.ordersDaily.some((d) => d.revenue > 0);
  const hasBreakdowns =
    stats.ordersByPackType.length > 0 || stats.schoolsByCity.length > 0;
  const maxDaily = Math.max(
    1,
    ...stats.ordersDaily.map((d) => Math.max(d.orders, d.revenue))
  );
  const maxPack = Math.max(1, ...stats.ordersByPackType.map((d) => d.count));
  const maxCity = Math.max(1, ...stats.schoolsByCity.map((d) => d.count));

  return (
    <div className={`admin-dark ${styles.root}`}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Signed in as <strong>{userName}</strong> · live ops overview
          </p>
        </div>
        <div className={styles.liveStatus} role="status" aria-live="polite">
          {isError ? (
            <span className={styles.liveError}>Live summary unavailable</span>
          ) : isRefreshing ? (
            <>
              <span className={styles.liveDot} aria-hidden="true" />
              Refreshing…
            </>
          ) : lastUpdated ? (
            <span className={styles.liveOk}>Synced {lastUpdated}</span>
          ) : (
            <span className={styles.liveMuted}>Live summary pending</span>
          )}
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => void refresh()}
            aria-label="Refresh live summary"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {summaryCards.length > 0 ? (
        <section className={styles.summaryStrip} aria-label="Live snapshot">
          {summaryCards.map((c) => (
            <div key={c.label} className={styles.summaryItem}>
              <span className={`${styles.summaryValue} ${styles[`summary${c.tone[0].toUpperCase()}${c.tone.slice(1)}`]}`}>
                {c.value}
              </span>
              <span className={styles.summaryLabel}>{c.label}</span>
            </div>
          ))}
          <span className={styles.summaryNote}>Updated every 30 s in background</span>
        </section>
      ) : (
        <p className={styles.summaryMissing}>
          Live snapshot not available yet — run{" "}
          <code className={styles.code}>refresh_all_dashboard_summaries()</code> after migration 00019.
        </p>
      )}

      <section className={styles.kpiGrid} aria-label="Key metrics">
        {kpis.map((k) => (
          <div key={k.label} className={styles.kpiCard}>
            <div className={styles.kpiIcon}>
              <k.icon size={20} />
            </div>
            <div className={styles.kpiValue}>{k.value}</div>
            <div className={styles.kpiLabel}>{k.label}</div>
            <div className={styles.kpiHint}>{k.hint}</div>
          </div>
        ))}
      </section>

      {hasCharts || hasBreakdowns ? (
        <section className={styles.chartsGrid} aria-label="Trends and breakdowns">
          {hasCharts ? (
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Orders & revenue — last 30 days</h2>
              <div className={styles.verticalBars} aria-hidden="true">
                {stats.ordersDaily.map((d) => (
                  <div key={d.day} className={styles.barCol} title={`${d.day}: ${d.orders} orders`}>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barOrders}
                        style={{ height: `${Math.max(1.5, (d.orders / maxDaily) * 100)}%` }}
                      />
                      <div
                        className={styles.barRevenue}
                        style={{ height: `${Math.max(1.5, (d.revenue / maxDaily) * 100)}%` }}
                      />
                    </div>
                    <span className={styles.barLabel}>{d.day.slice(8)}</span>
                  </div>
                ))}
              </div>
              <div className={styles.legend}>
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendOrders}`} aria-hidden="true" />
                  Orders
                </span>
                <span className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.legendRevenue}`} aria-hidden="true" />
                  Revenue (scaled)
                </span>
              </div>
            </div>
          ) : null}

          {stats.ordersByPackType.length > 0 ? (
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Orders by pack type</h2>
              <div className={styles.hbarList}>
                {stats.ordersByPackType.map((b) => (
                  <div key={b.label} className={styles.hbarRow}>
                    <span className={styles.hbarLabel} title={b.label}>{b.label}</span>
                    <span className={styles.hbarTrack}>
                      <span
                        className={styles.hbarFill}
                        style={{ width: `${Math.max(4, (b.count / maxPack) * 100)}%` }}
                      />
                    </span>
                    <span className={styles.hbarValue}>{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {stats.schoolsByCity.length > 0 ? (
            <div className={styles.chartCard}>
              <h2 className={styles.chartTitle}>Schools by city</h2>
              <div className={styles.hbarList}>
                {stats.schoolsByCity.map((b) => (
                  <div key={b.label} className={styles.hbarRow}>
                    <span className={styles.hbarLabel} title={b.label}>{b.label}</span>
                    <span className={styles.hbarTrack}>
                      <span
                        className={styles.hbarFillCity}
                        style={{ width: `${Math.max(4, (b.count / maxCity) * 100)}%` }}
                      />
                    </span>
                    <span className={styles.hbarValue}>{b.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className={styles.recentSection} aria-label="Recent orders">
        <div className={styles.recentHeader}>
          <h2 className={styles.recentTitle}>Recent orders</h2>
          <span className={styles.recentCount}>{stats.recentOrders.length} latest</span>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className={styles.emptyNote}>No orders yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.recentTable}>
              <caption className={styles.visuallyHidden}>Most recent customer orders</caption>
              <thead>
                <tr>
                  <th scope="col">Reference</th>
                  <th scope="col">Buyer</th>
                  <th scope="col">School</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td data-label="Reference">
                      <span className={styles.ref}>{o.order_reference}</span>
                    </td>
                    <td data-label="Buyer">{o.buyer_name || "—"}</td>
                    <td data-label="School">{o.school_name || "—"}</td>
                    <td data-label="Total">
                      {o.estimated_total != null
                        ? formatCurrency(o.estimated_total)
                        : "Quote"}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={o.status} />
                    </td>
                    <td data-label="Date">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
