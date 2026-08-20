"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Filter,
  MoreHorizontal,
  Search,
} from "lucide-react";
import styles from "./CorePagesView.module.css";

interface PaymentRow {
  id: string;
  paymentId: string;
  orderNumber: string;
  date: string;
  provider: "Yoco" | "PayFast" | "EFT" | "Card" | "HappyPay";
  amount: number;
  status: "Received" | "Partially Reconciled" | "Pending" | "Failed";
  reconciled: boolean;
}

const SEED_PAYMENTS: PaymentRow[] = [
  { id: "p-1", paymentId: "PAY-51218", orderNumber: "ORD-10528", date: "May 27, 2024", provider: "Yoco", amount: 28430.00, status: "Received", reconciled: true },
  { id: "p-2", paymentId: "PAY-51217", orderNumber: "ORD-10527", date: "May 26, 2024", provider: "PayFast", amount: 16230.00, status: "Received", reconciled: true },
  { id: "p-3", paymentId: "PAY-51216", orderNumber: "ORD-10526", date: "May 26, 2024", provider: "EFT", amount: 35435.00, status: "Partially Reconciled", reconciled: false },
  { id: "p-4", paymentId: "PAY-51215", orderNumber: "ORD-10525", date: "May 25, 2024", provider: "Yoco", amount: 34131.00, status: "Received", reconciled: true },
  { id: "p-5", paymentId: "PAY-51214", orderNumber: "ORD-10524", date: "May 25, 2024", provider: "Card", amount: 18360.00, status: "Pending", reconciled: false },
  { id: "p-6", paymentId: "PAY-51213", orderNumber: "ORD-10523", date: "May 24, 2024", provider: "EFT", amount: 12450.00, status: "Reconciled" as any, reconciled: true },
  { id: "p-7", paymentId: "PAY-51212", orderNumber: "ORD-10522", date: "May 24, 2024", provider: "PayFast", amount: 28361.00, status: "Received", reconciled: true },
  { id: "p-8", paymentId: "PAY-51211", orderNumber: "ORD-10521", date: "May 23, 2024", provider: "Yoco", amount: 15671.00, status: "Failed", reconciled: false },
];

export function PaymentsPageView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");

  const filtered = useMemo(() => {
    return SEED_PAYMENTS.filter((p) => {
      const matchSearch = p.paymentId.toLowerCase().includes(search.toLowerCase()) || p.orderNumber.toLowerCase().includes(search.toLowerCase());
      const matchProv = providerFilter === "all" || p.provider === providerFilter;
      return matchSearch && matchProv;
    });
  }, [search, providerFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Payments</h1>
          <p className={styles.headerSubtitle}>Monitor and reconcile all incoming payments.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}><Download size={14} /> Export</button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              className={styles.searchInput}
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={styles.selectInput} value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
            <option value="all">Provider: All</option>
            <option value="Yoco">Yoco</option>
            <option value="PayFast">PayFast</option>
            <option value="EFT">EFT</option>
          </select>
          <select className={styles.selectInput}>
            <option>Status: All</option>
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
                <th>Payment ID</th>
                <th>Order #</th>
                <th>Date</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reconciled</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pay) => (
                <tr
                  key={pay.id}
                  className={styles.dataRow}
                  onClick={() => router.push(`/admin/payments/${pay.orderNumber}`)}
                >
                  <td>
                    <Link
                      href={`/admin/payments/${pay.orderNumber}`}
                      className={styles.badgeTeal}
                      style={{ textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {pay.paymentId}
                    </Link>
                  </td>
                  <td>
                    <Link
                      href={`/admin/payments/${pay.orderNumber}`}
                      style={{ color: "#ffffff", fontWeight: 700, textDecoration: "none" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {pay.orderNumber}
                    </Link>
                  </td>
                  <td>{pay.date}</td>
                  <td>{pay.provider}</td>
                  <td><strong>R {pay.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</strong></td>
                  <td>
                    <span className={pay.status === "Received" ? styles.badgeGreen : pay.status === "Partially Reconciled" ? styles.badgeAmber : pay.status === "Pending" ? styles.badgeBlue : styles.badgeRed}>
                      {pay.status}
                    </span>
                  </td>
                  <td>
                    {pay.reconciled ? (
                      <CheckCircle2 size={16} color="#10b981" />
                    ) : (
                      <span style={{ color: "#64748b" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to 8 of 248 payments</span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>4</button>
            <button className={styles.pageBtn}>5</button>
            <span style={{ padding: "0 4px" }}>...</span>
            <button className={styles.pageBtn}>31</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
