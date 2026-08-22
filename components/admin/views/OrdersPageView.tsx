"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Plus, Search } from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

interface OrderRow {
  id: string;
  orderNumber: string;
  school: string;
  orderDate: string;
  total: number;
  paymentStatus: "Paid" | "Part-Paid" | "Unpaid";
  fulfilmentStatus: "Paid" | "Procurement" | "Ready to Pack" | "At Risk" | "Completed";
}

const SEED_ORDERS: OrderRow[] = [
  { id: "ord-10528", orderNumber: "ORD-10528", school: "3d Christian Academy", orderDate: "May 27, 2024", total: 28430.00, paymentStatus: "Paid", fulfilmentStatus: "Ready to Pack" },
  { id: "ord-10527", orderNumber: "ORD-10527", school: "A Re Tlabeng Primary", orderDate: "May 26, 2024", total: 16230.00, paymentStatus: "Paid", fulfilmentStatus: "Procurement" },
  { id: "ord-10526", orderNumber: "ORD-10526", school: "Aa Academy", orderDate: "May 26, 2024", total: 52851.00, paymentStatus: "Part-Paid", fulfilmentStatus: "At Risk" },
  { id: "ord-10525", orderNumber: "ORD-10525", school: "Ab Phokompe Secondary", orderDate: "May 25, 2024", total: 34131.00, paymentStatus: "Paid", fulfilmentStatus: "Completed" },
  { id: "ord-10524", orderNumber: "ORD-10524", school: "Blue Hills School", orderDate: "May 25, 2024", total: 26362.00, paymentStatus: "Paid", fulfilmentStatus: "Paid" },
];

export function OrdersPageView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filtered = useMemo(() => {
    return SEED_ORDERS.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.school.toLowerCase().includes(search.toLowerCase());
      const matchTab =
        activeTab === "all" ||
        (activeTab === "Paid" && (o.paymentStatus === "Paid" || o.fulfilmentStatus === "Paid")) ||
        o.fulfilmentStatus === activeTab;
      return matchSearch && matchTab;
    });
  }, [search, activeTab]);

  return (
    <div className={styles.container}>
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Orders &amp; Commerce{" "}
            <span className={adminStyles.headerCount}>({filtered.length})</span>
          </h1>
          <p className={styles.headerSubtitle}>Order status lifecycle &amp; fulfillment tracking</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className={`${adminStyles.flex} ${adminStyles["gap-8"]} ${adminStyles["border-b"]} ${adminStyles["pb-8"]}`}>
        {["all", "Paid", "Procurement", "Ready to Pack", "At Risk", "Completed"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${activeTab === tab ? styles.primaryBtn : styles.secondaryBtn} ${adminStyles["h-30"]} ${adminStyles["text-11"]}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "All Orders" : tab}
          </button>
        ))}
      </div>

      <div className={adminStyles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              className={adminStyles.searchInput}
              placeholder="Search orders by number or school..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Order Reference</th>
                <th>School</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Payment Status</th>
                <th>Fulfilment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => {
                const refNo = ord.orderNumber;
                return (
                  <tr
                    key={ord.id}
                    className={styles.dataRow}
                    onClick={() => router.push(`/admin/orders/${refNo}`)}
                  >
                    <td>
                      <Link
                        href={`/admin/orders/${refNo}`}
                        className={`${adminStyles.cTeal} ${adminStyles.fw700}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {refNo}
                      </Link>
                    </td>
                    <td><strong className={adminStyles.cWhite}>{ord.school}</strong></td>
                    <td>{ord.orderDate}</td>
                    <td><strong>R {ord.total.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</strong></td>
                    <td>
                      <span className={ord.paymentStatus === "Paid" ? adminStyles.badgeGreen : adminStyles.badgeAmber}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={
                        ord.fulfilmentStatus === "Ready to Pack" ? adminStyles.badgeTeal :
                        ord.fulfilmentStatus === "Procurement" ? adminStyles.badgeBlue :
                        ord.fulfilmentStatus === "At Risk" ? adminStyles.badgeRed :
                        ord.fulfilmentStatus === "Completed" ? adminStyles.badgeGreen :
                        adminStyles.badgeAmber
                      }>
                        {ord.fulfilmentStatus}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/orders/${refNo}`}
                        className={`${adminStyles.actionBtnDots} ${adminStyles["text-11"]} ${adminStyles["px-8"]}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye size={12} /> View Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to {filtered.length} of {SEED_ORDERS.length} orders</span>
          <div className={adminStyles.paginationControls}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
