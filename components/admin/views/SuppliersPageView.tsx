"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

interface SupplierRow {
  id: string;
  name: string;
  category: string;
  leadTime: string;
  onTimeRate: number;
  status: "Preferred" | "Approved" | "Prospect";
}

const DEFAULT_SUPPLIERS: SupplierRow[] = [
  {
    id: "sup-makro",
    name: "Makro",
    category: "General & Office Supplies",
    leadTime: "1-2 days",
    onTimeRate: 99,
    status: "Preferred",
  },
  {
    id: "sup-bsc",
    name: "BSC Stationers",
    category: "Stationery & Paper",
    leadTime: "2-3 days",
    onTimeRate: 98,
    status: "Preferred",
  },
];

export function SuppliersPageView() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<SupplierRow[]>(DEFAULT_SUPPLIERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [suppliers, search, statusFilter]);

  const handleDelete = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className={styles.container}>
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Suppliers{" "}
            <span className={adminStyles.headerCount}>({suppliers.length})</span>
          </h1>
          <p className={styles.headerSubtitle}>
            Manage your supplier network and performance.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/suppliers/new-supplier" className={styles.primaryBtn}>
            <Plus size={14} /> New Supplier
          </Link>
        </div>
      </div>

      <div className={adminStyles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              className={adminStyles.searchInput}
              placeholder="Search by supplier name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.selectInput}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Status: All</option>
            <option value="Preferred">Preferred</option>
            <option value="Approved">Approved</option>
            <option value="Prospect">Prospect</option>
          </select>
        </div>
      </div>

      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Category</th>
                <th>Lead Time</th>
                <th>On-Time %</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className={adminStyles.emptyCell}>
                    No suppliers found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sup) => {
                  const supSlug = sup.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");
                  return (
                    <tr
                      key={sup.id}
                      className={styles.dataRow}
                      onClick={() => router.push(`/admin/suppliers/${supSlug}`)}
                    >
                      <td>
                        <div
                          className={`${adminStyles.flex} ${adminStyles["items-center"]} ${adminStyles["gap-10"]}`}
                        >
                          <div className={adminStyles.supplierAvatar}>
                            <Truck size={14} />
                          </div>
                          <Link
                            href={`/admin/suppliers/${supSlug}`}
                            className={`${adminStyles["c-white"]} ${adminStyles["fw-700"]}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {sup.name}
                          </Link>
                        </div>
                      </td>
                      <td>{sup.category}</td>
                      <td>{sup.leadTime}</td>
                      <td>
                        <span
                          className={`${
                            sup.onTimeRate >= 95
                              ? adminStyles["c-green"]
                              : adminStyles["c-amber"]
                          } ${adminStyles["fw-700"]}`}
                        >
                          {sup.onTimeRate}%
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            sup.status === "Preferred"
                              ? adminStyles.badgeTeal
                              : sup.status === "Approved"
                              ? adminStyles.badgeGreen
                              : adminStyles.badgeAmber
                          }
                        >
                          {sup.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={adminStyles.iconBtnRed}
                          title="Delete Supplier"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(sup.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to {filtered.length} of {suppliers.length} suppliers</span>
        </div>
      </div>
    </div>
  );
}
