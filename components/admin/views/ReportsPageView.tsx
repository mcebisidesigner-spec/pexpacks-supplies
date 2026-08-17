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

export function ReportsPageView() {
  const [activeCategory, setActiveCategory] = useState("overview");

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Reports</h1>
          <p className={styles.headerSubtitle}>Explore performance and operational insights.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}><Download size={14} /> Export ⌵</button>
          <button className={styles.secondaryBtn}><Calendar size={14} /> May 27 – Jun 2, 2024</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, alignItems: "start" }}>
        {/* Left Sidebar Menu */}
        <div className={styles.tableCard} style={{ padding: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8, padding: "0 8px" }}>
            Report Categories
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: active ? "rgba(13, 148, 136, 0.22)" : "transparent",
                    color: active ? "#2dd4bf" : "#94a3b8",
                    border: active ? "1px solid rgba(45, 212, 191, 0.4)" : "1px solid transparent",
                    fontSize: 12,
                    fontWeight: active ? 600 : 500,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Analytics Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Top 4 KPI Cards */}
          <div className={styles.metricsGrid4}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Total Revenue</span>
              <div className={styles.metricValue}>R1,248,950</div>
              <span className={`${styles.metricTrend} ${styles.metricTrendUp}`}><TrendingUp size={12} /> 22% vs last month</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Total Orders</span>
              <div className={styles.metricValue}>356</div>
              <span className={`${styles.metricTrend} ${styles.metricTrendUp}`}><TrendingUp size={12} /> 14% vs last month</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Average Order Value</span>
              <div className={styles.metricValue}>R23,540</div>
              <span className={`${styles.metricTrend} ${styles.metricTrendUp}`}><TrendingUp size={12} /> 6% vs last month</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>On-Time Deliveries</span>
              <div className={styles.metricValue}>96.4%</div>
              <span className={`${styles.metricTrend} ${styles.metricTrendUp}`}><TrendingUp size={12} /> 1.2% vs last month</span>
            </div>
          </div>

          {/* Revenue Over Time & Top Schools by Revenue */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
            <div className={styles.tableCard} style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <strong style={{ color: "#ffffff", fontSize: 14 }}>Revenue Over Time</strong>
                <select className={styles.selectInput} style={{ height: 28, fontSize: 11 }}><option>This Month</option></select>
              </div>
              <div style={{ position: "relative", height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="100%" height="100%" viewBox="0 0 400 140" fill="none">
                  <path d="M 0 100 Q 50 110 100 80 T 200 60 T 300 20 T 400 60" stroke="#2dd4bf" strokeWidth="2.5" />
                  <circle cx="300" cy="20" r="5" fill="#2dd4bf" />
                </svg>
                <div style={{ position: "absolute", top: 0, right: 80, background: "#090d16", border: "1px solid #2dd4bf", borderRadius: 6, padding: "4px 8px", fontSize: 10 }}>
                  <div style={{ color: "#94a3b8" }}>May 24, 2024</div>
                  <strong style={{ color: "#ffffff" }}>R 285,340</strong>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginTop: 8 }}>
                <span>May 20</span><span>May 21</span><span>May 22</span><span>May 23</span><span>May 24</span><span>May 25</span><span>May 26</span><span>May 27</span>
              </div>
            </div>

            <div className={styles.tableCard} style={{ padding: 18 }}>
              <strong style={{ color: "#ffffff", fontSize: 14, marginBottom: 14 }}>Top Schools by Revenue</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
                {[
                  { rank: 1, name: "3d Christian Academy", val: "R 285,340" },
                  { rank: 2, name: "Aa Academy", val: "R 214,520" },
                  { rank: 3, name: "Ab Phokompe Secondary", val: "R 186,210" },
                  { rank: 4, name: "A Re Tlabeng Primary", val: "R 142,760" },
                  { rank: 5, name: "Daleview Secondary", val: "R 121,700" },
                ].map((s) => (
                  <div key={s.rank} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, borderBottom: "1px solid #1e293b", paddingBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#2dd4bf", fontWeight: 700 }}>{s.rank}.</span>
                      <span style={{ color: "#ffffff" }}>{s.name}</span>
                    </div>
                    <strong style={{ color: "#34d399" }}>{s.val}</strong>
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
