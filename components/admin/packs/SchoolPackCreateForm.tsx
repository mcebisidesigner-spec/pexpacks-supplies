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
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { DbNotice } from "@/components/admin/ui/DbNotice";
import adminStyles from "@/app/admin/adminStyles";

const PAGE_SIZE = 4;
const GRADES = [
  "Grade R",
  ...Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`),
];

function CreateButton() {
  const { pending } = useFormStatus();

  return (
    <AdminButton
      type="submit"
      variant="primary"
      size="md"
      loading={pending}
      icon={<Save size={14} />}
    >
      Save pack
    </AdminButton>
  );
}

interface SchoolPackCreateFormProps {
  schoolId: string;
  schoolName: string;
  showImporter: boolean;
  initialGrade?: string;
  action: (
    previous: PackFormState,
    formData: FormData,
  ) => Promise<PackFormState>;
}

export function SchoolPackCreateForm({
  schoolId,
  schoolName,
  showImporter,
  initialGrade = "Grade R",
  action,
}: SchoolPackCreateFormProps) {
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });
  const [lines, setLines] = useState<PackLine[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [customPrice] = useState<string>("");
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
      className={adminStyles.formStack}
    >
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="visible" value="on" />
      <input ref={itemsInputRef} type="hidden" name="items" defaultValue="[]" />

      <div className={adminStyles.headerRow}>
        <div />
        <CreateButton />
      </div>

      {state?.message ? (
        <DbNotice
          type={state.ok ? "success" : "error"}
          message={state.message}
        />
      ) : null}

      {/* 5 Summary Metric Stat Cards matching reference image */}
      <div className={adminStyles.metricsGrid5}>
        <MetricCard
          label="Pack Price"
          value={formattedPrice}
          subtext="Retail selling price"
          icon={<span className={adminStyles.currencyText}>R</span>}
          iconTone="green"
        />

        <MetricCard
          label="Item Subtotal"
          value={formattedSubtotal}
          subtext="Sum of line items"
          icon={<Layers size={16} />}
          iconTone="green"
        />

        <MetricCard
          label="Items"
          value={lines.length}
          subtext="Line items in pack"
          icon={<FileText size={16} />}
          iconTone="blue"
        />

        <MetricCard
          label="School"
          value={schoolName}
          subtext="Gauteng"
          icon={<Building2 size={16} />}
          iconTone="green"
        />

        <MetricCard
          label="Visibility"
          value="Visible"
          subtext="Public listing"
          icon={<Eye size={16} />}
          iconTone="green"
        />
      </div>

      {/* Middle Section (2-Column Grid: Set Pack Grade & Items + Pack Summary) */}
      <div className={adminStyles.detailLayout}>
        <div className={adminStyles.leftColumn}>
          <section className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Layers size={16} className={adminStyles.iconTeal} />
                <span>Set Pack Grade &amp; Items</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="grade">
                  Select Grade <span className={adminStyles.muted}>*</span>
                </label>
                <select
                  id="grade"
                  name="grade"
                  value={selectedGrade}
                  onChange={(event) => setSelectedGrade(event.target.value)}
                  className={adminStyles.selectField}
                >
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <span className={adminStyles.formLabel}>
                  Add Stationery Items
                </span>
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

      <div className="overflow-x-auto w-full border border-slate-800 rounded-lg bg-[#070d18] mt-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">ITEM CODE</th>
              <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">ITEM NAME</th>
              <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">DESCRIPTION</th>
              <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">QTY</th>
              <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">PRICE</th>
              <th className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {visibleLines.length ? (
              visibleLines.map((line) => {
                const unitPrice = line.unit_price ?? line.price ?? 0;
                const itemName = line.title || line.name;
                return (
                  <tr key={line.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                    <td className="px-3.5 py-2.5 text-slate-300 align-middle">{line.sku || line.category || "Single"}</td>
                    <td className="px-3.5 py-2.5 text-slate-300 align-middle">
                      <span className="font-semibold text-slate-100">{itemName}</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-300 align-middle">{line.description || "-"}</td>
                    <td className="px-3.5 py-2.5 text-slate-300 align-middle">{line.quantity}</td>
                    <td className="px-3.5 py-2.5 font-semibold text-slate-200 whitespace-nowrap align-middle">
                      {formatCurrency(unitPrice)}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-300 align-middle">
                      <div className="flex items-center gap-1">
                        <AdminButton
                          type="button"
                          variant="danger"
                          size="sm"
                          icon={<Trash2 size={14} />}
                          onClick={() => removeLine(line.id)}
                          title="Delete Item"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className={adminStyles.emptyCell} colSpan={6}>
                  Search and add stationery items to build this pack.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs text-slate-400 mt-2">
        <span>
          Page {currentPage} of {pageCount} - {lines.length}{" "}
          {lines.length === 1 ? "item" : "items"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage <= 1}
          >
            Prev
          </button>
          <button
            type="button"
            className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            disabled={currentPage >= pageCount}
          >
            Next
          </button>
        </div>
      </div>

      {showImporter ? (
        <section
          className="mt-4"
          aria-label="Bulk CSV stationery import"
        >
          <CSVStationeryImporter onStageItems={stageCsvItems} variant="tiles" />
        </section>
      ) : null}
    </form>
  );
}
