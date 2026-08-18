"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Save, Search, Trash2 } from "lucide-react";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface SelectedItem {
  id: string;
  name: string;
  sku: string;
  supplierCost: number;
  qty: number;
}

const SAMPLE_MASTER_ITEMS = [
  { id: "itm-1", name: "A4 Hardcover Book 192pg", sku: "BK-A4-192", supplierCost: 18.50 },
  { id: "itm-2", name: "Bic Medium Blue Pens (Pack of 10)", sku: "PN-BIC-BLU", supplierCost: 22.00 },
  { id: "itm-3", name: "Pritt Glue Stick 43g", sku: "GL-PRT-43", supplierCost: 32.00 },
  { id: "itm-4", name: "Staedtler Tradition HB Pencils (Box 12)", sku: "PC-ST-HB", supplierCost: 45.00 },
  { id: "itm-5", name: "Faber-Castell 24 Coloured Pencils", sku: "CP-FC-24", supplierCost: 55.00 },
  { id: "itm-6", name: "MonAmi Retractable Crayons 12s", sku: "CR-MA-12", supplierCost: 38.00 },
];

export default function PackBuilderPage() {
  const [packTitle, setPackTitle] = useState("Grade 1 – 2027 Stationery Pack");
  const [schoolName, setSchoolName] = useState("3d Christian Academy");
  const [sellingPrice, setSellingPrice] = useState<number>(370.00);
  const [itemQuery, setItemQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([
    { id: "itm-1", name: "A4 Hardcover Book 192pg", sku: "BK-A4-192", supplierCost: 18.50, qty: 4 },
    { id: "itm-3", name: "Pritt Glue Stick 43g", sku: "GL-PRT-43", supplierCost: 32.00, qty: 2 },
  ]);

  const searchResults = useMemo(() => {
    if (!itemQuery.trim()) return [];
    return SAMPLE_MASTER_ITEMS.filter(
      (itm) =>
        itm.name.toLowerCase().includes(itemQuery.toLowerCase()) ||
        itm.sku.toLowerCase().includes(itemQuery.toLowerCase())
    );
  }, [itemQuery]);

  const totalCost = useMemo(() => {
    return selectedItems.reduce((sum, itm) => sum + itm.supplierCost * itm.qty, 0);
  }, [selectedItems]);

  const grossProfit = sellingPrice - totalCost;
  const marginPct = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
  const healthScore = marginPct >= 35 ? 100 : marginPct >= 20 ? 75 : 45;

  const addItem = (masterItem: typeof SAMPLE_MASTER_ITEMS[0]) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === masterItem.id);
      if (exists) {
        return prev.map((i) => (i.id === masterItem.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id: masterItem.id,
          name: masterItem.name,
          sku: masterItem.sku,
          supplierCost: masterItem.supplierCost,
          qty: 1,
        },
      ];
    });
    setItemQuery("");
  };

  const updateQty = (id: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className={styles.container}>
      <div>
        <Link
          href="/admin/packs"
          className={styles.secondaryBtn}
          style={{ height: 32, fontSize: 11, background: "transparent", border: "none", color: "#94a3b8", paddingLeft: 0 }}
        >
          <ArrowLeft size={14} /> Back to packs
        </Link>
      </div>

      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>Interactive Pack Builder</h1>
          <p className={styles.headerSubtitle}>Assembly & Live Bill of Materials (BOM) Calculation</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.primaryBtn} type="button">
            <Save size={14} /> Save Pack
          </button>
        </div>
      </div>

      <div className={styles.detailLayout}>
        {/* Left Column: Form & Assembly */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Metadata Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <span>Pack Configurations</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                  Pack Title
                </label>
                <input
                  className={styles.searchInput}
                  value={packTitle}
                  onChange={(e) => setPackTitle(e.target.value)}
                  style={{ width: "100%", paddingLeft: 12 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                  Assigned School
                </label>
                <input
                  className={styles.searchInput}
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  style={{ width: "100%", paddingLeft: 12 }}
                />
              </div>
            </div>
          </div>

          {/* Typeahead Search */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <span>Typeahead Master Product Search</span>
            </div>
            <div className={styles.searchBox} style={{ width: "100%" }}>
              <Search />
              <input
                className={styles.searchInput}
                placeholder="Search master items by SKU or title..."
                value={itemQuery}
                onChange={(e) => setItemQuery(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div style={{ background: "#0f182b", border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
                {searchResults.map((itm) => (
                  <div
                    key={itm.id}
                    onClick={() => addItem(itm)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid #1e293b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#ffffff", fontSize: 13 }}>{itm.name}</strong>
                      <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>({itm.sku})</span>
                    </div>
                    <span style={{ color: "#2dd4bf", fontSize: 12, fontWeight: 700 }}>
                      + Add Item (Cost R {itm.supplierCost})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOM Table */}
          <div className={styles.tableCard}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e293b", fontWeight: 700, color: "#ffffff" }}>
              Bill of Materials ({selectedItems.length} Allocated Items)
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ITEM NAME</th>
                    <th>SKU</th>
                    <th>UNIT COST</th>
                    <th>QTY</th>
                    <th>EXTENDED COST</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((itm) => (
                    <tr key={itm.id}>
                      <td><strong style={{ color: "#ffffff" }}>{itm.name}</strong></td>
                      <td>{itm.sku}</td>
                      <td>R {itm.supplierCost.toFixed(2)}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            className={styles.actionBtnDots}
                            onClick={() => updateQty(itm.id, -1)}
                            type="button"
                          >
                            -
                          </button>
                          <span style={{ color: "#ffffff", fontWeight: 700, minWidth: 20, textAlign: "center" }}>
                            {itm.qty}
                          </span>
                          <button
                            className={styles.actionBtnDots}
                            onClick={() => updateQty(itm.id, 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td style={{ color: "#ffffff", fontWeight: 700 }}>
                        R {(itm.supplierCost * itm.qty).toFixed(2)}
                      </td>
                      <td>
                        <button
                          className={`${styles.actionIconBtn} ${styles.actionIconBtnRed}`}
                          onClick={() => removeItem(itm.id)}
                          type="button"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Profit & Pack Health Calculator */}
        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Calculator size={16} style={{ color: "#2dd4bf" }} />
                <span>Financial & Health Breakdown</span>
              </div>
            </div>

            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Total Supplier Cost:</span>
              <span className={styles.sidebarStatVal}>R {totalCost.toFixed(2)}</span>
            </div>

            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Selling Price (R):</span>
              <input
                className={styles.searchInput}
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                style={{ width: 100, height: 28, textAlign: "right" }}
              />
            </div>

            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Gross Margin (R):</span>
              <span className={styles.sidebarStatVal} style={{ color: grossProfit >= 0 ? "#34d399" : "#f87171" }}>
                R {grossProfit.toFixed(2)}
              </span>
            </div>

            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Margin Percentage:</span>
              <span className={styles.sidebarStatVal} style={{ color: marginPct >= 30 ? "#34d399" : "#fbbf24" }}>
                {marginPct.toFixed(1)}%
              </span>
            </div>

            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Pack Health Score:</span>
              <span className={healthScore >= 75 ? styles.badgeGreen : styles.badgeAmber}>
                {healthScore}% Healthy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
