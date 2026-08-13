/**
 * Grade-pack item selector — dark, mobile-first, accessible.
 * Debounced SWR typeahead over the stationery inventory (reuses the same
 * server action as the admin ItemsManager) with auto price population, line
 * totals and a keyboard-navigable listbox. Intended as the shared line-item
 * builder for the grade-pack creation/editing forms.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Search, X } from "lucide-react";
import { searchStationeryInventoryAction } from "@/app/admin/items/actions";
import type { StationeryInventoryItem } from "@/lib/admin/items";
import "@/styles/admin-dark.css";
import styles from "./GradePackItemSelector.module.css";

export interface PackLine {
  id: string;
  name: string;
  description: string | null;
  unit_price: number | null;
  quantity: number;
}

interface GradePackItemSelectorProps {
  initialItems?: PackLine[];
  submitLabel?: string;
  busy?: boolean;
  showSave?: boolean;
  onItemsChange?: (items: PackLine[]) => void;
  onSave: (items: PackLine[]) => void | Promise<void>;
}

export default function GradePackItemSelector({
  initialItems = [],
  submitLabel = "Save grade pack",
  busy = false,
  showSave = true,
  onItemsChange,
  onSave,
}: GradePackItemSelectorProps) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<PackLine[]>(initialItems);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (announceTimer.current) clearTimeout(announceTimer.current);
    if (!announcement) return;
    announceTimer.current = setTimeout(() => setAnnouncement(""), 2000);
    return () => {
      if (announceTimer.current) clearTimeout(announceTimer.current);
    };
  }, [announcement]);

  const searchKey = debounced.trim().length >= 2 ? ["stationery-inventory", debounced.trim()] : null;

  const { data: results, isValidating } = useSWR<StationeryInventoryItem[]>(
    searchKey,
    ([, q]) => searchStationeryInventoryAction(q),
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (!open && query.trim().length >= 2) setOpen(true);
    if (open && results && results.length > 0 && activeIndex === -1) setActiveIndex(0);
  }, [open, results, query, activeIndex]);

  function announce(message: string) {
    setAnnouncement(message);
  }

  function updateItems(next: PackLine[]) {
    setItems(next);
    onItemsChange?.(next);
  }

  function addItem(suggestion: StationeryInventoryItem) {
    const lower = suggestion.name.toLowerCase();
    const existing = items.find((i) => i.name.toLowerCase() === lower);

    updateItems(
      existing
        ? items.map((i) =>
            i.name.toLowerCase() === lower ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [
            ...items,
            {
              id: suggestion.id,
              name: suggestion.name,
              description: suggestion.description,
              unit_price: suggestion.unit_price,
              quantity: 1,
            },
          ]
    );

    announce(existing ? `Increased quantity of ${suggestion.name}` : `Added ${suggestion.name}`);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function changeQuantity(name: string, delta: number) {
    const lower = name.toLowerCase();
    const target = items.find((i) => i.name.toLowerCase() === lower);
    if (!target) return;

    const quantity = target.quantity + delta;
    if (quantity <= 0) {
      updateItems(items.filter((i) => i.name.toLowerCase() !== lower));
      announce(`Removed ${name}`);
      return;
    }
    updateItems(items.map((i) => (i.name.toLowerCase() === lower ? { ...i, quantity } : i)));
  }

  function removeItem(name: string) {
    const lower = name.toLowerCase();
    updateItems(items.filter((i) => i.name.toLowerCase() !== lower));
    announce(`Removed ${name}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !results || results.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (i + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < results.length) {
          addItem(results[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      default:
        break;
    }
  }

  const lines = items.map((i) => ({
    ...i,
    lineTotal: i.unit_price != null ? i.unit_price * i.quantity : null,
  }));
  const grandTotal = lines.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  async function handleSave() {
    await onSave(items);
  }

  return (
    <div className={`admin-dark ${styles.root}`}>
      <div className={styles.searchBlock}>
        <label className={styles.fieldLabel} htmlFor="pack-item-search">
          Search stationery
        </label>
        <div className={styles.searchField}>
          <Search size={18} />
          <input
            id="pack-item-search"
            ref={inputRef}
            className={styles.searchInput}
            type="search"
            placeholder="Type at least 2 characters, e.g. “4mm ruler”"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              if (debounced.trim().length >= 2) setOpen(true);
            }}
            onBlur={() => {
              setTimeout(() => setOpen(false), 120);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-controls="pack-item-results"
            aria-autocomplete="list"
            aria-activedescendant={
              open && activeIndex >= 0 ? `pack-item-option-${activeIndex}` : undefined
            }
          />
          {isValidating ? <span className={styles.searching}>Searching…</span> : null}
        </div>
        {open && query.trim().length >= 2 ? (
          <ul
            id="pack-item-results"
            className={styles.results}
            role="listbox"
            aria-label="Stationery results"
          >
            {results && results.length > 0
              ? results.map((r, i) => (
                  <li
                    key={r.id}
                    id={`pack-item-option-${i}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    className={`${styles.resultItem} ${i === activeIndex ? styles.resultActive : ""}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addItem(r);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                  >
                    <span className={styles.resultName}>{r.name}</span>
                    <span className={styles.resultPrice}>
                      {r.unit_price != null ? `R ${r.unit_price}` : "Price on request"}
                    </span>
                    {r.description ? (
                      <span className={styles.resultDesc}>{r.description}</span>
                    ) : null}
                  </li>
                ))
              : isValidating
                ? null
                : (
                    <li className={styles.resultEmpty} role="presentation">
                      No matching items found.
                    </li>
                  )}
          </ul>
        ) : null}
      </div>

      <div className={styles.packBlock}>
        <div className={styles.packHeader}>
          <h2 className={styles.packTitle}>Pack contents</h2>
          <span className={styles.packCount}>{totalCount} item{totalCount === 1 ? "" : "s"}</span>
        </div>

        {lines.length === 0 ? (
          <p className={styles.emptyNote}>No items yet — search above to add stationery.</p>
        ) : (
          <ul className={styles.lineList}>
            {lines.map((line) => (
              <li key={line.name} className={styles.lineItem}>
                <div className={styles.lineInfo}>
                  <span className={styles.lineName}>{line.name}</span>
                  <span className={styles.linePrice}>
                    {line.unit_price != null ? `R ${line.unit_price} each` : "Price on request"}
                  </span>
                </div>
                <div className={styles.lineControls}>
                  <div className={styles.qtyStepper} aria-label={`Quantity of ${line.name}`}>
                    <button
                      type="button"
                      className={styles.stepBtn}
                      onClick={() => changeQuantity(line.name, -1)}
                      aria-label={`Decrease quantity of ${line.name}`}
                    >
                      <span aria-hidden="true">−</span>
                    </button>
                    <span className={styles.qtyValue} aria-live="polite">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      className={styles.stepBtn}
                      onClick={() => changeQuantity(line.name, 1)}
                      aria-label={`Increase quantity of ${line.name}`}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                  <span className={styles.lineTotal}>
                    {line.lineTotal != null ? `R ${line.lineTotal}` : "—"}
                  </span>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeItem(line.name)}
                    aria-label={`Remove ${line.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {lines.length > 0 ? (
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Estimated total</span>
            <span className={styles.totalValue}>R {grandTotal}</span>
          </div>
        ) : null}

        {showSave ? (
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={() => void handleSave()}
              disabled={busy || lines.length === 0}
            >
              {busy ? "Saving…" : submitLabel}
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.visuallyHidden} aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
