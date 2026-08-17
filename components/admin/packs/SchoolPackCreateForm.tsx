"use client";

import { useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown } from "lucide-react";
import GradePackItemSelector, {
  type PackLine,
} from "@/components/grade-packs/GradePackItemSelector";
import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import type { CSVStationeryRow } from "@/app/actions/stationery-import";
import { formatCurrency } from "@/lib/formatCurrency";
import type { PackFormState } from "@/lib/admin/packs";
import styles from "./SchoolPackCreateForm.module.css";

const PAGE_SIZE = 4;
const GRADES = ["Grade R", ...Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`)];

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.createButton} disabled={pending}>
      {pending ? "Creating..." : "Create pack"}
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
  const [page, setPage] = useState(1);
  const itemsInputRef = useRef<HTMLInputElement>(null);

  const pageCount = Math.max(1, Math.ceil(lines.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleLines = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return lines.slice(start, start + PAGE_SIZE);
  }, [currentPage, lines]);
  const total = lines.reduce(
    (sum, line) => sum + (line.unit_price ?? line.price ?? 0) * line.quantity,
    0,
  );
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
    <form action={formAction} onSubmit={handleSubmit} className={styles.form}>
      <input type="hidden" name="school_id" value={schoolId} />
      <input type="hidden" name="visible" value="on" />
      <input ref={itemsInputRef} type="hidden" name="items" defaultValue="[]" />

      <div className={styles.heroRow}>
        <div>
          <h1 className={styles.title}>Create a pack for</h1>
          <p className={styles.schoolName}>{schoolName}</p>
        </div>
        <CreateButton />
      </div>

      {state?.message ? (
        <p className={state.ok ? styles.success : styles.error} role="status">{state.message}</p>
      ) : null}
      {state?.errors?.school_id ? <p className={styles.error}>{state.errors.school_id}</p> : null}

      <section className={styles.controls} aria-label="Pack details and item search">
        <div className={styles.searchSlot}>
          <GradePackItemSelector
            key={selectorKey}
            initialItems={lines}
            showSave={false}
            hideList
            searchLabel=""
            searchPlaceholder="Search items by item code, description, type, SKU or name..."
            onItemsChange={updateLines}
          />
        </div>
        <label className={styles.gradeSelect}>
          <span className={styles.srOnly}>Grade</span>
          <select name="grade" defaultValue="Grade R" required>
            {GRADES.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
          </select>
          <ChevronDown aria-hidden="true" />
        </label>
        <div className={styles.totalChip} aria-label={`Pack total ${formatCurrency(total)}`}>
          {formatCurrency(total)}
        </div>
      </section>
      {state?.errors?.grade ? <p className={styles.error}>{state.errors.grade}</p> : null}
      {state?.errors?.items ? <p className={styles.error}>{state.errors.items}</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
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
            {visibleLines.length ? visibleLines.map((line) => {
              const unitPrice = line.unit_price ?? line.price ?? 0;
              const itemName = line.title || line.name;
              return (
                <tr key={line.id}>
                  <td>{line.sku || line.category || "-"}</td>
                  <td><span className={styles.itemName}>{itemName}</span></td>
                  <td>{line.description || "-"}</td>
                  <td>{line.quantity}</td>
                  <td className={styles.priceCell}>{formatCurrency(unitPrice)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button type="button" className={styles.deleteButton} onClick={() => removeLine(line.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr><td className={styles.emptyRow} colSpan={6}>Search and add stationery items to build this pack.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pager}>
        <span>Page {currentPage} of {pageCount} · {lines.length} {lines.length === 1 ? "item" : "items"}</span>
        <div>
          <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1}>Prev</button>
          <button type="button" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={currentPage >= pageCount}>Next</button>
        </div>
      </div>

      {showImporter ? (
        <section className={styles.csvBanner} aria-label="Bulk CSV stationery import">
          <CSVStationeryImporter onStageItems={stageCsvItems} />
        </section>
      ) : null}
    </form>
  );
}
