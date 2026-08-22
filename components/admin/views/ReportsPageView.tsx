"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  Layers,
  LineChart,
  PieChart,
  School,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

export function ReportsPageView() {
  const [activeCategory, setActiveCategory] = useState("overview");

  return (
    <div className={styles.container}>
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Reports</h1>
          <p className={styles.headerSubtitle}>Explore performance and operational insights.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}><Download size={14} /> Export ⌵</button>
          <button className={styles.secondaryBtn}><Calendar size={14} /> May 27 – Jun 2, 2024</button>
        </div>
      </div>

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
          <div className={adminStyles.metricsGrid4}>
            <div className={adminStyles.metricCard}>
              <span className={adminStyles.metricLabel}>Total Revenue</span>
              <div className={adminStyles.metricValue}>R1,248,950</div>
              <span className={`${adminStyles.metricTrend} ${adminStyles.metricTrendUp}`}><TrendingUp size={12} /> 22% vs last month</span>
            </div>
            <div className={adminStyles.metricCard}>
              <span className={adminStyles.metricLabel}>Total Orders</span>
              <div className={adminStyles.metricValue}>356</div>
              <span className={`${adminStyles.metricTrend} ${adminStyles.metricTrendUp}`}><TrendingUp size={12} /> 14% vs last month</span>
            </div>
            <div className={adminStyles.metricCard}>
              <span className={adminStyles.metricLabel}>Average Order Value</span>
              <div className={adminStyles.metricValue}>R23,540</div>
              <span className={`${adminStyles.metricTrend} ${adminStyles.metricTrendUp}`}><TrendingUp size={12} /> 6% vs last month</span>
            </div>
            <div className={adminStyles.metricCard}>
              <span className={adminStyles.metricLabel}>On-Time Deliveries</span>
              <div className={adminStyles.metricValue}>96.4%</div>
              <span className={`${adminStyles.metricTrend} ${adminStyles.metricTrendUp}`}><TrendingUp size={12} /> 1.2% vs last month</span>
            </div>
          </div>

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
                  <div className={adminStyles.reportsChartTooltipLabel}>May 24, 2024</div>
                  <strong className={adminStyles.reportsChartTooltipValue}>R 285,340</strong>
                </div>
              </div>
              <div className={adminStyles.reportsChartFooter}>
                <span>May 20</span><span>May 21</span><span>May 22</span><span>May 23</span><span>May 24</span><span>May 25</span><span>May 26</span><span>May 27</span>
              </div>
            </div>

            <div className={`${adminStyles.tableCard} ${adminStyles.tableCardPadded18}`}>
              <strong className={adminStyles.reportsListTitle}>Top Schools by Revenue</strong>
              <div className={adminStyles.reportsList}>
                {[
                  { rank: 1, name: "3d Christian Academy", val: "R 285,340" },
                  { rank: 2, name: "Aa Academy", val: "R 214,520" },
                  { rank: 3, name: "Ab Phokompe Secondary", val: "R 186,210" },
                  { rank: 4, name: "A Re Tlabeng Primary", val: "R 142,760" },
                  { rank: 5, name: "Daleview Secondary", val: "R 121,700" },
                ].map((s) => (
                  <div key={s.rank} className={adminStyles.reportsListItem}>
                    <div className={`${adminStyles.flex} ${adminStyles.itemsCenter} ${adminStyles.gap8}`}>
                      <span className={adminStyles.reportsRank}>{s.rank}.</span>
                      <span className={adminStyles.reportsSchoolName}>{s.name}</span>
                    </div>
                    <strong className={adminStyles.reportsSchoolValue}>{s.val}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
