"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  PackageCheck,
  Search,
  TrendingDown,
  TrendingUp,
  Truck,
  Warehouse,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

interface FulfilmentRow {
  id: string;
  orderNumber: string;
  school: string;
  status: "Ready to Pack" | "In Packing" | "Picking" | "Ready for Dispatch" | "Dispatched" | "Delivered";
  batchWave: string;
  itemsCount: number;
  estDispatch: string;
}

const SEED_FULFILMENT: FulfilmentRow[] = [
  { id: "f-1", orderNumber: "ORD-10528", school: "3d Christian Academy", status: "Ready to Pack", batchWave: "BATCH-064", itemsCount: 128, estDispatch: "May 28, 2024" },
  { id: "f-2", orderNumber: "ORD-10527", school: "A Re Tlabeng Primary", status: "In Packing", batchWave: "BATCH-063", itemsCount: 76, estDispatch: "May 28, 2024" },
  { id: "f-3", orderNumber: "ORD-10526", school: "Aa Academy", status: "Picking", batchWave: "WAVE-025", itemsCount: 192, estDispatch: "May 26, 2024" },
  { id: "f-4", orderNumber: "ORD-10525", school: "Ab Phokompe Sec.", status: "Ready for Dispatch", batchWave: "BATCH-062", itemsCount: 102, estDispatch: "May 25, 2024" },
  { id: "f-5", orderNumber: "ORD-10524", school: "Crescent Primary", status: "Dispatched", batchWave: "BATCH-061", itemsCount: 58, estDispatch: "May 24, 2024" },
  { id: "f-6", orderNumber: "ORD-10523", school: "Daleview Secondary", status: "Delivered", batchWave: "BATCH-060", itemsCount: 148, estDispatch: "May 23, 2024" },
];

export function FulfilmentPageView() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Packing & Fulfilment</h1>
          <p className={styles.headerSubtitle}>Oversees packing, batching and dispatch.</p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className={adminStyles.metricsGrid4}>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Ready to Pack</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}><PackageCheck size={16} /></div>
          </div>
          <div className={adminStyles.metricValue}>356</div>
          <span className={`${adminStyles.metricTrend} ${adminStyles.metricTrendUp}`}><TrendingUp size={12} /> 15% vs last 7 days</span>
        </div>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>In Packing</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}><Boxes size={16} /></div>
          </div>
          <div className={adminStyles.metricValue}>124</div>
          <span className={`${adminStyles.metricTrend} ${adminStyles.metricTrendDown}`}><TrendingDown size={12} /> 5% vs last 7 days</span>
        </div>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Ready for Dispatch</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconGreen}`}><Truck size={16} /></div>
          </div>
          <div className={adminStyles.metricValue}>78</div>
          <span className={`${adminStyles.metricTrend} ${adminStyles.metricTrendUp}`}><TrendingUp size={12} /> 8% vs last 7 days</span>
        </div>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Dispatched Today</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconPurple}`}><Warehouse size={16} /></div>
          </div>
          <div className={adminStyles.metricValue}>42</div>
          <span className={`${adminStyles.metricTrend} ${adminStyles.metricTrendUp}`}><TrendingUp size={12} /> 18% vs last 7 days</span>
        </div>
      </div>

      <div className={adminStyles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input className={adminStyles.searchInput} placeholder="Search orders or schools..." />
          </div>
          <select className={styles.selectInput}><option>Status: All</option></select>
          <select className={styles.selectInput}><option>Batch: All</option></select>
        </div>
      </div>

      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>School</th>
                <th>Status</th>
                <th>Batch / Wave</th>
                <th>Items</th>
                <th>Est. Dispatch</th>
              </tr>
            </thead>
            <tbody>
              {SEED_FULFILMENT.map((row) => (
                <tr
                  key={row.id}
                  className={styles.dataRow}
                  onClick={() => router.push(`/admin/fulfilment/${row.orderNumber}`)}
                >
                  <td>
                    <Link
                      href={`/admin/fulfilment/${row.orderNumber}`}
                      className={adminStyles.badgeTeal}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/fulfilment/${row.orderNumber}`}
                      className={`${styles["c-white"]} ${styles["fw-700"]}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {row.school}
                    </Link>
                  </td>
                  <td>
                    <span className={
                      row.status === "Ready to Pack" ? adminStyles.badgeTeal :
                      row.status === "In Packing" ? adminStyles.badgeBlue :
                      row.status === "Ready for Dispatch" ? adminStyles.badgeGreen :
                      row.status === "Dispatched" ? adminStyles.badgePurple :
                      row.status === "Delivered" ? adminStyles.badgeGreen :
                      adminStyles.badgeAmber
                    }>
                      {row.status}
                    </span>
                  </td>
                  <td><span className={adminStyles.badgeDark}>{row.batchWave}</span></td>
                  <td>{row.itemsCount}</td>
                  <td>{row.estDispatch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to 6 of 124 orders</span>
          <div className={adminStyles.paginationControls}>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>4</button>
            <button className={styles.pageBtn}>5</button>
            <span style={{ padding: "0 4px" }}>...</span>
            <button className={styles.pageBtn}>21</button>
          </div>
        </div>
      </div>
    </div>
  );
}
