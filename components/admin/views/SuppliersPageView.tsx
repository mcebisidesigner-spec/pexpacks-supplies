"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Truck,
  Users,
} from "lucide-react";
import styles from "./CorePagesView.module.css";

interface SupplierRow {
  id: string;
  name: string;
  category: string;
  leadTime: string;
  onTimeRate: number;
  quoteResponse: string;
  status: "Preferred" | "Approved" | "Prospect";
}

const SEED_SUPPLIERS: SupplierRow[] = [
  { id: "sup-1", name: "Waltons", category: "Stationery", leadTime: "2-3 days", onTimeRate: 98, quoteResponse: "2.1 hrs", status: "Preferred" },
  { id: "sup-2", name: "Bidvest Waltons", category: "Stationery", leadTime: "3-4 days", onTimeRate: 97, quoteResponse: "3.5 hrs", status: "Preferred" },
  { id: "sup-3", name: "Makro", category: "General", leadTime: "5-6 days", onTimeRate: 91, quoteResponse: "4.2 hrs", status: "Approved" },
  { id: "sup-4", name: "Croxley", category: "Stationery", leadTime: "2-3 days", onTimeRate: 96, quoteResponse: "1.8 hrs", status: "Approved" },
  { id: "sup-5", name: "Freedom Stationery", category: "Paper", leadTime: "7-10 days", onTimeRate: 90, quoteResponse: "7.1 hrs", status: "Approved" },
  { id: "sup-6", name: "Tabulated Business Technology", category: "General", leadTime: "1-2 days", onTimeRate: 99, quoteResponse: "0.8 hrs", status: "Preferred" },
  { id: "sup-7", name: "Printulu", category: "Print", leadTime: "3-5 days", onTimeRate: 94, quoteResponse: "5.4 hrs", status: "Approved" },
  { id: "sup-8", name: "Rotatrim", category: "Paper", leadTime: "4-6 days", onTimeRate: 89, quoteResponse: "6.8 hrs", status: "Prospect" },
];

export function SuppliersPageView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return SEED_SUPPLIERS.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Suppliers</h1>
          <p className={styles.headerSubtitle}>Manage your supplier network and performance.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/suppliers/new-supplier" className={styles.primaryBtn}>
            <Plus size={14} /> + New Supplier
          </Link>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              className={styles.searchInput}
              placeholder="Search by supplier name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={styles.selectInput} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: All</option>
            <option value="Preferred">Preferred</option>
            <option value="Approved">Approved</option>
            <option value="Prospect">Prospect</option>
          </select>
          <select className={styles.selectInput}>
            <option>Partner: All</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Category</th>
                <th>Lead Time</th>
                <th>On-Time %</th>
                <th>Quote Response</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sup) => {
                const supSlug = sup.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                return (
                  <tr
                    key={sup.id}
                    className={styles.dataRow}
                    onClick={() => router.push(`/admin/suppliers/${supSlug}`)}
                  >
                    <td>
                      <div className={`${styles.flex} ${styles["items-center"]} ${styles["gap-10"]}`}>
                        <div className={styles.supplierAvatar}>
                          <Truck size={14} />
                        </div>
                        <Link
                          href={`/admin/suppliers/${supSlug}`}
                          className={`${styles["c-white"]} ${styles["fw-700"]}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {sup.name}
                        </Link>
                      </div>
                    </td>
                    <td>{sup.category}</td>
                    <td>{sup.leadTime}</td>
                    <td><span className={`${sup.onTimeRate >= 95 ? styles["c-green"] : styles["c-amber"]} ${styles["fw-700"]}`}>{sup.onTimeRate}%</span></td>
                    <td>{sup.quoteResponse}</td>
                    <td>
                      <span className={sup.status === "Preferred" ? styles.badgeTeal : sup.status === "Approved" ? styles.badgeGreen : styles.badgeAmber}>
                        {sup.status}
                      </span>
                    </td>
                    <td><button className={styles.actionBtnDots}><MoreHorizontal size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to 8 of 64 suppliers</span>
          <div className={styles.paginationControls}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>4</button>
            <button className={styles.pageBtn}>5</button>
            <span className={styles["px-4"]}>...</span>
            <button className={styles.pageBtn}>8</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
          <div className={`${styles.flex} ${styles["items-center"]} ${styles["gap-6"]}`}>
            <span>Show</span>
            <select className={`${styles.selectInput} ${styles["h-26"]} ${styles["text-11"]} ${styles["px-4"]}`}>
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
