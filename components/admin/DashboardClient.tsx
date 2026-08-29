"use client";

import Link from "next/link";
import {
  BarChart3,
  Box,
  ClipboardList,
  Package,
  School,
  ShoppingCart,
  Users,
} from "lucide-react";
import type { DashboardStats } from "@/lib/admin/dashboard";
import { orderStatusLabel, orderStatusTone } from "@/lib/admin/order-constants";
import {
  CapsuleBarChart,
  HorizontalBars,
  MetricCard,
  formatDashboardCurrency,
  type DashboardMetric,
} from "./dashboard/DashboardWidgets";
import styles from "./DashboardClient.module.css";

export interface DashboardClientProps {
  stats?: DashboardStats;
  userName?: string;
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
  });
}

function statusClass(status: string): string {
  const tone = orderStatusTone(status);
  if (tone === "paid") return styles.statusPaid;
  if (tone === "pending") return styles.statusPending;
  if (tone === "danger") return styles.statusDanger;
  if (tone === "info") return styles.statusInfo;
  return styles.statusMuted;
}

export function DashboardClient({ stats, userName }: DashboardClientProps) {
  const metrics: DashboardMetric[] = [
    {
      label: "Schools",
      value: stats?.schools.total ?? 0,
      hint: `${stats?.schools.partner ?? 0} partners / ${stats?.schools.featured ?? 0} featured`,
      icon: School,
      tone: "emerald",
      href: "/admin/schools",
    },
    {
      label: "Grade Packs",
      value: stats?.packs ?? 0,
      hint: "Configured pack records",
      icon: Package,
      tone: "info",
      href: "/admin/packs",
    },
    {
      label: "Orders",
      value: stats?.orders.total ?? 0,
      hint: `${stats?.orders.thisMonth ?? 0} this month`,
      icon: ShoppingCart,
      tone: "amber",
      href: "/admin/orders",
    },
    {
      label: "Revenue",
      value: stats?.orders.revenue ?? 0,
      hint: "Paid order value",
      icon: BarChart3,
      tone: "emerald",
      currency: true,
      href: "/admin/reports",
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1>{userName ? `Welcome, ${userName}` : "Admin dashboard"}</h1>
          <p>Live operating view from Supabase orders, schools, packs, and assets.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/tasks" className={styles.secondaryAction}>
            <ClipboardList aria-hidden="true" /> Tasks
          </Link>
          <Link href="/admin/procurement" className={styles.secondaryAction}>
            <Box aria-hidden="true" /> Procurement
          </Link>
        </div>
      </div>

      {!stats ? (
        <div className={styles.dataNotice}>Dashboard data is unavailable.</div>
      ) : null}

      <section className={styles.primaryMetrics} aria-label="Dashboard metrics">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} metric={metric} highlighted={index === 0} />
        ))}
      </section>

      <section className={styles.middleGrid}>
        <article className={`${styles.panel} ${styles.analyticsPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Orders Last 30 Days</h2>
              <span>Daily order count</span>
            </div>
            <ShoppingCart aria-hidden="true" />
          </div>
          <CapsuleBarChart
            points={(stats?.ordersDaily ?? []).map((point) => ({
              label: point.day,
              shortLabel: point.day.slice(5),
              value: point.orders,
            }))}
            valueFormatter={(value) => value.toLocaleString("en-ZA")}
            label="Orders placed during the last 30 days"
          />
        </article>

        <article className={`${styles.panel} ${styles.queuePanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Pack Types</h2>
              <span>Orders by selected pack type</span>
            </div>
            <Package aria-hidden="true" />
          </div>
          <HorizontalBars rows={stats?.ordersByPackType ?? []} />
        </article>

        <article className={`${styles.panel} ${styles.reminderPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>School Cities</h2>
              <span>Directory spread</span>
            </div>
            <School aria-hidden="true" />
          </div>
          <HorizontalBars rows={stats?.schoolsByCity ?? []} />
        </article>
      </section>

      <section className={styles.bottomGrid}>
        <article className={`${styles.panel} ${styles.activityPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recent Orders</h2>
              <span>Latest checkout activity</span>
            </div>
            <ShoppingCart aria-hidden="true" />
          </div>
          <div className={styles.activityList}>
            {(stats?.recentOrders ?? []).length > 0 ? (
              stats!.recentOrders.map((order) => (
                <Link href={`/admin/orders/${order.order_reference || order.id}`} className={styles.activityItem} key={order.id}>
                  <span className={styles.activityAvatar}>{order.buyer_name.slice(0, 2).toUpperCase()}</span>
                  <span className={styles.activityCopy}>
                    <strong>{order.order_reference}</strong>
                    <small>{order.buyer_name} / {order.school_name}</small>
                  </span>
                  <span className={`${styles.statusBadge} ${statusClass(order.status)}`}>
                    <i /> {orderStatusLabel(order.status)}
                  </span>
                </Link>
              ))
            ) : (
              <p className={styles.emptyText}>No recent orders available.</p>
            )}
          </div>
        </article>

        <article className={`${styles.panel} ${styles.progressPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Revenue Snapshot</h2>
              <span>Current paid order value</span>
            </div>
            <Users aria-hidden="true" />
          </div>
          <div className={styles.attentionEmpty}>
            <BarChart3 aria-hidden="true" />
            <div>
              <strong>{formatDashboardCurrency(stats?.orders.revenue ?? 0)}</strong>
              <span>{(stats?.users ?? 0).toLocaleString("en-ZA")} admin users / {(stats?.assets.total ?? 0).toLocaleString("en-ZA")} assets</span>
            </div>
          </div>
          <Link href="/admin/reports" className={styles.panelAction}>
            Open reports
          </Link>
        </article>
      </section>
    </div>
  );
}

export default DashboardClient;