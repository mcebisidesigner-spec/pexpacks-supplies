"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Search, Trash2, Check, AlertCircle } from "lucide-react";
import styles from "./GradePackItemSelector.module.css";

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
  onItemsChange?: (lines: PackItem[]) => void;
  onSelectItem?: (item: StationeryItem) => void | Promise<void>;
  onSave?: (lines: PackItem[]) => void | Promise<void>;
  onSavePack?: (items: PackItem[], totalPrice: number) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GradePackItemSelector({
  initialItems = [],
  submitLabel = "Save Grade Pack",
  busy = false,
  showSave = true,
  hideList = false,
  searchLabel = "Add Stationery Item to Grade Pack",
  searchPlaceholder = "Type item name or description (e.g., '2H Pencil', '70gsm A4 Box', 'Hardcover Notebook')...",
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
    fetcher
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
      quantity: 1,
    };

    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      let updated: PackItem[];
      if (existing) {
        updated = prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updated = [...prev, newItem];
      }
      notifyChange(updated);
      return updated;
    });

    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  // Adjust item quantity inside pack
  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setSelectedItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item));
      notifyChange(updated);
      return updated;
    });
  };

  // Remove item from pack
  const removeItem = (id: string) => {
    setSelectedItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      notifyChange(updated);
      return updated;
    });
  };

  // Calculate total price of the grade pack
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + (item.unit_price ?? item.price ?? 0) * item.quantity,
    0
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

  return (
    <div className={styles.root}>
      {/* 1. Item Search & Auto-Populate Bar */}
      <div className={styles.searchBlock} ref={dropdownRef}>
        <label className={styles.fieldLabel}>
          {searchLabel}
        </label>

        <div className={styles.searchWrap}>
          <div className={styles.searchIconWrap}>
            <Search className={styles.searchIconGlyph} />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={searchPlaceholder}
            className={styles.searchInput}
            aria-label="Search stationery items by name or description"
          />

          {isLoading && (
            <div className={styles.spinnerWrap}>
              <div className={styles.spinner} />
            </div>
          )}
        </div>

        {/* Search Results Dropdown Overlay */}
        {isDropdownOpen && searchResults && searchResults.length > 0 && (
          <div className={styles.results}>
            {searchResults.map((item) => {
              const itemTitle = item.title || item.name || "Stationery Item";
              const itemPrice = item.unit_price ?? item.price ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className={styles.resultButton}
                >
                  <div className={styles.resultInfo}>
                    <p className={styles.resultTitle}>
                      {itemTitle}
                    </p>
                    {item.description && (
                      <p className={styles.resultDesc}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className={styles.resultPriceBlock}>
                    <span className={styles.resultPrice}>
                      R {itemPrice.toFixed(2)}
                    </span>
                    <p className={styles.resultPriceTag}>Auto-filled</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isDropdownOpen && debouncedQuery.length >= 2 && searchResults?.length === 0 && !isLoading && (
          <div className={styles.resultEmpty}>
            <AlertCircle className={styles.emptyIcon} />
            No matching stationery items found for &quot;{debouncedQuery}&quot;.
          </div>
        )}
      </div>

      {/* 2. Assembled Grade Pack Inventory List */}
      {hideList ? null : selectedItems.length === 0 ? (
        <div className={styles.emptyNote}>
          <p className={styles.emptyNoteMain}>No items added to this grade pack yet.</p>
          <p className={styles.emptyNoteSub}>
            Use the search bar above to auto-populate prices and build your pack.
          </p>
        </div>
      ) : (
        <div className={styles.lineList}>
          {selectedItems.map((item) => {
            const displayTitle = item.title || item.name || "Stationery Item";
            const unitPrice = item.unit_price ?? item.price ?? 0;
            return (
              <div
                key={item.id}
                className={styles.lineItem}
              >
                {/* Item Details */}
                <div className={styles.lineInfo}>
                  <h4 className={styles.lineName}>{displayTitle}</h4>
                  {item.description && <p className={styles.lineDesc}>{item.description}</p>}
                </div>

                {/* Quantity Controls & Line Total */}
                <div className={styles.lineControls}>
                  <div className={styles.qtyStepper}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className={styles.stepBtn}
                      aria-label={`Decrease quantity of ${displayTitle}`}
                    >
                      -
                    </button>
                    <span className={styles.qtyValue}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className={styles.stepBtn}
                      aria-label={`Increase quantity of ${displayTitle}`}
                    >
                      +
                    </button>
                  </div>

                  {/* Price Auto-Calculated */}
                  <div className={styles.priceBlock}>
                    <p className={styles.priceUnit}>
                      R {unitPrice.toFixed(2)} ea
                    </p>
                    <p className={styles.priceTotal}>
                      R {(unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Remove CTA */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className={styles.removeBtn}
                    title="Remove Item"
                    aria-label={`Remove ${displayTitle} from pack`}
                  >
                    <Trash2 className={styles.removeIcon} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 3. Total Pack Summary Footer */}
          {showSave && (
            <div className={styles.totalRow}>
              <div>
                <p className={styles.totalLabel}>Total Pack Cost</p>
                <p className={styles.totalValue}>
                  R {totalPrice.toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={busy}
                className={styles.saveBtn}
              >
                <Check className={styles.saveBtnIcon} />
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
