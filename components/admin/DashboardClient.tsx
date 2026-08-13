"use client";

/**
 * PexPacks Supplies — Administration Dashboard (DashboardClient)
 *
 * Hyper-fast, mobile-first, zero-lag operational dashboard.
 * Designed following the PexPacks Dark Palette, 3-layer architecture
 * (UI -> Server Actions -> Data Layer), SWR caching, and WCAG accessibility.
 *
 * Live numbers come from the RBAC-gated /api/admin/dashboard/summary (SWR);
 * charts use the server-rendered `stats` prop. No fabricated metrics.
 */

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  School,
  Package,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  CalendarDays,
  Clock,
  PackageCheck,
  AlertTriangle,
  Boxes,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { GradePackItemSelector } from "@/components/grade-packs/GradePackItemSelector";
import type { DashboardStats, DailyPoint, NameCount } from "@/lib/admin/dashboard";
import { orderStatusLabel, orderStatusTone } from "@/lib/admin/order-constants";
import styles from "./DashboardClient.module.css";

export interface DashboardClientProps {
  stats?: DashboardStats;
  userName?: string;
  userRole?: string;
}

type MetricTone = "emerald" | "amber" | "info" | "red" | "indigo" | "blue";

interface MetricCard {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: MetricTone;
  currency?: boolean;
}

function formatCurrency(value: number): string {
  return `R ${value.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function metricToneClass(tone: MetricTone): string {
  switch (tone) {
    case "emerald":
      return styles.iconEmerald;
    case "amber":
      return styles.iconAmber;
    case "info":
      return styles.iconInfo;
    case "red":
      return styles.iconRed;
    default:
      return styles.iconIndigo;
  }
}

function StatusBadge({ status }: { status: string }) {
  const tone = orderStatusTone(status);
  const cls =
    tone === "paid"
      ? styles.badgePaid
      : tone === "danger"
        ? styles.badgeDanger
        : tone === "pending"
          ? styles.badgePending
          : tone === "info"
            ? styles.badgeInfo
            : styles.badgeMuted;
  return (
    <span className={`${styles.badge} ${cls}`}>
      <span aria-hidden="true" className={styles.badgeDot} />
      {orderStatusLabel(status)}
    </span>
  );
}

function ChartCard({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.chartCard} aria-label={title}>
      <div className={styles.chartCardHeader}>
        <h3 className={styles.chartCardTitle}>{title}</h3>
        {sub ? <p className={styles.chartCardSub}>{sub}</p> : null}
      </div>
      {children}
    </section>
  );
}

function VerticalBars({
  points,
  valueFormatter,
  color,
  label,
}: {
  points: { label: string; value: number }[];
  valueFormatter: (value: number) => string;
  color: "accent" | "info";
  label: string;
}) {
  if (points.length === 0) {
    return <p className={styles.emptyText}>No data available yet.</p>;
  }
  const max = Math.max(1, ...points.map((p) => p.value));
  const peak = points.reduce((a, b) => (b.value > a.value ? b : a), points[0]);
  const barClass = color === "accent" ? styles.chartBar : styles.chartBarInfo;
  return (
    <div role="img" aria-label={`${label} Peak ${valueFormatter(peak.value)} on ${peak.label}.`}>
      <div className={styles.chartBars}>
        {points.map((p) => {
          const height = Math.round((p.value / max) * 100);
          return (
            <div key={p.label} className={styles.chartBarCol}>
              <div
                className={barClass}
                style={{ height: `${Math.max(height, p.value > 0 ? 4 : 2)}%` }}
                title={`${p.label}: ${valueFormatter(p.value)}`}
              />
            </div>
          );
        })}
      </div>
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}

function HBars({ rows }: { rows: NameCount[] }) {
  if (rows.length === 0) {
    return <p className={styles.emptyText}>No data available yet.</p>;
  }
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className={styles.hBars}>
      {rows.map((row) => (
        <div key={row.label} className={styles.hBarRow}>
          <span className={styles.hBarLabel} title={row.label}>
            {row.label}
          </span>
          <span className={styles.hBarTrack}>
            <span
              className={styles.hBarFill}
              style={{ width: `${Math.max(Math.round((row.count / max) * 100), 4)}%` }}
            />
          </span>
          <span className={styles.hBarValue}>{row.count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function DashboardClient({
  stats,
  userName = "PexPacks Staff",
  userRole = "Administrator",
}: DashboardClientProps) {
  const { summary, isLoading, isRefreshing, refresh } = useDashboardSummary();
  const [activeTab, setActiveTab] = useState<"overview" | "pack-builder">("overview");

  // Prefer live SWR summary; fall back to server-rendered stats (never fabricated).
  const totalOrders = summary?.total_orders ?? stats?.orders?.total ?? 0;
  const paidOrders = summary?.paid_orders ?? 0;
  const pendingPayments = summary?.pending_orders ?? 0;
  const totalRevenue = summary?.total_revenue ?? stats?.orders?.revenue ?? 0;
  const totalSchools = summary?.total_schools ?? stats?.schools?.total ?? 0;
  const totalPacks = summary?.total_packs ?? stats?.packs ?? 0;
  const ordersToday = summary?.orders_today ?? 0;
  const ordersThisWeek = summary?.orders_this_week ?? 0;
  const readyToFulfil = summary?.awaiting_fulfilment ?? 0;
  const completedOrders = summary?.completed_orders ?? 0;
  const activePacks = summary?.active_packs ?? totalPacks;

  const lastUpdated = summary?.last_updated_at ? new Date(summary.last_updated_at) : null;
  const refreshedAt = lastUpdated
    ? lastUpdated.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })
    : null;
  const freshness = isLoading
    ? "Loading live metrics…"
    : refreshedAt
      ? `Data refreshed at ${refreshedAt}`
      : "Live metrics";

  const metrics: MetricCard[] = [
    {
      label: "Orders Today",
      value: ordersToday,
      hint: `This week: ${ordersThisWeek.toLocaleString()}`,
      icon: CalendarDays,
      tone: "amber",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      hint: "Awaiting payment",
      icon: Clock,
      tone: "amber",
    },
    {
      label: "Ready to Fulfil",
      value: readyToFulfil,
      hint: "Paid & in packing",
      icon: PackageCheck,
      tone: "info",
    },
    {
      label: "Completed",
      value: completedOrders,
      hint: "Delivered orders",
      icon: CheckCircle2,
      tone: "emerald",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      hint: `${paidOrders.toLocaleString()} paid`,
      icon: ShoppingBag,
      tone: "indigo",
    },
    {
      label: "Total Revenue",
      value: totalRevenue,
      hint: "Confirmed payments",
      icon: TrendingUp,
      tone: "emerald",
      currency: true,
    },
    {
      label: "Active Schools",
      value: totalSchools,
      hint: "Directory listed",
      icon: School,
      tone: "blue",
    },
    {
      label: "Active Packs",
      value: activePacks,
      hint: "Visible stationery packs",
      icon: Boxes,
      tone: "info",
    },
  ];

  const alerts: {
    tone: MetricTone;
    icon: LucideIcon;
    title: string;
    body: string;
    href: string;
  }[] = [];
  const pendingSchools = stats?.schools?.pending ?? 0;
  if (pendingPayments > 0) {
    alerts.push({
      tone: "amber",
      icon: Clock,
      title: `${pendingPayments.toLocaleString()} orders waiting for payment`,
      body: "Confirm or follow up on pending orders.",
      href: "/admin/orders",
    });
  }
  if (readyToFulfil > 0) {
    alerts.push({
      tone: "info",
      icon: PackageCheck,
      title: `${readyToFulfil.toLocaleString()} orders ready to fulfil`,
      body: "Paid and in packing — dispatch these next.",
      href: "/admin/orders",
    });
  }
  if (pendingSchools > 0) {
    alerts.push({
      tone: "red",
      icon: AlertTriangle,
      title: `${pendingSchools.toLocaleString()} schools pending approval`,
      body: "Review and activate new school requests.",
      href: "/admin/schools",
    });
  }

  const ordersPoints = (stats?.ordersDaily ?? []).map((d: DailyPoint) => ({
    label: formatDay(d.day),
    value: d.orders,
  }));
  const revenuePoints = (stats?.ordersDaily ?? []).map((d: DailyPoint) => ({
    label: formatDay(d.day),
    value: d.revenue,
  }));
  const recent = stats?.recentOrders ?? [];

  return (
    <div className={styles.root}>
      {/* 1. Header & Quick Switch Bar */}
      <header className={styles.header}>
        <div>
          <div className={styles.brandEyebrow}>
            <ShieldCheck className={styles.brandEyebrowIcon} /> Operational Console
          </div>
          <h1 className={styles.brandTitle}>PexPacks Administration</h1>
          <p className={styles.brandSub}>
            Welcome back, <strong>{userName}</strong> ({userRole}). Live overview &amp; inventory
            management.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => refresh()}
            className={styles.syncBtn}
            title="Refresh live metrics"
            aria-label="Refresh live metrics"
          >
            <RefreshCw className={`${styles.syncBtnIcon} ${isRefreshing ? styles.spin : ""}`} />
            <span>{isRefreshing ? "Syncing…" : "Sync Metrics"}</span>
          </button>

          <div className={styles.syncHint} aria-live="polite">
            {isRefreshing ? "Syncing in background…" : freshness}
          </div>
        </div>
      </header>

      {/* 2. Navigation Tabs */}
      <nav className={styles.tabs} aria-label="Dashboard navigation tabs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`${styles.tab} ${activeTab === "overview" ? styles.tabActive : styles.tabIdle}`}
          aria-current={activeTab === "overview" ? "page" : undefined}
        >
          <LayoutDashboard className={styles.tabIcon} />
          Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pack-builder")}
          className={`${styles.tab} ${activeTab === "pack-builder" ? styles.tabActive : styles.tabIdle}`}
          aria-current={activeTab === "pack-builder" ? "page" : undefined}
        >
          <Package className={styles.tabIcon} />
          Stationery Pack Builder
        </button>
      </nav>

      {/* 3. Tab Content */}
      {activeTab === "overview" && (
        <div className={styles.tabContent}>
          {/* Key Operational Metric Cards */}
          <section className={styles.metricsGrid} aria-label="Key performance metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className={styles.metricCard}>
                <div className={styles.metricTop}>
                  <span className={styles.metricLabel}>{metric.label}</span>
                  <div className={`${styles.metricIcon} ${metricToneClass(metric.tone)}`}>
                    <metric.icon className={styles.metricIconGlyph} />
                  </div>
                </div>
                <div className={styles.metricValueBlock}>
                  {isLoading ? (
                    <div className={styles.skeleton} />
                  ) : (
                    <div
                      className={
                        metric.currency
                          ? `${styles.metricValue} ${styles.metricValueAccent}`
                          : styles.metricValue
                      }
                    >
                      {metric.currency ? formatCurrency(metric.value) : metric.value.toLocaleString()}
                    </div>
                  )}
                  <p className={styles.metricHint}>{metric.hint}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Actionable Alerts */}
          <section className={styles.section} aria-label="Actions needing attention">
            <div className={styles.sectionHeading}>
              <h2 className={styles.sectionTitle}>What needs attention</h2>
              <p className={styles.sectionSub}>Actionable alerts across the business.</p>
            </div>

            {alerts.length > 0 ? (
              <div className={styles.alertsGrid}>
                {alerts.map((alert) => (
                  <Link key={alert.title} href={alert.href} className={styles.alertCard}>
                    <span className={`${styles.alertIcon} ${metricToneClass(alert.tone)}`}>
                      <alert.icon className={styles.alertIconGlyph} />
                    </span>
                    <span className={styles.alertBody}>
                      <span className={styles.alertTitle}>{alert.title}</span>
                      <span className={styles.alertDesc}>{alert.body}</span>
                    </span>
                    <ArrowRight className={styles.alertArrow} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.alertEmpty}>
                <CheckCircle2 className={styles.alertEmptyIcon} aria-hidden="true" />
                <div>
                  <p className={styles.alertEmptyTitle}>All clear</p>
                  <p className={styles.alertEmptyDesc}>Nothing needs your attention right now.</p>
                </div>
              </div>
            )}
          </section>

          {/* Sales & catalogue charts */}
          <section className={styles.section} aria-label="Sales and catalogue charts">
            <div className={styles.sectionHeading}>
              <h2 className={styles.sectionTitle}>Sales &amp; catalogue</h2>
              <p className={styles.sectionSub}>Orders and revenue over the last 30 days.</p>
            </div>

            <div className={styles.chartsGrid}>
              <ChartCard title="Orders per day" sub="Last 30 days">
                <VerticalBars
                  points={ordersPoints}
                  valueFormatter={(value) => value.toLocaleString()}
                  color="accent"
                  label={`Orders per day for the last 30 days. Peak ${ordersPoints.length > 0 ? ordersPoints.reduce((a, b) => (b.value > a.value ? b : a)).value.toLocaleString() : 0} orders.`}
                />
              </ChartCard>

              <ChartCard title="Revenue per day" sub="Paid orders only">
                <VerticalBars
                  points={revenuePoints}
                  valueFormatter={formatCurrency}
                  color="info"
                  label="Confirmed revenue per day for the last 30 days."
                />
              </ChartCard>

              <ChartCard title="Orders by pack type">
                <HBars rows={stats?.ordersByPackType ?? []} />
              </ChartCard>

              <ChartCard title="Schools by city" sub="Top locations">
                <HBars rows={stats?.schoolsByCity ?? []} />
              </ChartCard>
            </div>
          </section>

          {/* Recent orders */}
          <section className={styles.section} aria-label="Recent orders">
            <div className={styles.sectionHeading}>
              <div>
                <h2 className={styles.sectionTitle}>Recent orders</h2>
                <p className={styles.sectionSub}>
                  Latest {recent.length > 0 ? recent.length : ""} orders across all schools.
                </p>
              </div>
              <Link href="/admin/orders" className={styles.seeAll}>
                View all
                <ArrowRight className={styles.seeAllIcon} aria-hidden="true" />
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className={styles.emptyState}>
                <ShoppingBag className={styles.emptyStateIcon} aria-hidden="true" />
                <p className={styles.emptyStateTitle}>No orders yet</p>
                <p className={styles.emptyStateDesc}>
                  Orders will appear here as soon as customers place them.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.recentTable}>
                    <caption className={styles.srOnly}>Recent orders</caption>
                    <thead>
                      <tr>
                        <th scope="col">Reference</th>
                        <th scope="col">Customer</th>
                        <th scope="col">School</th>
                        <th scope="col">Total</th>
                        <th scope="col">Status</th>
                        <th scope="col">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <Link className={styles.orderLink} href={`/admin/orders/${order.id}`}>
                              {order.order_reference}
                            </Link>
                          </td>
                          <td>{order.buyer_name}</td>
                          <td>{order.school_name}</td>
                          <td>
                            {order.estimated_total != null
                              ? formatCurrency(order.estimated_total)
                              : "—"}
                          </td>
                          <td>
                            <StatusBadge status={order.status} />
                          </td>
                          <td>{formatShortDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <ul className={styles.recentCards}>
                  {recent.map((order) => (
                    <li key={order.id}>
                      <Link href={`/admin/orders/${order.id}`} className={styles.recentCard}>
                        <div className={styles.recentCardTop}>
                          <span className={styles.orderLink}>{order.order_reference}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className={styles.recentCardMeta}>
                          {order.school_name}
                          <span className={styles.recentCardDot}>·</span>
                          {order.buyer_name}
                        </div>
                        <div className={styles.recentCardBottom}>
                          <span className={styles.recentCardTotal}>
                            {order.estimated_total != null
                              ? formatCurrency(order.estimated_total)
                              : "—"}
                          </span>
                          <span className={styles.recentCardDate}>
                            {formatShortDate(order.created_at)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      )}

      {activeTab === "pack-builder" && (
        <section className={styles.builder} aria-label="Stationery Pack Builder Workstation">
          <div className={styles.builderIntro}>
            <h2 className={styles.builderTitle}>
              <Package className={styles.builderTitleIcon} />
              Grade Pack Builder Workstation
            </h2>
            <p className={styles.builderDesc}>
              Type stationery item names or descriptions to auto-populate prices and assemble custom
              school grade packs.
            </p>
          </div>

          <GradePackItemSelector />
        </section>
      )}
    </div>
  );
}

export default DashboardClient;
