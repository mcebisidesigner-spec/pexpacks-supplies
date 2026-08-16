"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Package,
  PackageCheck,
  RefreshCw,
  School,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { GradePackItemSelector } from "@/components/grade-packs/GradePackItemSelector";
import type { DashboardStats, DailyPoint } from "@/lib/admin/dashboard";
import { orderStatusLabel } from "@/lib/admin/order-constants";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import {
  AttentionList,
  CapsuleBarChart,
  FulfilmentGauge,
  HorizontalBars,
  MetricCard,
  StatusBadge,
  formatDashboardCurrency,
  type DashboardAttentionItem,
  type DashboardMetric,
} from "./dashboard/DashboardWidgets";
import styles from "./DashboardClient.module.css";

export interface DashboardClientProps {
  stats?: DashboardStats;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toChartPoint(point: DailyPoint) {
  const date = new Date(point.day);
  return {
    label: formatDate(point.day),
    shortLabel: Number.isNaN(date.getTime())
      ? point.day
      : date.toLocaleDateString("en-ZA", { weekday: "narrow" }),
    value: point.orders,
  };
}

function toRevenuePoint(point: DailyPoint) {
  const date = new Date(point.day);
  return {
    label: formatDate(point.day),
    shortLabel: Number.isNaN(date.getTime())
      ? point.day
      : date.toLocaleDateString("en-ZA", { day: "numeric" }),
    value: point.revenue,
  };
}

export function DashboardClient({ stats }: DashboardClientProps) {
  const { summary, isLoading, isRefreshing, isError, refresh } = useDashboardSummary();
  const [activeTab, setActiveTab] = useState<"overview" | "pack-builder">("overview");

  const totalOrders = summary?.total_orders ?? stats?.orders.total ?? 0;
  const totalRevenue = summary?.total_revenue ?? stats?.orders.revenue ?? 0;
  const paidOrders = summary?.paid_orders ?? 0;
  const pendingPayments = summary?.pending_orders ?? 0;
  const totalSchools = summary?.total_schools ?? stats?.schools.total ?? 0;
  const totalPacks = summary?.total_packs ?? stats?.packs ?? 0;
  const ordersToday = summary?.orders_today ?? 0;
  const ordersThisWeek = summary?.orders_this_week ?? 0;
  const readyToFulfil = summary?.awaiting_fulfilment ?? 0;
  const completedOrders = summary?.completed_orders ?? 0;
  const activePacks = summary?.active_packs ?? totalPacks;
  const summaryAvailable = Boolean(summary);

  const refreshedAt = summary?.last_updated_at
    ? new Date(summary.last_updated_at).toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;
  const freshness = isLoading
    ? "Loading live metrics..."
    : refreshedAt
      ? `Data refreshed at ${refreshedAt}`
      : "Using server metrics";

  const primaryMetrics: DashboardMetric[] = [
    {
      label: "Total Revenue",
      value: totalRevenue,
      hint: `${paidOrders.toLocaleString("en-ZA")} confirmed paid orders`,
      icon: TrendingUp,
      tone: "emerald",
      currency: true,
      href: "/admin/payments",
    },
    {
      label: "Orders Today",
      value: ordersToday,
      hint: `${ordersThisWeek.toLocaleString("en-ZA")} received this week`,
      icon: CalendarDays,
      tone: "info",
      href: "/admin/orders",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      hint: "Awaiting payment confirmation",
      icon: Clock,
      tone: "amber",
      href: "/admin/orders",
    },
    {
      label: "Ready to Fulfil",
      value: readyToFulfil,
      hint: "Paid or currently being packed",
      icon: PackageCheck,
      tone: "info",
      href: "/admin/orders",
    },
  ];

  const secondaryMetrics: DashboardMetric[] = [
    {
      label: "Completed",
      value: completedOrders,
      hint: "Delivered orders",
      icon: CheckCircle2,
      tone: "emerald",
      href: "/admin/orders",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      hint: "All recorded orders",
      icon: ShoppingBag,
      tone: "neutral",
      href: "/admin/orders",
    },
    {
      label: "Schools",
      value: totalSchools,
      hint: "Directory listings",
      icon: School,
      tone: "neutral",
      href: "/admin/schools",
    },
    {
      label: "Active Packs",
      value: activePacks,
      hint: "Visible stationery packs",
      icon: Boxes,
      tone: "neutral",
      href: "/admin/packs",
    },
  ];

  const attentionItems: DashboardAttentionItem[] = [];
  if (pendingPayments > 0) {
    attentionItems.push({
      tone: "amber",
      icon: Clock,
      title: `${pendingPayments.toLocaleString("en-ZA")} awaiting payment`,
      body: "Confirm or follow up on pending orders.",
      href: "/admin/orders",
      accessibilityLabel: `${pendingPayments} orders require payment confirmation`,
    });
  }
  if (readyToFulfil > 0) {
    attentionItems.push({
      tone: "info",
      icon: PackageCheck,
      title: `${readyToFulfil.toLocaleString("en-ZA")} ready to fulfil`,
      body: "Paid and packing orders should be dispatched next.",
      href: "/admin/orders",
      accessibilityLabel: `${readyToFulfil} orders are ready for fulfilment`,
    });
  }
  if ((stats?.schools.pending ?? 0) > 0) {
    attentionItems.push({
      tone: "red",
      icon: AlertTriangle,
      title: `${stats?.schools.pending.toLocaleString("en-ZA")} schools pending`,
      body: "Review and activate new school requests.",
      href: "/admin/schools",
      accessibilityLabel: `${stats?.schools.pending} schools require approval`,
    });
  }

  const orderPoints = (stats?.ordersDaily ?? []).slice(-7).map(toChartPoint);
  const revenuePoints = (stats?.ordersDaily ?? []).slice(-14).map(toRevenuePoint);
  const recentOrders = stats?.recentOrders ?? [];

  return (
    <div className={styles.root} aria-label="Pexpacks administration dashboard">
      <header className={styles.dashboardHeader}>
        <div>
          <span className={styles.dashboardEyebrow}>Operational overview</span>
          <h1>Dashboard</h1>
          <p>Live overview of Pexpacks orders, payments, fulfilment and catalogue activity.</p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.syncButton}
            onClick={() => void refresh()}
            disabled={isRefreshing}
          >
            <RefreshCw className={isRefreshing ? styles.spin : ""} aria-hidden="true" />
            {isRefreshing ? "Syncing..." : "Sync Metrics"}
          </button>
          <span className={styles.freshness} aria-live="polite">
            <i aria-hidden="true" />
            {freshness}
          </span>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Dashboard views">
        <button
          type="button"
          className={activeTab === "overview" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("overview")}
          aria-pressed={activeTab === "overview"}
        >
          <LayoutDashboard aria-hidden="true" /> Overview
        </button>
        <button
          type="button"
          className={activeTab === "pack-builder" ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab("pack-builder")}
          aria-pressed={activeTab === "pack-builder"}
        >
          <Package aria-hidden="true" /> Stationery Pack Builder
        </button>
      </nav>

      {isError ? (
        <div className={styles.dataNotice} role="status">
          Live refresh is temporarily unavailable. Showing the latest server-loaded metrics.
        </div>
      ) : null}

      {activeTab === "overview" ? (
        <div className={styles.dashboardContent}>
          <section className={styles.primaryMetrics} aria-label="Primary business metrics">
            {primaryMetrics.map((metric, index) => (
              <MetricCard key={metric.label} metric={metric} highlighted={index === 0} loading={isLoading} />
            ))}
          </section>

          <section className={styles.secondaryMetrics} aria-label="Supporting business metrics">
            {secondaryMetrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} loading={isLoading} />
            ))}
          </section>

          <section className={styles.operationsGrid} aria-label="Order activity and alerts">
            <article className={`${styles.panel} ${styles.activityPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelKicker}>Last 7 days</span>
                  <h2>Order Activity</h2>
                </div>
                <BarChart3 aria-hidden="true" />
              </div>
              <CapsuleBarChart
                points={orderPoints}
                valueFormatter={(value) => `${value.toLocaleString("en-ZA")} orders`}
                label="Order volume over the last seven days"
              />
            </article>

            <article className={`${styles.panel} ${styles.attentionPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelKicker}>Operational queue</span>
                  <h2>What needs attention</h2>
                </div>
                <AlertTriangle aria-hidden="true" />
              </div>
              <AttentionList items={attentionItems} />
            </article>
          </section>

          <section className={styles.insightsGrid} aria-label="Business analytics">
            <article className={`${styles.panel} ${styles.revenuePanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelKicker}>Paid orders only</span>
                  <h2>Revenue Activity</h2>
                </div>
                <TrendingUp aria-hidden="true" />
              </div>
              <CapsuleBarChart
                points={revenuePoints}
                valueFormatter={formatDashboardCurrency}
                label="Confirmed revenue over the last fourteen days"
              />
            </article>

            <article className={`${styles.panel} ${styles.fulfilmentPanel}`}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelKicker}>Live pipeline</span>
                  <h2>Packing &amp; Fulfilment</h2>
                </div>
                <PackageCheck aria-hidden="true" />
              </div>
              <FulfilmentGauge
                completed={completedOrders}
                awaiting={readyToFulfil}
                available={summaryAvailable}
              />
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelKicker}>Order mix</span>
                  <h2>Pack Types</h2>
                </div>
                <Boxes aria-hidden="true" />
              </div>
              <HorizontalBars rows={stats?.ordersByPackType ?? []} />
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelKicker}>Top locations</span>
                  <h2>Schools by City</h2>
                </div>
                <School aria-hidden="true" />
              </div>
              <HorizontalBars rows={stats?.schoolsByCity ?? []} />
            </article>
          </section>

          <section className={`${styles.panel} ${styles.recentPanel}`} aria-labelledby="recent-orders-heading">
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelKicker}>Latest transactions</span>
                <h2 id="recent-orders-heading">Recent Orders</h2>
              </div>
              <Link href="/admin/orders" className={styles.viewAll}>
                View all <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            {recentOrders.length ? (
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
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <Link href={`/admin/orders/${order.order_reference || order.id}`} className={styles.orderLink}>
                              {order.order_reference}
                            </Link>
                          </td>
                          <td>{order.buyer_name}</td>
                          <td>{order.school_name}</td>
                          <td>{order.estimated_total == null ? "-" : formatDashboardCurrency(order.estimated_total)}</td>
                          <td><StatusBadge status={order.status} /></td>
                          <td>{formatDate(order.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className={styles.recentCards} aria-label="Recent order cards">
                  {recentOrders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/admin/orders/${order.order_reference || order.id}`}
                        className={styles.recentCard}
                        aria-label={`Order ${order.order_reference}, ${orderStatusLabel(order.status)}`}
                      >
                        <span className={styles.recentCardTop}>
                          <strong>{order.order_reference}</strong>
                          <StatusBadge status={order.status} />
                        </span>
                        <span>{order.school_name} / {order.buyer_name}</span>
                        <span className={styles.recentCardBottom}>
                          <strong>{order.estimated_total == null ? "-" : formatDashboardCurrency(order.estimated_total)}</strong>
                          <small>{formatDate(order.created_at)}</small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className={styles.emptyState}>
                <ShoppingBag aria-hidden="true" />
                <strong>No orders yet</strong>
                <span>Orders will appear here as soon as customers place them.</span>
              </div>
            )}
          </section>
        </div>
      ) : (
        <section className={styles.builder} aria-label="Stationery Pack Builder Workstation">
          <div className={styles.builderIntro}>
            <Package aria-hidden="true" />
            <div>
              <h2>Grade Pack Builder Workstation</h2>
              <p>Search stationery items and assemble custom school grade packs.</p>
            </div>
          </div>
          <GradePackItemSelector />
        </section>
      )}
    </div>
  );
}

export default DashboardClient;
