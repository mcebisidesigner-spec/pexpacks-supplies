"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import styles from "./CorePagesView.module.css";

interface OrderRow {
  id: string;
  orderNumber: string;
  school: string;
  orderDate: string;
  total: number;
  paymentStatus: "Paid" | "Part-Paid" | "Unpaid";
  fulfilmentStatus: "Ready to Pack" | "In Packing" | "Picking" | "Dispatched" | "Payment Pending" | "Delivered" | "Cancelled";
}

const SEED_ORDERS: OrderRow[] = [
  { id: "o-1", orderNumber: "ORD-10528", school: "3d Christian Academy", orderDate: "May 27, 2024", total: 28430.00, paymentStatus: "Paid", fulfilmentStatus: "Ready to Pack" },
  { id: "o-2", orderNumber: "ORD-10527", school: "A Re Tlabeng Primary", orderDate: "May 26, 2024", total: 16230.00, paymentStatus: "Paid", fulfilmentStatus: "In Packing" },
  { id: "o-3", orderNumber: "ORD-10526", school: "Aa Academy", orderDate: "May 26, 2024", total: 52851.00, paymentStatus: "Part-Paid", fulfilmentStatus: "Picking" },
  { id: "o-4", orderNumber: "ORD-10525", school: "Ab Phokompe Secondary", orderDate: "May 25, 2024", total: 34131.00, paymentStatus: "Paid", fulfilmentStatus: "Dispatched" },
  { id: "o-5", orderNumber: "ORD-10524", school: "Blue Hills School", orderDate: "May 25, 2024", total: 26362.00, paymentStatus: "Unpaid", fulfilmentStatus: "Payment Pending" },
  { id: "o-6", orderNumber: "ORD-10523", school: "Crescent Primary", orderDate: "May 24, 2024", total: 12450.00, paymentStatus: "Paid", fulfilmentStatus: "Delivered" },
  { id: "o-7", orderNumber: "ORD-10522", school: "Daleview Secondary", orderDate: "May 24, 2024", total: 28361.00, paymentStatus: "Paid", fulfilmentStatus: "Delivered" },
  { id: "o-8", orderNumber: "ORD-10521", school: "Edenvale Primary", orderDate: "May 23, 2024", total: 15671.00, paymentStatus: "Unpaid", fulfilmentStatus: "Cancelled" },
];

export function OrdersPageView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return SEED_ORDERS.filter((o) => {
      const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.school.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || o.paymentStatus === statusFilter || o.fulfilmentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Orders</h1>
          <p className={styles.headerSubtitle}>Track and manage customer orders.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn}><Plus size={14} /> + New Order</button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              className={styles.searchInput}
              placeholder="Search orders by number or school..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={styles.selectInput} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="Paid">Paid</option>
            <option value="Part-Paid">Part-Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <select className={styles.selectInput}>
            <option>Date: This Month</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Order #</th>
                <th>School</th>
                <th>Order Date</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Fulfilment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => (
                <tr key={ord.id} className={styles.dataRow}>
                  <td><span className={styles.badgeTeal}>{ord.orderNumber}</span></td>
                  <td><strong style={{ color: "#ffffff" }}>{ord.school}</strong></td>
                  <td>{ord.orderDate}</td>
                  <td><strong>R {ord.total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</strong></td>
                  <td>
                    <span className={ord.paymentStatus === "Paid" ? styles.badgeGreen : ord.paymentStatus === "Part-Paid" ? styles.badgeAmber : styles.badgeRed}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={
                      ord.fulfilmentStatus === "Ready to Pack" ? styles.badgeTeal :
                      ord.fulfilmentStatus === "In Packing" ? styles.badgeBlue :
                      ord.fulfilmentStatus === "Dispatched" ? styles.badgePurple :
                      ord.fulfilmentStatus === "Delivered" ? styles.badgeGreen :
                      styles.badgeAmber
                    }>
                      {ord.fulfilmentStatus}
                    </span>
                  </td>
                  <td><button className={styles.actionBtnDots}><MoreHorizontal size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to 8 of 356 orders</span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>4</button>
            <button className={styles.pageBtn}>5</button>
            <span style={{ padding: "0 4px" }}>...</span>
            <button className={styles.pageBtn}>45</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Show</span>
            <select className={styles.selectInput} style={{ height: 26, padding: "0 4px", fontSize: 11 }}>
              <option>10</option>
              <option>20</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>
    </div>
  );
}
