"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Layers,
  School,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import { QuickMetricsGrid } from "@/components/admin/ui/QuickMetricsGrid";
import type { OrderSummary, ReportRange, TopSchool } from "@/lib/admin/reports";

function money(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface ReportsPageViewProps {
  range: ReportRange;
  summary: OrderSummary;
  topSchools: TopSchool[];
}

export function ReportsPageView({ range, summary, topSchools }: ReportsPageViewProps) {
  const [activeCategory, setActiveCategory] = useState("overview");

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Reports & Analytics"
        subtitle={`Explore sales performance, operational fulfillment, and school engagement from ${range.from} to ${range.to}.`}
        actions={
          <AdminButton
            href="/admin/reports/export"
            variant="secondary"
            icon={<Download size={14} />}
          >
            Export Report
          </AdminButton>
        }
      />

      <div className={adminStyles.reportsLayout}>
        {/* Left Sidebar Menu */}
        <div className={`${adminStyles.tableCard} ${adminStyles.tableCardPadded12}`}>
          <div className={adminStyles.reportsCatLabel}>
            Report Categories
          </div>
          <div className={adminStyles.reportsCatMenu}>
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "sales", label: "Sales & Revenue", icon: TrendingUp },
              { id: "orders", label: "Orders & Fulfilment", icon: ShoppingCart },
              { id: "procurement", label: "Procurement", icon: Truck },
              { id: "suppliers", label: "Supplier Performance", icon: Users },
              { id: "schools", label: "School Engagement", icon: School },
              { id: "custom", label: "Custom Reports", icon: Layers },
            ].map((cat) => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`${adminStyles.reportsCatBtn} ${active ? adminStyles.reportsCatBtnActive : ""}`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Analytics Grid */}
        <div className={adminStyles.reportsContent}>
          {/* Top 4 KPI Cards */}
          <QuickMetricsGrid
            metrics={[
              {
                label: "TOTAL REVENUE",
                value: money(summary.revenue),
                subtitle: `${summary.paidOrders} paid orders`,
                trendDirection: "up",
                tone: "emerald",
                icon: <ZarIcon size={16} />,
              },
              {
                label: "TOTAL ORDERS",
                value: summary.totalOrders.toString(),
                subtitle: `${summary.cancelledOrders} cancelled / ${summary.refundedOrders} refunded`,
                trendDirection: "up",
                tone: "cyan",
                icon: <ShoppingCart size={16} />,
              },
              {
                label: "AVERAGE ORDER VALUE",
                value: money(summary.avgOrderValue),
                subtitle: "Across selected range",
                trendDirection: "up",
                tone: "amber",
                icon: <TrendingUp size={16} />,
              },
              {
                label: "PAID ORDER RATE",
                value: summary.totalOrders > 0 ? `${Math.round((summary.paidOrders / summary.totalOrders) * 100)}%` : "0%",
                subtitle: "Paid orders / total orders",
                trendDirection: "up",
                tone: "purple",
                icon: <Truck size={16} />,
              },
            ]}
          />

          {/* Revenue Over Time & Top Schools by Revenue */}
          <div className={adminStyles.reportsGrid}>
            <div className={`${adminStyles.tableCard} ${adminStyles.tableCardPadded18}`}>
              <div className={adminStyles.reportsChartHeader}>
                <strong className={adminStyles.reportsChartTitle}>Revenue Over Time</strong>
                <select className={`${styles.selectInput} ${adminStyles.reportsChartSelect}`}><option>This Month</option></select>
              </div>
              <div className={adminStyles.reportsChartArea}>
                <svg width="100%" height="100%" viewBox="0 0 400 140" fill="none">
                  <path d="M 0 100 Q 50 110 100 80 T 200 60 T 300 20 T 400 60" stroke="#2dd4bf" strokeWidth="2.5" />
                  <circle cx="300" cy="20" r="5" fill="#2dd4bf" />
                </svg>
                <div className={adminStyles.reportsChartTooltip}>
                  <div className={adminStyles.reportsChartTooltipLabel}>{range.to}</div>
                  <strong className={adminStyles.reportsChartTooltipValue}>{money(summary.revenue)}</strong>
                </div>
              </div>
              <div className={adminStyles.reportsChartFooter}>
                <span>{range.from}</span><span>{range.to}</span>
              </div>
            </div>

            <div className={`${adminStyles.tableCard} ${adminStyles.tableCardPadded18}`}>
              <strong className={adminStyles.reportsListTitle}>Top Schools by Revenue</strong>
              <div className={adminStyles.reportsList}>
                {topSchools.map((school, index) => (
                  <div key={school.schoolName} className={adminStyles.reportsListItem}>
                    <div className={`${adminStyles.flex} ${adminStyles.itemsCenter} ${adminStyles.gap8}`}>
                      <span className={adminStyles.reportsRank}>{index + 1}.</span>
                      <span className={adminStyles.reportsSchoolName}>{school.schoolName}</span>
                    </div>
                    <strong className={adminStyles.reportsSchoolValue}>{money(school.revenue)}</strong>
                  </div>
                ))}
                {topSchools.length === 0 ? (
                  <div className={adminStyles.reportsListItem}>
                    <span className={adminStyles.reportsSchoolName}>No school revenue in this range</span>
                    <strong className={adminStyles.reportsSchoolValue}>{money(0)}</strong>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
