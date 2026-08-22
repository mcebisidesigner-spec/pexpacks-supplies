"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Boxes,
  Check,
  Filter,
  Grid,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

interface ProductRow {
  sku: string;
  name: string;
  category: string;
  unit: string;
  sellPrice: number;
  costPrice: number;
  margin: number;
  supplier: string;
  status: "Active" | "Draft";
}

const SEED_PRODUCTS: ProductRow[] = [
  { sku: "PRO-1021", name: "A4 Counter Book (Quad 192p)", category: "Stationery", unit: "Each", sellPrice: 14.50, costPrice: 8.20, margin: 43, supplier: "Waltons", status: "Active" },
  { sku: "PRO-1022", name: "HB Pencils (Box 12)", category: "Stationery", unit: "Box", sellPrice: 18.20, costPrice: 9.30, margin: 49, supplier: "Waltons", status: "Active" },
  { sku: "PRO-1023", name: "Pritt Glue Stick 43g", category: "Stationery", unit: "Each", sellPrice: 34.00, costPrice: 19.50, margin: 43, supplier: "Bidvest", status: "Active" },
  { sku: "PRO-1024", name: "Flip File (40 Pocket)", category: "Stationery", unit: "Each", sellPrice: 18.90, costPrice: 10.20, margin: 46, supplier: "Waltons", status: "Active" },
  { sku: "PRO-1025", name: "A4 Display Book (20p)", category: "Stationery", unit: "Each", sellPrice: 24.00, costPrice: 12.50, margin: 48, supplier: "Croxley", status: "Active" },
  { sku: "PRO-1026", name: "Eraser (Large Sleeve)", category: "Stationery", unit: "Each", sellPrice: 8.50, costPrice: 3.20, margin: 62, supplier: "Waltons", status: "Active" },
  { sku: "PRO-1027", name: "Colour Pencils (Box 24)", category: "Stationery", unit: "Box", sellPrice: 36.00, costPrice: 19.20, margin: 47, supplier: "Waltons", status: "Active" },
  { sku: "PRO-1028", name: "Ruler 30cm Shatterproof", category: "Stationery", unit: "Each", sellPrice: 6.20, costPrice: 2.80, margin: 55, supplier: "Bidvest", status: "Active" },
];

export function MasterProductsPageView() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SEED_PRODUCTS.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [search, categoryFilter]);

  return (
    <div className={styles.container}>
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Master Products{" "}
            <span className={adminStyles.headerCount}>({filtered.length})</span>
          </h1>
          <p className={styles.headerSubtitle}>Manage the master catalogue used across all school packs.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/products/add-item" className={styles.primaryBtn}>
            <Plus size={14} /> New Item
          </Link>
        </div>
      </div>

      <div className={adminStyles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchBox}>
            <Search />
            <input
              className={adminStyles.searchInput}
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={styles.selectInput} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Category: All</option>
            <option value="Stationery">Stationery</option>
          </select>
          <select className={styles.selectInput} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Status: Active</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className={styles.toolbarRight}>
          <div className={adminStyles.viewToggleGroup}>
            <button className={`${adminStyles.viewBtn} ${viewMode === "list" ? adminStyles.viewBtnActive : ""}`} onClick={() => setViewMode("list")}>
              <List size={14} />
            </button>
            <button className={`${adminStyles.viewBtn} ${viewMode === "grid" ? adminStyles.viewBtnActive : ""}`} onClick={() => setViewMode("grid")}>
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Sell Price</th>
                <th>Cost Price</th>
                <th>Margin</th>
                <th>Supplier</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prod) => {
                const prodSlug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                return (
                  <tr
                    key={prod.sku}
                    className={styles.dataRow}
                    onClick={() => router.push(`/admin/products/${prodSlug}`)}
                  >
                    <td><span className={adminStyles.badgeTeal}>{prod.sku}</span></td>
                    <td>
                      <Link
                        href={`/admin/products/${prodSlug}`}
                        className={`${adminStyles.cWhite} ${adminStyles.fw700}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prod.name}
                      </Link>
                    </td>
                    <td>{prod.category}</td>
                    <td>{prod.unit}</td>
                    <td><strong>R {prod.sellPrice.toFixed(2)}</strong></td>
                    <td className={adminStyles.cSubtle}>R {prod.costPrice.toFixed(2)}</td>
                    <td><span className={`${adminStyles.cGreen} ${adminStyles.fw700}`}>{prod.margin}%</span></td>
                    <td>{prod.supplier}</td>
                    <td><span className={adminStyles.badgeGreen}>{prod.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.paginationFooter}>
          <span>Showing 1 to 8 of 1,248 products</span>
          <div className={adminStyles.paginationControls}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <button className={styles.pageBtn}>4</button>
            <button className={styles.pageBtn}>5</button>
            <span style={{ padding: "0 4px" }}>...</span>
            <button className={styles.pageBtn}>156</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
          <div className={`${adminStyles.flex} ${adminStyles.itemsCenter} ${adminStyles["gap-6"]}`}>
            <span>Show</span>
            <select className={`${styles.selectInput} ${adminStyles["h-26"]} ${adminStyles["text-11"]}`}>
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
