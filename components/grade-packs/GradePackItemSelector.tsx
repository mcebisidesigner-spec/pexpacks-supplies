"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Search, Trash2, Check, AlertCircle } from "lucide-react";

export interface StationeryItem {
  id: string;
  name?: string;
  title?: string;
  description?: string | null;
  unit_price?: number | null;
  price?: number | null;
  sku?: string;
  category?: string;
}

export interface PackItem {
  id: string;
  name: string;
  title?: string;
  description?: string | null;
  unit_price?: number | null;
  price?: number | null;
  sku?: string;
  category?: string;
  quantity: number;
}

export type PackLine = PackItem;

export interface GradePackItemSelectorProps {
  initialItems?: PackItem[];
  submitLabel?: string;
  busy?: boolean;
  showSave?: boolean;
  hideList?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  variant?: "default" | "packEditor";
  onItemsChange?: (lines: PackItem[]) => void;
  onSelectItem?: (item: StationeryItem) => void | Promise<void>;
  onSave?: (lines: PackItem[]) => void | Promise<void>;
  onSavePack?: (items: PackItem[], totalPrice: number) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// ── Shared class strings ────────────────────────────────────────────────────
const searchInputCls =
  "w-full h-[44px] min-h-[44px] pl-[48px] pr-[16px] py-0 border border-[#1e293b] rounded-[8px] bg-[#020617] text-[var(--a-text)] font-inherit text-[14px] font-bold outline-none transition-all duration-[140ms] ease placeholder:text-[#64748b] placeholder:font-medium focus:border-[var(--a-accent)] focus:[box-shadow:0_0_0_3px_rgba(45,212,191,0.14)]";

const stepBtnCls =
  "inline-flex items-center justify-center w-[44px] h-[44px] rounded-[8px] border-none bg-transparent text-[var(--a-text-2)] text-[16px] font-bold cursor-pointer transition-[background,color] duration-[140ms] ease hover:bg-[var(--a-surface-2)] hover:text-[var(--a-text)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_var(--a-accent)]";

const removeBtnCls =
  "inline-flex items-center justify-center w-[44px] h-[44px] rounded-[10px] border-none bg-transparent text-[var(--a-text-3)] cursor-pointer transition-[color,background] duration-[140ms] ease hover:text-[var(--a-red)] hover:bg-[var(--a-red-subtle)] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_var(--a-accent)]";

export function GradePackItemSelector({
  initialItems = [],
  submitLabel = "Save Grade Pack",
  busy = false,
  showSave = true,
  hideList = false,
  searchLabel = "Add Stationery Item to Grade Pack",
  searchPlaceholder = "Search stationery items by name or description",
  variant = "default",
  onItemsChange,
  onSelectItem,
  onSave,
  onSavePack,
}: GradePackItemSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<PackItem[]>(initialItems);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce input typing (150ms) to prevent unnecessary DB spam
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // SWR query fetches matching items
  const { data: searchResults, isLoading } = useSWR<StationeryItem[]>(
    debouncedQuery.length >= 2
      ? `/api/stationery/search?q=${encodeURIComponent(debouncedQuery)}`
      : null,
    fetcher,
  );
  const matchingItems = Array.isArray(searchResults) ? searchResults : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifyChange = (items: PackItem[]) => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  };

  // Add item to current Grade Pack and auto-populate unit price
  const handleSelectItem = async (item: StationeryItem) => {
    if (onSelectItem) {
      await onSelectItem(item);
    }
    const priceVal = item.unit_price ?? item.price ?? 0;
    const titleVal = item.title || item.name || "Stationery Item";

    const newItem: PackItem = {
      id: item.id,
      title: titleVal,
      name: titleVal,
      description: item.description,
      unit_price: priceVal,
      price: priceVal,
      sku: item.sku,
      category: item.category,
      quantity: 1,
    };

    const existing = selectedItems.find((i) => i.id === item.id);
    const updated = existing
      ? selectedItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      : [...selectedItems, newItem];
    setSelectedItems(updated);
    notifyChange(updated);

    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  // Adjust item quantity inside pack
  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    const updated = selectedItems.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item,
    );
    setSelectedItems(updated);
    notifyChange(updated);
  };

  // Remove item from pack
  const removeItem = (id: string) => {
    const updated = selectedItems.filter((item) => item.id !== id);
    setSelectedItems(updated);
    notifyChange(updated);
  };

  // Calculate total price of the grade pack
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + (item.unit_price ?? item.price ?? 0) * item.quantity,
    0,
  );

  const handleSave = async () => {
    if (onSave) {
      await onSave(selectedItems);
    }
    if (onSavePack) {
      onSavePack(selectedItems, totalPrice);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isPackEditor = variant === "packEditor";

  return (
    <div
      className={[
        "flex flex-col gap-[14px] w-full max-w-none m-0 text-[var(--a-text-2)] font-inherit",
        isPackEditor ? "gap-0" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 1. Item Search & Auto-Populate Bar */}
      <div
        className={[
          "relative flex flex-col gap-[8px]",
          isPackEditor ? "gap-0" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        ref={dropdownRef}
      >
        {searchLabel ? (
          <label className="block text-[13px] font-extrabold text-[var(--a-text-2)]">
            {searchLabel}
          </label>
        ) : null}

        <div
          className={[
            "relative",
            isPackEditor ? "min-h-[44px] bg-transparent" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-[16px] pointer-events-none z-[5]">
            <Search className="w-[18px] h-[18px] text-[#94a3b8]" />
          </div>

          <input
            id="grade-pack-item-search"
            name="gradePackItemSearch"
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={searchPlaceholder}
            className={searchInputCls}
            aria-label="Search stationery items by name or description"
          />

          {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-[12px] pointer-events-none">
              <div className="w-[16px] h-[16px] border-2 border-[var(--a-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown Overlay */}
        {isDropdownOpen && matchingItems.length > 0 && (
          <div className="absolute z-[999999] top-[calc(100%+6px)] left-0 right-0 max-h-[420px] overflow-y-auto rounded-[10px] border border-[rgba(16,185,129,0.45)] bg-[#090e17] [box-shadow:0_24px_50px_rgba(0,0,0,0.95),0_0_0_1px_rgba(16,185,129,0.25)] [scrollbar-width:thin] [scrollbar-color:#219e9a_#0b1320]">
            {matchingItems.map((item) => {
              const itemTitle = item.title || item.name || "Stationery Item";
              const itemPrice = item.unit_price ?? item.price ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className="flex items-center justify-between gap-[16px] w-full min-h-[52px] px-[16px] py-[14px] text-left border-0 border-t border-t-[rgba(255,255,255,0.08)] first:border-t-0 bg-[#090e17] text-inherit cursor-pointer transition-[background] duration-[140ms] ease hover:bg-[rgba(16,185,129,0.12)] focus-visible:outline-none focus-visible:[box-shadow:inset_0_0_0_3px_var(--a-accent)]"
                >
                  <div className="flex flex-col gap-[2px] min-w-0 pr-[16px]">
                    <p className="text-[14px] font-extrabold text-white transition-[color] duration-[140ms] ease group-hover:text-[#10b981]">
                      {itemTitle}
                    </p>
                    {item.sku || item.category ? (
                      <p className="m-0 overflow-hidden text-[#38bdf8] text-[11px] font-bold text-ellipsis whitespace-nowrap">
                        {[item.sku, item.category].filter(Boolean).join(" / ")}
                      </p>
                    ) : null}
                    {item.description && (
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] text-[#94a3b8]">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="text-[14px] font-bold text-[#10b981]">
                      R {itemPrice.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-[#64748b]">Auto-filled</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isDropdownOpen &&
          debouncedQuery.length >= 2 &&
          matchingItems.length === 0 &&
          !isLoading && (
            <div className="absolute z-[999999] top-[calc(100%+6px)] left-0 right-0 px-[16px] py-[16px] text-center text-[14px] text-[#94a3b8] rounded-[10px] border border-[rgba(16,185,129,0.45)] bg-[#090e17] [box-shadow:0_24px_50px_rgba(0,0,0,0.95)]">
              <AlertCircle className="inline-block align-middle mr-[8px] w-[20px] h-[20px] text-[var(--a-amber)]" />
              {`No matching stationery items found for "${debouncedQuery}".`}
            </div>
          )}
      </div>

      {/* 2. Assembled Grade Pack Inventory List */}
      {hideList ? null : selectedItems.length === 0 ? (
        <div className="m-0 py-[32px] text-center text-[14px] text-[var(--a-text-3)]">
          <p className="m-0">No items added to this grade pack yet.</p>
          <p className="mt-[4px] m-0 text-[12px] text-[var(--a-text-4)]">
            Use the search bar above to auto-populate prices and build your
            pack.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[12px]">
          {selectedItems.map((item) => {
            const displayTitle = item.title || item.name || "Stationery Item";
            const unitPrice = item.unit_price ?? item.price ?? 0;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-[12px] p-[14px] rounded-[var(--a-radius-sm)] border border-[var(--a-border)] bg-[var(--a-bg)] sm:flex-row sm:items-center"
              >
                {/* Item Details */}
                <div className="flex flex-col gap-[2px] sm:flex-1">
                  <h4 className="m-0 text-[14px] font-semibold text-[var(--a-text)]">
                    {displayTitle}
                  </h4>
                  {item.description && (
                    <p className="m-0 text-[12px] text-[var(--a-text-3)]">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between gap-[16px] shrink-0 sm:justify-end">
                  <div className="inline-flex items-center gap-[6px] p-[4px] rounded-[10px] border border-[var(--a-border)] bg-[var(--a-surface)]">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className={stepBtnCls}
                      aria-label={`Decrease quantity of ${displayTitle}`}
                    >
                      -
                    </button>
                    <span className="min-w-[32px] text-center text-[14px] font-semibold text-[var(--a-text)]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className={stepBtnCls}
                      aria-label={`Increase quantity of ${displayTitle}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Price Auto-Calculated */}
                  <div className="shrink-0 min-w-[90px] text-right">
                    <p className="m-0 text-[12px] text-[var(--a-text-3)]">
                      R {unitPrice.toFixed(2)} ea
                    </p>
                    <p className="m-0 text-[14px] font-bold text-[var(--a-accent-strong)]">
                      R {(unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Remove CTA */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className={removeBtnCls}
                    title="Remove Item"
                    aria-label={`Remove ${displayTitle} from pack`}
                  >
                    <Trash2 className="w-[16px] h-[16px]" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 3. Total Pack Summary Footer */}
          {showSave && (
            <div className="flex items-center justify-between gap-[12px] pt-[16px] border-t border-t-[var(--a-border)]">
              <div>
                <p className="m-0 text-[12px] text-[var(--a-text-3)]">
                  Total Pack Cost
                </p>
                <p className="m-0 text-[24px] font-extrabold text-[var(--a-accent-strong)]">
                  R {totalPrice.toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className="inline-flex items-center gap-[8px] min-h-[44px] px-[24px] rounded-[var(--a-radius-sm)] border-none bg-[var(--a-accent)] text-[var(--db-canvas)] text-[14px] font-extrabold cursor-pointer [box-shadow:0_8px_20px_var(--a-accent-subtle)] transition-[background] duration-[160ms] ease hover:not-disabled:bg-[var(--a-accent-strong)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:[box-shadow:0_0_0_3px_var(--a-accent)]"
              >
                <Check className="w-[16px] h-[16px]" />
                {busy ? "Saving..." : saveSuccess ? "Pack Saved!" : submitLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GradePackItemSelector;
