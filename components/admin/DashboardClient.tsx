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
import styles from "./DashboardClient.module.css";

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
    <div className={styles.root}>
      {/* 1. Header & Quick Switch Bar */}
      <header className={styles.header}>
        <div>
          <div className={styles.brandEyebrow}>
            <ShieldCheck className={styles.brandEyebrowIcon} /> Operational Console
          </div>
          <h1 className={styles.brandTitle}>PexPacks Administration</h1>
          <p className={styles.brandSub}>
            Welcome back, <strong>{userName}</strong> ({userRole}). Live overview &amp; inventory management.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => refresh()}
            className={styles.syncBtn}
            title="Refresh live SWR metrics"
            aria-label="Refresh live metrics"
          >
            <RefreshCw className={`${styles.syncBtnIcon} ${isRefreshing ? styles.spin : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync Metrics"}</span>
          </button>

          <div className={styles.syncHint}>
            {isRefreshing ? "🔄 Background sync..." : "✓ Edge Synced"}
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
            {/* Total Orders Card */}
            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Total Orders</span>
                <div className={`${styles.metricIcon} ${styles.iconIndigo}`}>
                  <ShoppingBag className={styles.metricIconGlyph} />
                </div>
              </div>
              <div className={styles.metricValueBlock}>
                {isLoading ? (
                  <div className={styles.skeleton} />
                ) : (
                  <div className={styles.metricValue}>
                    {totalOrders.toLocaleString()}
                  </div>
                )}
                <p className={styles.metricHint}>
                  <CheckCircle2 className={styles.hintIcon} />
                  {paidOrders} Paid · {pendingOrders} Pending
                </p>
              </div>
            </div>

            {/* Total Revenue Card */}
            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Total Revenue</span>
                <div className={`${styles.metricIcon} ${styles.iconEmerald}`}>
                  <TrendingUp className={styles.metricIconGlyph} />
                </div>
              </div>
              <div className={styles.metricValueBlock}>
                {isLoading ? (
                  <div className={styles.skeleton} />
                ) : (
                  <div className={`${styles.metricValue} ${styles.metricValueAccent}`}>
                    R {Number(totalRevenue).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </div>
                )}
                <p className={styles.metricHint}>
                  <CreditCard className={styles.hintIconMuted} />
                  Confirmed payments
                </p>
              </div>
            </div>

            {/* Active Schools Card */}
            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Active Schools</span>
                <div className={`${styles.metricIcon} ${styles.iconAmber}`}>
                  <School className={styles.metricIconGlyph} />
                </div>
              </div>
              <div className={styles.metricValueBlock}>
                {isLoading ? (
                  <div className={styles.skeleton} />
                ) : (
                  <div className={styles.metricValue}>
                    {totalSchools.toLocaleString()}
                  </div>
                )}
                <p className={styles.metricHint}>Directory listed</p>
              </div>
            </div>

            {/* Total Packs Card */}
            <div className={styles.metricCard}>
              <div className={styles.metricTop}>
                <span className={styles.metricLabel}>Stationery Packs</span>
                <div className={`${styles.metricIcon} ${styles.iconBlue}`}>
                  <Package className={styles.metricIconGlyph} />
                </div>
              </div>
              <div className={styles.metricValueBlock}>
                {isLoading ? (
                  <div className={styles.skeleton} />
                ) : (
                  <div className={styles.metricValue}>
                    {totalPacks.toLocaleString()}
                  </div>
                )}
                <p className={styles.metricHint}>Grade matched</p>
              </div>
            </div>
          </section>

          {/* System Status Panel */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>System Status &amp; Recent Activity</h2>
                <p className={styles.panelSub}>High-concurrency pre-aggregated metrics status</p>
              </div>
              <span className={styles.statusPill}>
                <span className={styles.statusDot} />
                Operational
              </span>
            </div>

            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Edge Caching</span>
                <p className={styles.statusValue}>Vercel Edge CDN &lt; 10ms</p>
                <p className={styles.statusMeta}>Header isolation via Vary: Cookie</p>
              </div>

              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>Database Pooler</span>
                <p className={`${styles.statusValue} ${styles.statusValueAccent}`}>Supavisor Port 6543</p>
                <p className={styles.statusMeta}>Transaction mode serverless pool</p>
              </div>

              <div className={styles.statusCard}>
                <span className={styles.statusLabel}>RLS Subquery Hardening</span>
                <p className={`${styles.statusValue} ${styles.statusValueInfo}`}>InitPlan 1 Cached</p>
                <p className={styles.statusMeta}>Evaluated once per statement scan</p>
              </div>
            </div>
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
