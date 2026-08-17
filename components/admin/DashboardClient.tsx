"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import type { DashboardStats, DailyPoint } from "@/lib/admin/dashboard";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import {
  AttentionList,
  CapsuleBarChart,
  FulfilmentGauge,
  MetricCard,
  StatusBadge,
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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "PX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function DashboardClient({ stats }: DashboardClientProps) {
  const { summary, isLoading, isRefreshing, isError, refresh } = useDashboardSummary();

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
  const metricLoading = isLoading && !stats;

  const refreshedAt = summary?.last_updated_at
    ? new Date(summary.last_updated_at).toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

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
      label: "Completed Orders",
      value: completedOrders,
      hint: `${totalOrders.toLocaleString("en-ZA")} orders recorded`,
      icon: CheckCircle2,
      tone: "neutral",
      href: "/admin/orders",
    },
    {
      label: "Active Packs",
      value: activePacks,
      hint: `${totalPacks.toLocaleString("en-ZA")} packs in the catalogue`,
      icon: Boxes,
      tone: "neutral",
      href: "/admin/packs",
    },
    {
      label: "Pending Dispatch",
      value: readyToFulfil,
      hint: `${ordersThisWeek.toLocaleString("en-ZA")} orders received this week`,
      icon: PackageCheck,
      tone: "amber",
      href: "/admin/orders",
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
      title: `${readyToFulfil.toLocaleString("en-ZA")} ready to dispatch`,
      body: "Paid and packing orders should move next.",
      href: "/admin/orders",
      accessibilityLabel: `${readyToFulfil} orders are ready for fulfilment`,
    });
  }
  if ((stats?.schools.pending ?? 0) > 0) {
    attentionItems.push({
      tone: "red",
      icon: AlertTriangle,
      title: `${stats?.schools.pending.toLocaleString("en-ZA")} schools pending`,
      body: "Review new school requests.",
      href: "/admin/schools",
      accessibilityLabel: `${stats?.schools.pending} schools require approval`,
    });
  }

  const orderPoints = (stats?.ordersDaily ?? []).slice(-7).map(toChartPoint);
  const packDemand = (stats?.ordersByPackType ?? []).slice(0, 5);
  const recentOrders = (stats?.recentOrders ?? []).slice(0, 4);

  return (
    <div className={styles.root} aria-label="Pexpacks administration dashboard">
      <header className={styles.dashboardHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Plan, prioritise, and fulfil school stationery orders with ease.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/items#bulk-stationery-import" className={styles.secondaryAction}>
            <ArrowDownToLine aria-hidden="true" /> Import data
          </Link>
        </div>
      </header>

      {isError ? (
        <div className={styles.dataNotice} role="status">
          Live refresh is temporarily unavailable. Showing the latest server-loaded metrics.
        </div>
      ) : null}

      <section className={styles.primaryMetrics} aria-label="Primary business metrics">
        {primaryMetrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            metric={metric}
            highlighted={index === 0}
            loading={metricLoading}
          />
        ))}
      </section>

      <section className={styles.middleGrid} aria-label="Order analytics and operational queues">
        <article className={`${styles.panel} ${styles.analyticsPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Order Analytics</h2>
              <span>Last 7 days</span>
            </div>
            <BarChart3 aria-hidden="true" />
          </div>
          <CapsuleBarChart
            points={orderPoints}
            valueFormatter={(value) => `${value.toLocaleString("en-ZA")} orders`}
            label="Order volume over the last seven days"
          />
        </article>

        <article className={`${styles.panel} ${styles.reminderPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Reminders</h2>
              <span>What needs attention</span>
            </div>
            <AlertTriangle aria-hidden="true" />
          </div>
          <AttentionList items={attentionItems} />
          <Link href="/admin/orders" className={styles.panelAction}>
            Review orders <ArrowRight aria-hidden="true" />
          </Link>
        </article>

        <article className={`${styles.panel} ${styles.queuePanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Pack Demand</h2>
              <span>Orders by pack type</span>
            </div>
            <Link href="/admin/reports" className={styles.miniAction}>View</Link>
          </div>
          {packDemand.length ? (
            <div className={styles.queueList}>
              {packDemand.map((row, index) => (
                <div className={styles.queueItem} key={row.label}>
                  <i className={styles[`queueMarker${(index % 4) + 1}`]} aria-hidden="true" />
                  <span><strong>{row.label}</strong><small>Confirmed orders</small></span>
                  <b>{row.count.toLocaleString("en-ZA")}</b>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Pack demand will appear after orders are placed.</p>
          )}
        </article>
      </section>

      <section className={styles.bottomGrid} aria-label="Recent activity and fulfilment progress">
        <article className={`${styles.panel} ${styles.activityPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent Order Activity</h2>
              <span>Latest packing work</span>
            </div>
            <Link href="/admin/orders" className={styles.miniAction}>View all</Link>
          </div>
          {recentOrders.length ? (
            <div className={styles.activityList}>
              {recentOrders.map((order) => (
                <Link
                  href={`/admin/orders/${order.order_reference || order.id}`}
                  className={styles.activityItem}
                  key={order.id}
                >
                  <span className={styles.activityAvatar}>{initials(order.buyer_name)}</span>
                  <span className={styles.activityCopy}>
                    <strong>{order.buyer_name}</strong>
                    <small>{order.school_name} / {formatDate(order.created_at)}</small>
                  </span>
                  <StatusBadge status={order.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <ShoppingBag aria-hidden="true" />
              <strong>No orders yet</strong>
              <span>New customer orders will appear here.</span>
            </div>
          )}
        </article>

        <article className={`${styles.panel} ${styles.progressPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Fulfilment Progress</h2>
              <span>Completed against active pipeline</span>
            </div>
            <PackageCheck aria-hidden="true" />
          </div>
          <FulfilmentGauge
            completed={completedOrders}
            awaiting={readyToFulfil}
            available={summaryAvailable}
          />
        </article>

        <article className={styles.livePanel}>
          <div>
            <span className={styles.liveKicker}>Live Metrics</span>
            <strong className={styles.liveTime}>{refreshedAt ?? "--:--:--"}</strong>
            <small>Last database sync</small>
          </div>
          <div className={styles.liveStats}>
            <span><b>{ordersToday.toLocaleString("en-ZA")}</b>Orders today</span>
            <span><b>{totalSchools.toLocaleString("en-ZA")}</b>Schools</span>
          </div>
          <div className={styles.liveControls}>
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              aria-label="Refresh dashboard metrics"
              title="Refresh metrics"
            >
              <RefreshCw className={isRefreshing ? styles.spin : ""} aria-hidden="true" />
            </button>
            <Link href="/admin/reports" aria-label="Open reports" title="Reports">
              <BarChart3 aria-hidden="true" />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

export default DashboardClient;
