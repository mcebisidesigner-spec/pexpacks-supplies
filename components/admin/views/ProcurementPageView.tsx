"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import styles from "./CorePagesView.module.css";

interface PurchaseOrderRow {
  supplier: string;
  poNumber: string;
  date: string;
  totalValue: number;
  itemsCount: number;
  deliveryCount: number;
  status: "Awaiting Confirmation" | "Confirmed" | "Partially Confirmed";
}

const SEED_POS: PurchaseOrderRow[] = [
  { supplier: "Waltons", poNumber: "PO-10056", date: "May 27, 2024", totalValue: 54780.00, itemsCount: 68, deliveryCount: 42, status: "Awaiting Confirmation" },
  { supplier: "Bidvest Waltons", poNumber: "PO-10057", date: "May 26, 2024", totalValue: 82140.00, itemsCount: 92, deliveryCount: 56, status: "Confirmed" },
  { supplier: "Makro", poNumber: "PO-10058", date: "May 25, 2024", totalValue: 38431.00, itemsCount: 34, deliveryCount: 18, status: "Partially Confirmed" },
  { supplier: "Croxley", poNumber: "PO-10059", date: "May 24, 2024", totalValue: 28100.12, itemsCount: 31, deliveryCount: 9, status: "Awaiting Confirmation" },
];

export function ProcurementPageView() {
  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Procurement</h1>
          <p className={styles.headerSubtitle}>Manage purchasing and supplier confirmations.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn}><Plus size={14} /> + New Request</button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className={styles.metricsGrid4}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Outstanding PO Value</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconAmber}`}><ShoppingCart size={16} /></div>
          </div>
          <div className={styles.metricValue}>R305,620</div>
          <span className={`${styles.metricTrend} ${styles.metricTrendUp}`}><TrendingUp size={12} /> 8% vs last 7 days</span>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Open POs</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}><Truck size={16} /></div>
          </div>
          <div className={styles.metricValue}>23</div>
          <span className={`${styles.metricTrend} ${styles.metricTrendUp}`}><TrendingUp size={12} /> 2 vs last 7 days</span>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Items Awaiting Confirmation</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconBlue}`}><Clock size={16} /></div>
          </div>
          <div className={styles.metricValue}>156</div>
          <span className={`${styles.metricTrend} ${styles.metricTrendDown}`}><TrendingDown size={12} /> 12 vs last 7 days</span>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Overdue Items</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconRed}`}><AlertTriangle size={16} /></div>
          </div>
          <div className={styles.metricValue}>14</div>
          <span className={`${styles.metricTrend} ${styles.metricTrendUp}`}><TrendingUp size={12} /> 4 vs last 7 days</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input className={styles.searchInput} placeholder="Search items or suppliers..." />
          </div>
          <select className={styles.selectInput}><option>Status: All</option></select>
          <select className={styles.selectInput}><option>Group by: Supplier</option></select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>PO Number</th>
                <th>Date</th>
                <th>Total Value</th>
                <th>Items</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {SEED_POS.map((po) => (
                <tr key={po.poNumber} className={styles.dataRow}>
                  <td><strong style={{ color: "#ffffff" }}>{po.supplier}</strong></td>
                  <td><span className={styles.badgeTeal}>{po.poNumber}</span></td>
                  <td>{po.date}</td>
                  <td><strong>R {po.totalValue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</strong></td>
                  <td>{po.itemsCount}</td>
                  <td>{po.deliveryCount}</td>
                  <td>
                    <span className={po.status === "Confirmed" ? styles.badgeGreen : po.status === "Partially Confirmed" ? styles.badgeTeal : styles.badgeAmber}>
                      {po.status}
                    </span>
                  </td>
                  <td><button className={styles.actionBtnDots}><MoreHorizontal size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to 4 of 4 suppliers</span>
          <div className={styles.paginationControls}>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
          </div>
        </div>
      </div>
    </div>
  );
}
