"use client";

import { useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Box,
  Building2,
  Eye,
  FileText,
  Layers,
  Save,
  Trash2,
} from "lucide-react";
import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import GradePackItemSelector, {
  type PackLine,
} from "@/components/grade-packs/GradePackItemSelector";
import type { CSVStationeryRow } from "@/app/actions/stationery-import";
import type { PackFormState } from "@/lib/admin/packs";
import { formatCurrency } from "@/lib/formatCurrency";
import coreStyles from "@/components/admin/views/CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";
import itemStyles from "./ItemsManager.module.css";
import styles from "./SchoolPackCreateForm.module.css";

const PAGE_SIZE = 4;
const GRADES = [
  "Grade R",
  ...Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`),
];

function CreateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={`${coreStyles.primaryBtn} ${coreStyles.headerSaveBtn}`}
      disabled={pending}
    >
      <Save size={14} /> {pending ? "Creating..." : "Save pack"}
    </button>
  );
}

interface SchoolPackCreateFormProps {
  schoolId: string;
  schoolName: string;
  showImporter: boolean;
  action: (
    previous: PackFormState,
    formData: FormData,
  ) => Promise<PackFormState>;
}

export function SchoolPackCreateForm({
  schoolId,
  schoolName,
  showImporter,
  action,
}: SchoolPackCreateFormProps) {
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });
  const [lines, setLines] = useState<PackLine[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("Grade R");
  const [customPrice, setCustomPrice] = useState<string>("");
  const [page, setPage] = useState(1);
  const itemsInputRef = useRef<HTMLInputElement>(null);

  const pageCount = Math.max(1, Math.ceil(lines.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleLines = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return lines.slice(start, start + PAGE_SIZE);
  }, [currentPage, lines]);

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) =>
          sum + (line.unit_price ?? line.price ?? 0) * line.quantity,
        0,
      ),
    [lines],
  );

  const displayPrice = customPrice !== "" ? Number(customPrice) || 0 : subtotal;
  const formattedSubtotal = `R ${subtotal.toFixed(2)}`;
  const formattedPrice = `R ${displayPrice.toFixed(2)}`;
  const packTitle = `${schoolName} ${selectedGrade} Pack`;

  const selectorKey = lines
    .map(
      (line) =>
        `${line.id}:${line.quantity}:${line.unit_price ?? line.price ?? 0}`,
    )
    .join("|");

  function updateLines(nextLines: PackLine[]) {
    setLines(nextLines);
    setPage(Math.max(1, Math.ceil(nextLines.length / PAGE_SIZE)));
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  function stageCsvItems(items: CSVStationeryRow[]) {
    setLines((current) => {
      const next = [...current];
      for (const item of items) {
        const key = item.title.trim().toLowerCase();
        const existingIndex = next.findIndex(
          (line) => line.name.trim().toLowerCase() === key,
        );
        const staged: PackLine = {
          id: `csv-${key}-${next.length}`,
          name: item.title.trim(),
          title: item.title.trim(),
          description: item.description?.trim() || null,
          unit_price: Math.max(0, Number(item.unit_price) || 0),
          price: Math.max(0, Number(item.unit_price) || 0),
          category: item.category?.trim() || "-",
          sku: item.sku?.trim(),
          quantity: 1,
        };
        if (existingIndex >= 0) {
          next[existingIndex] = {
            ...next[existingIndex],
            ...staged,
            id: next[existingIndex].id,
          };
        } else {
          next.push(staged);
        }
      }
      setPage(Math.max(1, Math.ceil(next.length / PAGE_SIZE)));
      return next;
    });
  }

  function handleSubmit() {
    if (itemsInputRef.current) {
      itemsInputRef.current.value = JSON.stringify(lines);
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className={`${coreStyles.container} ${styles.form}`}
    >
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="visible" value="on" />
      <input ref={itemsInputRef} type="hidden" name="items" defaultValue="[]" />

      <div className={adminStyles.headerRow}>
        <div />
        <CreateButton />
      </div>

      {state?.message ? (
        <p
          className={`${styles.statusMessage} ${
            state.ok ? styles.statusSuccess : styles.statusError
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      {/* 5 Summary Metric Stat Cards matching reference image */}
      <div
        className={`${adminStyles.metricsGrid5} ${coreStyles.packMetricsGrid}`}
      >
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Pack Price</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}
            >
              <span className={adminStyles.currencyText}>R</span>
            </div>
          </div>
          <div className={adminStyles.metricValue}>{formattedPrice}</div>
          <div className={coreStyles.metricSubtext}>Retail selling price</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Item Subtotal</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}
            >
              <Layers size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{formattedSubtotal}</div>
          <div className={coreStyles.metricSubtext}>Sum of line items</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Items</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}
            >
              <FileText size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{lines.length}</div>
          <div className={coreStyles.metricSubtext}>Line items in pack</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>School</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}
            >
              <Building2 size={16} />
            </div>
          </div>
          <div
            className={`${adminStyles.metricValue} ${adminStyles.metricValueSmall}`}
          >
            {schoolName}
          </div>
          <div className={coreStyles.metricSubtext}>Gauteng</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Visibility</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}
            >
              <Eye size={16} />
            </div>
          </div>
          <div
            className={`${adminStyles.metricValue} ${adminStyles.metricValueSmall}`}
          >
            Visible
          </div>
          <div className={coreStyles.metricSubtext}>Public listing</div>
        </div>
      </div>

      {/* Middle Section (2-Column Grid: Set Pack Grade & Items + Pack Summary) */}
      <div className={adminStyles.detailLayout}>
        <div className={styles.leftStack}>
          <section className={`${adminStyles.tableCard} ${styles.priceCard}`}>
            <div className={styles.priceHeader}>
              <div>
                <h2 className={styles.cardTitle}>Set Pack Grade & Items</h2>
              </div>
            </div>

            <div className={styles.priceControls}>
              <label className={styles.fieldGroup}>
                <span className={styles.fieldLabel}>Select Grade *</span>
                <select
                  name="grade"
                  value={selectedGrade}
                  onChange={(event) => setSelectedGrade(event.target.value)}
                  className={styles.fieldSelect}
                >
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>

              <div className={`${styles.fieldGroup} ${styles.itemSearchGroup}`}>
                <span className={styles.fieldLabel}>Add Stationery Items</span>
                <GradePackItemSelector
                  key={selectorKey}
                  initialItems={lines}
                  showSave={false}
                  hideList
                  searchLabel=""
                  searchPlaceholder="Search items by item name/SKU"
                  onItemsChange={updateLines}
                />
              </div>
            </div>
          </section>
        </div>

        <aside className={adminStyles.sidebarColumn}>
          <section className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Box size={16} className={adminStyles.iconTeal} />
                <span>Pack Summary</span>
              </div>
              <span
                className={`${adminStyles.badgeGreen} ${adminStyles.badgeTiny}`}
              >
                Draft
              </span>
            </div>

            <div className={adminStyles.summaryStack}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Title</span>
                <span className={adminStyles.sidebarStatVal}>{packTitle}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Price</span>
                <span className={adminStyles.sidebarStatVal}>
                  {formattedPrice}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Items</span>
                <span className={adminStyles.sidebarStatVal}>
                  {lines.length}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>School</span>
                <span className={adminStyles.sidebarStatVal}>{schoolName}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <div className={itemStyles.tableWrap}>
        <table className={itemStyles.table}>
          <thead>
            <tr>
              <th>ITEM CODE</th>
              <th>ITEM NAME</th>
              <th>DESCRIPTION</th>
              <th>QTY</th>
              <th>PRICE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visibleLines.length ? (
              visibleLines.map((line) => {
                const unitPrice = line.unit_price ?? line.price ?? 0;
                const itemName = line.title || line.name;
                return (
                  <tr key={line.id}>
                    <td>{line.sku || line.category || "Single"}</td>
                    <td>
                      <span className={itemStyles.itemName}>{itemName}</span>
                    </td>
                    <td>{line.description || "-"}</td>
                    <td>{line.quantity}</td>
                    <td className={itemStyles.priceCell}>
                      {formatCurrency(unitPrice)}
                    </td>
                    <td>
                      <div className={itemStyles.actions}>
                        <button
                          type="button"
                          className={itemStyles.iconBtnRed}
                          onClick={() => removeLine(line.id)}
                          title="Delete Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className={styles.emptyRow} colSpan={6}>
                  Search and add stationery items to build this pack.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={itemStyles.pager}>
        <span>
          Page {currentPage} of {pageCount} - {lines.length}{" "}
          {lines.length === 1 ? "item" : "items"}
        </span>
        <div className={itemStyles.pagerButtons}>
          <button
            type="button"
            className={itemStyles.pageButton}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage <= 1}
          >
            Prev
          </button>
          <button
            type="button"
            className={itemStyles.pageButton}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            disabled={currentPage >= pageCount}
          >
            Next
          </button>
        </div>
      </div>

      {showImporter ? (
        <section
          className={itemStyles.csvBannerTiles}
          aria-label="Bulk CSV stationery import"
        >
          <CSVStationeryImporter onStageItems={stageCsvItems} variant="tiles" />
        </section>
      ) : null}
    </form>
  );
}
