"use client";

import { useMemo, useState } from "react";
import { Calculator, Save, Search, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";

interface SelectedItem {
  id: string;
  name: string;
  sku: string;
  supplierCost: number;
  qty: number;
}

export default function PackBuilderPage() {
  const [packTitle, setPackTitle] = useState("New stationery pack");
  const [schoolName, setSchoolName] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [itemQuery, setItemQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const searchResults = useMemo(() => {
    if (!itemQuery.trim()) return [];
    return ([] as SelectedItem[]).filter(
      (itm) =>
        itm.name.toLowerCase().includes(itemQuery.toLowerCase()) ||
        itm.sku.toLowerCase().includes(itemQuery.toLowerCase()),
    );
  }, [itemQuery]);

  const totalCost = useMemo(() => {
    return selectedItems.reduce(
      (sum, itm) => sum + itm.supplierCost * itm.qty,
      0,
    );
  }, [selectedItems]);

  const grossProfit = sellingPrice - totalCost;
  const marginPct = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
  const healthScore = marginPct >= 35 ? 100 : marginPct >= 20 ? 75 : 45;

  const addItem = (masterItem: SelectedItem) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === masterItem.id);
      if (exists) {
        return prev.map((i) =>
          i.id === masterItem.id ? { ...i, qty: i.qty + 1 } : i,
        );
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
        .map((i) =>
          i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  };

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/packs"
        backLabel="Back to Packs"
        title="Interactive Pack Builder"
        titleHighlight="Assembly & BOM"
        subtitle="Assemble a stationery pack with a live Bill of Materials (BOM) and margin calculation."
        actions={
          <AdminButton
            variant="primary"
            icon={<Save size={14} />}
            type="button"
          >
            Save Pack
          </AdminButton>
        }
      />

      <div className={adminStyles.detailLayout}>
        {/* Left Column: Form & Assembly */}
        <div
          className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles.gap18}`}
        >
          {/* Metadata Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <span>Pack Configurations</span>
            </div>
            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel}>Pack Title</label>
                <input
                  className={adminStyles.inputField}
                  value={packTitle}
                  onChange={(e) => setPackTitle(e.target.value)}
                  placeholder="e.g. Grade 4 Starter Pack"
                />
              </div>
              <div>
                <label className={adminStyles.formLabel}>Assigned School</label>
                <input
                  className={adminStyles.inputField}
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Example Primary School"
                />
              </div>
            </div>
          </div>

          {/* Typeahead Search */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <span>Typeahead Master Product Search</span>
            </div>
            <div className={`${styles.searchBox} ${adminStyles.wFull}`}>
              <Search />
              <input
                className={adminStyles.searchInput}
                placeholder="Search master items by SKU or title..."
                value={itemQuery}
                onChange={(e) => setItemQuery(e.target.value)}
              />
            </div>
            {searchResults.length > 0 && (
              <div className={adminStyles.searchDropdown}>
                {searchResults.map((itm) => (
                  <div
                    key={itm.id}
                    onClick={() => addItem(itm)}
                    className={adminStyles.searchDropdownItem}
                  >
                    <div>
                      <strong
                        className={`${adminStyles.cWhite} ${adminStyles.text13}`}
                      >
                        {itm.name}
                      </strong>
                      <span
                        className={`${styles.text11} ${adminStyles.cSubtle} ${adminStyles.ml8}`}
                      >
                        ({itm.sku})
                      </span>
                    </div>
                    <span
                      className={`${adminStyles.cTeal} ${adminStyles.text12} ${adminStyles.fw700}`}
                    >
                      + Add Item (Cost R {itm.supplierCost})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BOM Table */}
          <div className={adminStyles.tableCard}>
            <div
              className={`${adminStyles.pCard} ${adminStyles.borderB} ${adminStyles.fw700} ${adminStyles.cWhite}`}
            >
              Bill of Materials ({selectedItems.length} Allocated Items)
            </div>
            <div className={adminStyles.tableWrapper}>
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
                      <td>
                        <strong className={adminStyles.cWhite}>
                          {itm.name}
                        </strong>
                      </td>
                      <td>{itm.sku}</td>
                      <td>R {itm.supplierCost.toFixed(2)}</td>
                      <td>
                        <div
                          className={`${adminStyles.flex} ${adminStyles.itemsCenter} ${adminStyles.gap6}`}
                        >
                          <button
                            className={adminStyles.actionBtnDots}
                            onClick={() => updateQty(itm.id, -1)}
                            type="button"
                          >
                            -
                          </button>
                          <span
                            className={`${adminStyles.cWhite} ${adminStyles.fw700} ${styles.minW20} ${adminStyles.textCenter}`}
                          >
                            {itm.qty}
                          </span>
                          <button
                            className={adminStyles.actionBtnDots}
                            onClick={() => updateQty(itm.id, 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td
                        className={`${adminStyles.cWhite} ${adminStyles.fw700}`}
                      >
                        R {(itm.supplierCost * itm.qty).toFixed(2)}
                      </td>
                      <td>
                        <button
                          className={`${adminStyles.actionIconBtn} ${adminStyles.actionIconBtnRed}`}
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
        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Calculator size={16} className={adminStyles.iconTeal} />
                <span>Financial &amp; Health Breakdown</span>
              </div>
            </div>

            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>
                Total Supplier Cost:
              </span>
              <span className={adminStyles.sidebarStatVal}>
                R {totalCost.toFixed(2)}
              </span>
            </div>

            <div className={`${adminStyles.formField}`}>
              <div>
                <label className={adminStyles.formLabel}>
                  Selling Price (R)
                </label>
                <input
                  className={adminStyles.inputField}
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>
                Gross Margin (R):
              </span>
              <span
                className={`${adminStyles.sidebarStatVal} ${grossProfit >= 0 ? adminStyles.cGreen : adminStyles.cRed}`}
              >
                R {grossProfit.toFixed(2)}
              </span>
            </div>

            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>
                Margin Percentage:
              </span>
              <span
                className={`${adminStyles.sidebarStatVal} ${marginPct >= 30 ? adminStyles.cGreen : adminStyles.cAmber}`}
              >
                {marginPct.toFixed(1)}%
              </span>
            </div>

            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>
                Pack Health Score:
              </span>
              <StatusBadge
                status="healthy"
                tone={healthScore >= 75 ? "emerald" : "amber"}
                label={`${healthScore}% Healthy`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
