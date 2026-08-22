"use client";

import { useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Box, Building2, ChevronDown, Eye, FileText, Layers, Save } from "lucide-react";
import GradePackItemSelector, {
  type PackLine,
} from "@/components/grade-packs/GradePackItemSelector";
import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import type { CSVStationeryRow } from "@/app/actions/stationery-import";
import { formatCurrency } from "@/lib/formatCurrency";
import type { PackFormState } from "@/lib/admin/packs";
import coreStyles from "@/components/admin/views/CorePagesView.module.css";
import itemStyles from "./ItemsManager.module.css";
import styles from "./SchoolPackCreateForm.module.css";

const PAGE_SIZE = 4;
const GRADES = ["Grade R", ...Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`)];

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={coreStyles.primaryBtn} disabled={pending}>
      <Save size={14} /> {pending ? "Creating..." : "Save pack"}
    </button>
  );
}

interface SchoolPackCreateFormProps {
  schoolId: string;
  schoolName: string;
  showImporter: boolean;
  action: (previous: PackFormState, formData: FormData) => Promise<PackFormState>;
}

export function SchoolPackCreateForm({
  schoolId,
  schoolName,
  showImporter,
  action,
}: SchoolPackCreateFormProps) {
  const [state, formAction] = useActionState<PackFormState, FormData>(action, { ok: false });
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
        (sum, line) => sum + (line.unit_price ?? line.price ?? 0) * line.quantity,
        0
      ),
    [lines]
  );

  const displayPrice = customPrice !== "" ? Number(customPrice) || 0 : subtotal;
  const formattedSubtotal = `R ${subtotal.toFixed(2)}`;
  const formattedPrice = `R ${displayPrice.toFixed(2)}`;
  const packTitle = `${schoolName} ${selectedGrade} Pack`;

  const selectorKey = lines
    .map((line) => `${line.id}:${line.quantity}:${line.unit_price ?? line.price ?? 0}`)
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
        const existingIndex = next.findIndex((line) => line.name.trim().toLowerCase() === key);
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
        if (existingIndex >= 0) next[existingIndex] = { ...next[existingIndex], ...staged, id: next[existingIndex].id };
        else next.push(staged);
      }
      setPage(Math.max(1, Math.ceil(next.length / PAGE_SIZE)));
      return next;
    });
  }

  function handleSubmit() {
    if (itemsInputRef.current) itemsInputRef.current.value = JSON.stringify(lines);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className={coreStyles.container}>
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="visible" value="on" />
      <input ref={itemsInputRef} type="hidden" name="items" defaultValue="[]" />

      {/* Header Title Row matching reference image */}
      <div className={coreStyles.headerRow}>
        <div className={coreStyles.headerTitleGroup}>
          <h1 className={coreStyles.headerTitle}>{packTitle}</h1>
          <p className={coreStyles.headerSubtitle} style={{ marginTop: 4 }}>
            {schoolName} / {lines.length} {lines.length === 1 ? "item" : "items"}
          </p>
        </div>
        <CreateButton />
      </div>

      {state?.message ? (
        <p className={state.ok ? coreStyles.badgeGreen : coreStyles.badgeRed} role="status" style={{ padding: "8px 12px", borderRadius: 8 }}>
          {state.message}
        </p>
      ) : null}

      {/* 5 Metric Stat Cards matching reference image */}
      <div className={coreStyles.metricsGrid5}>
        <div className={coreStyles.metricCard}>
          <div className={coreStyles.metricTop}>
            <span className={coreStyles.metricLabel}>Pack Price</span>
            <div className={`${coreStyles.metricIconWrapper} ${coreStyles.metricIconTeal}`}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>$</span>
            </div>
          </div>
          <div className={coreStyles.metricValue}>{formattedPrice}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Retail selling price</div>
        </div>

        <div className={coreStyles.metricCard}>
          <div className={coreStyles.metricTop}>
            <span className={coreStyles.metricLabel}>Item Subtotal</span>
            <div className={`${coreStyles.metricIconWrapper} ${coreStyles.metricIconTeal}`}>
              <Layers size={16} />
            </div>
          </div>
          <div className={coreStyles.metricValue}>{formattedSubtotal}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Sum of line items</div>
        </div>

        <div className={coreStyles.metricCard}>
          <div className={coreStyles.metricTop}>
            <span className={coreStyles.metricLabel}>Items</span>
            <div className={`${coreStyles.metricIconWrapper} ${coreStyles.metricIconBlue}`}>
              <FileText size={16} />
            </div>
          </div>
          <div className={coreStyles.metricValue}>{lines.length}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Line items in pack</div>
        </div>

        <div className={coreStyles.metricCard}>
          <div className={coreStyles.metricTop}>
            <span className={coreStyles.metricLabel}>School</span>
            <div className={`${coreStyles.metricIconWrapper} ${coreStyles.metricIconTeal}`}>
              <Building2 size={16} />
            </div>
          </div>
          <div className={coreStyles.metricValue} style={{ fontSize: 16 }}>{schoolName}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Gauteng</div>
        </div>

        <div className={coreStyles.metricCard}>
          <div className={coreStyles.metricTop}>
            <span className={coreStyles.metricLabel}>Visibility</span>
            <div className={`${coreStyles.metricIconWrapper} ${coreStyles.metricIconTeal}`}>
              <Eye size={16} />
            </div>
          </div>
          <div className={coreStyles.metricValue} style={{ fontSize: 18 }}>Visible</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Public listing</div>
        </div>
      </div>

      {/* 2-Column Section: Set Pack Price + Pack Summary */}
      <div className={coreStyles.detailLayout}>
        {/* Left Column: Set Pack Price & Grade Selection */}
        <div className={coreStyles.sidebarCard}>
          <div className={coreStyles.sidebarCardHeader}>
            <div className={coreStyles.sidebarHeaderTitle}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>Set Pack Price & Grade</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                Select Grade *
              </label>
              <select
                name="grade"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                style={{
                  width: "100%",
                  background: "#020617",
                  border: "1px solid #1e293b",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#ffffff",
                  fontSize: 14,
                }}
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                {lines.length} items – subtotal {formattedSubtotal}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>R</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  placeholder={subtotal > 0 ? String(subtotal) : "0"}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#020617",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pack Summary */}
        <div className={coreStyles.sidebarCard}>
          <div className={coreStyles.sidebarCardHeader}>
            <div className={coreStyles.sidebarHeaderTitle}>
              <Box size={16} style={{ color: "#2dd4bf" }} />
              <span>Pack Summary</span>
            </div>
            <span className={coreStyles.badgeGreen} style={{ fontSize: 10 }}>Live</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className={coreStyles.sidebarStatRow}>
              <span className={coreStyles.sidebarStatLabel}>Title</span>
              <span className={coreStyles.sidebarStatVal}>{packTitle}</span>
            </div>
            <div className={coreStyles.sidebarStatRow}>
              <span className={coreStyles.sidebarStatLabel}>Price</span>
              <span className={coreStyles.sidebarStatVal}>{formattedPrice}</span>
            </div>
            <div className={coreStyles.sidebarStatRow}>
              <span className={coreStyles.sidebarStatLabel}>Subtotal</span>
              <span className={coreStyles.sidebarStatVal}>{formattedSubtotal}</span>
            </div>
            <div className={coreStyles.sidebarStatRow}>
              <span className={coreStyles.sidebarStatLabel}>Items</span>
              <span className={coreStyles.sidebarStatVal}>{lines.length}</span>
            </div>
            <div className={coreStyles.sidebarStatRow}>
              <span className={coreStyles.sidebarStatLabel}>School</span>
              <span className={coreStyles.sidebarStatVal}>{schoolName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Total Chip */}
      <section className={itemStyles.searchTotalRow} aria-label="Pack details and item search">
        <div className={itemStyles.searchSlot}>
          <GradePackItemSelector
            key={selectorKey}
            initialItems={lines}
            showSave={false}
            hideList
            searchLabel=""
            searchPlaceholder="Search items by item name"
            onItemsChange={updateLines}
          />
        </div>
        <div className={itemStyles.totalChip} aria-label={`Pack total ${formattedSubtotal}`}>
          Total R {subtotal.toFixed(0)}
        </div>
      </section>

      {/* Data Table with Red Delete Buttons */}
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
                    <td className={itemStyles.priceCell}>{formatCurrency(unitPrice)}</td>
                    <td>
                      <div className={itemStyles.actions}>
                        <button
                          type="button"
                          className={itemStyles.deleteButton}
                          onClick={() => removeLine(line.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#f87171",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                            padding: 0,
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className={itemStyles.emptyRow} colSpan={6}>
                  Search and add stationery items to build this pack.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={itemStyles.pager}>
        <span>
          Page {currentPage} of {pageCount} · {lines.length}{" "}
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
        <section className={itemStyles.csvBanner} aria-label="Bulk CSV stationery import">
          <CSVStationeryImporter onStageItems={stageCsvItems} />
        </section>
      ) : null}
    </form>
  );
}
