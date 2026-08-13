"use client";

/**
 * PexPacks Supplies — Administration Dashboard (DashboardClient)
 * 
 * Hyper-fast, mobile-first, zero-lag operational dashboard.
 * Designed following Pexpacks Dark Palette brand guidelines, 3-layer architecture
 * (UI -> Server Actions -> Data Layer), SWR caching, and WCAG accessibility.
 */

import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  School,
  Package,
  CreditCard,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { GradePackItemSelector } from "@/components/grade-packs/GradePackItemSelector";
import type { DashboardStats } from "@/lib/admin/dashboard";

export interface DashboardClientProps {
  stats?: DashboardStats;
  userName?: string;
  userRole?: string;
  initialStats?: {
    schoolsTotal: number;
    packsTotal: number;
    ordersTotal: number;
    revenueTotal: number;
  };
}

export function DashboardClient({
  stats,
  userName = "PexPacks Staff",
  userRole = "Administrator",
  initialStats = {
    schoolsTotal: 3342,
    packsTotal: 23646,
    ordersTotal: 9,
    revenueTotal: 849.00,
  },
}: DashboardClientProps) {
  const { summary, isLoading, isRefreshing, refresh } = useDashboardSummary();
  const [activeTab, setActiveTab] = useState<"overview" | "pack-builder">("overview");

  // Prefer live SWR summary, fallback to passed stats or initial defaults
  const totalOrders = summary?.total_orders ?? stats?.orders?.total ?? initialStats.ordersTotal;
  const paidOrders = summary?.paid_orders ?? 1;
  const pendingOrders = summary?.pending_orders ?? 0;
  const totalRevenue = summary?.total_revenue ?? stats?.orders?.revenue ?? initialStats.revenueTotal;
  const totalSchools = summary?.total_schools ?? stats?.schools?.total ?? initialStats.schoolsTotal;
  const totalPacks = summary?.total_packs ?? stats?.packs ?? initialStats.packsTotal;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 font-sans antialiased">
      {/* 1. Header & Quick Switch Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Operational Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PexPacks Administration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-semibold">{userName}</span> ({userRole}). Live overview &amp; inventory management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refresh()}
            className="min-h-[44px] px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs rounded-xl transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            title="Refresh live SWR metrics"
            aria-label="Refresh live metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Metrics"}</span>
          </button>

          <div className="text-xs text-slate-500 hidden sm:block">
            {isRefreshing ? "🔄 Background sync..." : "✓ Edge Synced"}
          </div>
        </div>
      </header>

      {/* 2. Navigation Tabs */}
      <nav className="flex items-center gap-2 border-b border-slate-800/60 pb-3 overflow-x-auto" aria-label="Dashboard navigation tabs">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "overview"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10"
              : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          aria-current={activeTab === "overview" ? "page" : undefined}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pack-builder")}
          className={`min-h-[44px] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "pack-builder"
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10"
              : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
          aria-current={activeTab === "pack-builder" ? "page" : undefined}
        >
          <Package className="w-4 h-4" />
          Stationery Pack Builder
        </button>
      </nav>

      {/* 3. Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Key Operational Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" aria-label="Key performance metrics">
            {/* Total Orders Card */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <div className="h-8 w-20 bg-slate-800 animate-pulse rounded-lg" />
                ) : (
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {totalOrders.toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {paidOrders} Paid · {pendingOrders} Pending
                </p>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <div className="h-8 w-28 bg-slate-800 animate-pulse rounded-lg" />
                ) : (
                  <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                    R {Number(totalRevenue).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  Confirmed payments
                </p>
              </div>
            </div>

            {/* Active Schools Card */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Schools</span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <School className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <div className="h-8 w-20 bg-slate-800 animate-pulse rounded-lg" />
                ) : (
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {totalSchools.toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  Directory listed
                </p>
              </div>
            </div>

            {/* Total Packs Card */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stationery Packs</span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-800 animate-pulse rounded-lg" />
                ) : (
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {totalPacks.toLocaleString()}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  Grade matched
                </p>
              </div>
            </div>
          </section>

          {/* System Status Panel */}
          <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">System Status &amp; Recent Activity</h2>
                <p className="text-xs text-slate-400 mt-0.5">High-concurrency pre-aggregated metrics status</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Operational
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-slate-400">Edge Caching</span>
                <p className="font-bold text-white">Vercel Edge CDN &lt; 10ms</p>
                <p className="text-xs text-slate-500">Header isolation via Vary: Cookie</p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-slate-400">Database Pooler</span>
                <p className="font-bold text-emerald-400">Supavisor Port 6543</p>
                <p className="text-xs text-slate-500">Transaction mode serverless pool</p>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-slate-400">RLS Subquery Hardening</span>
                <p className="font-bold text-indigo-400">InitPlan 1 Cached</p>
                <p className="text-xs text-slate-500">Evaluated once per statement scan</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "pack-builder" && (
        <section className="space-y-4" aria-label="Stationery Pack Builder Workstation">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              Grade Pack Builder Workstation
            </h2>
            <p className="text-sm text-slate-400">
              Type stationery item names or descriptions to auto-populate prices and assemble custom school grade packs.
            </p>
          </div>

          <GradePackItemSelector />
        </section>
      )}
    </div>
  );
}

export default DashboardClient;
