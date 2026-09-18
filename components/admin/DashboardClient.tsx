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
import {
  CapsuleBarChart,
  HorizontalBars,
  MetricCard,
  StatusBadge,
  formatDashboardCurrency,
  type DashboardMetric,
} from "./dashboard/DashboardWidgets";

export interface DashboardClientProps {
  stats?: DashboardStats;
  userName?: string;
}

export function DashboardClient({ stats, userName }: DashboardClientProps) {
  const metrics: DashboardMetric[] = [
    {
      label: "Schools",
      value: stats?.schools?.total ?? 0,
      hint: `${stats?.schools?.partner ?? 0} partners / ${stats?.schools?.featured ?? 0} featured`,
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
      value: stats?.orders?.total ?? 0,
      hint: `${stats?.orders?.thisMonth ?? 0} this month`,
      icon: ShoppingCart,
      tone: "amber",
      href: "/admin/orders",
    },
    {
      label: "Revenue",
      value: stats?.orders?.revenue ?? 0,
      hint: "Paid order value",
      icon: BarChart3,
      tone: "emerald",
      currency: true,
      href: "/admin/payments",
    },
  ];

  return (
    <div className="flex flex-col min-w-0 gap-5 text-slate-200">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[56px]">
        <div>
          <h1 className="m-0 text-slate-100 font-sans text-2xl sm:text-3xl font-extrabold tracking-tight">
            {userName ? `Welcome, ${userName}` : "Admin dashboard"}
          </h1>
          <p className="mt-1 text-slate-400 text-xs leading-relaxed">
            Live operating view from Supabase orders, schools, packs, and assets.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/tasks"
            className="inline-flex items-center justify-center gap-2 min-h-[38px] px-4 rounded-full border border-slate-700 bg-slate-900 text-slate-200 text-xs font-bold no-underline transition-colors hover:bg-slate-800 hover:text-white"
          >
            <ClipboardList size={15} aria-hidden="true" />
            Tasks
          </Link>
          <Link
            href="/admin/procurement"
            className="inline-flex items-center justify-center gap-2 min-h-[38px] px-4 rounded-full border border-slate-700 bg-slate-900 text-slate-200 text-xs font-bold no-underline transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Box size={15} aria-hidden="true" />
            Procurement
          </Link>
        </div>
      </div>

      {!stats ? (
        <div className="p-3 px-4 border border-amber-500/35 rounded-xl bg-amber-500/10 text-amber-400 text-xs">
          Dashboard data is unavailable.
        </div>
      ) : null}

      {/* Primary KPI Cards */}
      <section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5"
        aria-label="Dashboard metrics"
      >
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            metric={metric}
            highlighted={index === 0}
          />
        ))}
      </section>

      {/* Middle Grid: Charts & Spread */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <article className="lg:col-span-5 flex flex-col justify-between min-h-[280px] p-4.5 rounded-2xl border border-slate-800 bg-slate-900 shadow-md shadow-black/20">
          <div className="flex items-start justify-between gap-3.5 mb-3.5 min-h-[36px]">
            <div>
              <h2 className="m-0 text-slate-100 text-sm font-bold leading-tight">
                Orders Last 30 Days
              </h2>
              <span className="block mt-1 text-slate-400 text-[10px]">
                Daily order count
              </span>
            </div>
            <ShoppingCart size={17} className="text-slate-400 shrink-0" aria-hidden="true" />
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

        <article className="lg:col-span-4 flex flex-col justify-between min-h-[280px] p-4.5 rounded-2xl border border-slate-800 bg-slate-900 shadow-md shadow-black/20">
          <div className="flex items-start justify-between gap-3.5 mb-3.5 min-h-[36px]">
            <div>
              <h2 className="m-0 text-slate-100 text-sm font-bold leading-tight">
                Pack Types
              </h2>
              <span className="block mt-1 text-slate-400 text-[10px]">
                Orders by selected pack type
              </span>
            </div>
            <Package size={17} className="text-slate-400 shrink-0" aria-hidden="true" />
          </div>
          <HorizontalBars rows={stats?.ordersByPackType ?? []} />
        </article>

        <article className="lg:col-span-3 flex flex-col justify-between min-h-[280px] p-4.5 rounded-2xl border border-slate-800 bg-slate-900 shadow-md shadow-black/20">
          <div className="flex items-start justify-between gap-3.5 mb-3.5 min-h-[36px]">
            <div>
              <h2 className="m-0 text-slate-100 text-sm font-bold leading-tight">
                School Cities
              </h2>
              <span className="block mt-1 text-slate-400 text-[10px]">
                Directory spread
              </span>
            </div>
            <School size={17} className="text-slate-400 shrink-0" aria-hidden="true" />
          </div>
          <HorizontalBars rows={stats?.schoolsByCity ?? []} />
        </article>
      </section>

      {/* Bottom Grid: Recent Orders & Quick Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <article className="lg:col-span-7 flex flex-col min-h-[290px] p-4.5 rounded-2xl border border-slate-800 bg-slate-900 shadow-md shadow-black/20">
          <div className="flex items-start justify-between gap-3.5 mb-3.5 min-h-[36px]">
            <div>
              <h2 className="m-0 text-slate-100 text-sm font-bold leading-tight">
                Recent Orders
              </h2>
              <span className="block mt-1 text-slate-400 text-[10px]">
                Latest checkout activity
              </span>
            </div>
            <ShoppingCart size={17} className="text-slate-400 shrink-0" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[320px]">
            {(stats?.recentOrders ?? []).length > 0 ? (
              stats!.recentOrders.map((order) => (
                <Link
                  href={`/admin/orders/${order.order_reference || order.id}`}
                  className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 p-2 rounded-xl text-slate-300 no-underline transition-colors hover:bg-slate-800/60"
                  key={order.id}
                >
                  <span className="grid w-8.5 h-8.5 place-items-center rounded-full border border-slate-700 bg-slate-800 text-emerald-400 text-[10px] font-black shrink-0">
                    {(order.buyer_name || "Customer").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <strong className="truncate text-slate-100 text-xs font-semibold">
                      {order.order_reference}
                    </strong>
                    <small className="truncate text-slate-400 text-[11px]">
                      {order.buyer_name || "Customer"} /{" "}
                      {order.school_name || "School"}
                    </small>
                  </span>
                  <StatusBadge status={order.status} />
                </Link>
              ))
            ) : (
              <p className="m-0 py-7 px-1.5 text-center text-xs text-slate-400">
                No recent orders available.
              </p>
            )}
          </div>
        </article>

        <article className="lg:col-span-5 flex flex-col justify-between min-h-[290px] p-4.5 rounded-2xl border border-slate-800 bg-slate-900 shadow-md shadow-black/20">
          <div className="flex items-start justify-between gap-3.5 mb-3.5 min-h-[36px]">
            <div>
              <h2 className="m-0 text-slate-100 text-sm font-bold leading-tight">
                Revenue Snapshot
              </h2>
              <span className="block mt-1 text-slate-400 text-[10px]">
                Current paid order value
              </span>
            </div>
            <Users size={17} className="text-slate-400 shrink-0" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800/80 my-auto">
            <div className="grid w-10 h-10 place-items-center rounded-xl bg-emerald-500/12 text-emerald-400 shrink-0">
              <BarChart3 size={22} aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <strong className="text-xl sm:text-2xl font-black text-slate-100 truncate">
                {formatDashboardCurrency(stats?.orders?.revenue ?? 0)}
              </strong>
              <span className="text-[11px] text-slate-400 truncate">
                {(stats?.users ?? 0).toLocaleString("en-ZA")} admin users /{" "}
                {(stats?.assets?.total ?? 0).toLocaleString("en-ZA")} assets
              </span>
            </div>
          </div>

          <Link
            href="/admin/payments"
            className="inline-flex items-center justify-center min-h-[38px] px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors no-underline mt-3"
          >
            Open payments
          </Link>
        </article>
      </section>
    </div>
  );
}

export default DashboardClient;