"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Search, Plus, Trash2, Package, Check, Sparkles, AlertCircle } from "lucide-react";

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
  onItemsChange?: (lines: PackItem[]) => void;
  onSave?: (lines?: any) => void | Promise<void>;
  onSavePack?: (items: PackItem[], totalPrice: number) => void;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GradePackItemSelector({
  initialItems = [],
  submitLabel = "Save Grade Pack",
  busy = false,
  showSave = true,
  onItemsChange,
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
  const handleSelectItem = (item: StationeryItem) => {
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
    <div className="w-full max-w-4xl mx-auto space-y-6 text-slate-100">
      {/* 1. Item Search & Auto-Populate Bar */}
      <div className="relative space-y-2" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-slate-200">
          Add Stationery Item to Grade Pack
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Type item name or description (e.g., '2H Pencil', '70gsm A4 Box', 'Hardcover Notebook')..."
            className="w-full pl-11 pr-10 min-h-[48px] bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            aria-label="Search stationery items by name or description"
          />

          {isLoading && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Search Results Dropdown Overlay */}
        {isDropdownOpen && searchResults && searchResults.length > 0 && (
          <div className="absolute z-30 w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-800/60">
            {searchResults.map((item) => {
              const itemTitle = item.title || item.name || "Stationery Item";
              const itemPrice = item.unit_price ?? item.price ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className="w-full p-3.5 text-left hover:bg-slate-800/80 transition-colors flex items-center justify-between group min-h-[52px]"
                >
                  <div className="space-y-0.5 pr-4">
                    <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {itemTitle}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-emerald-400">
                      R {itemPrice.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-slate-500">Auto-filled</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isDropdownOpen && debouncedQuery.length >= 2 && searchResults?.length === 0 && !isLoading && (
          <div className="absolute z-30 w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl p-4 text-center text-sm text-slate-400 shadow-xl">
            <AlertCircle className="w-5 h-5 text-amber-400 mx-auto mb-1 inline mr-2" />
            No matching stationery items found for &quot;{debouncedQuery}&quot;.
          </div>
        )}
      </div>

      {/* 2. Assembled Grade Pack Inventory List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Assembled Grade Pack Inventory</h3>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"} added
          </span>
        </div>

        {selectedItems.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm space-y-2">
            <p>No items added to this grade pack yet.</p>
            <p className="text-xs text-slate-600">
              Use the search bar above to auto-populate prices and build your pack.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedItems.map((item) => {
              const displayTitle = item.title || item.name || "Stationery Item";
              const unitPrice = item.unit_price ?? item.price ?? 0;
              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl gap-3"
                >
                  {/* Item Details */}
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-white">{displayTitle}</h4>
                    {item.description && <p className="text-xs text-slate-400">{item.description}</p>}
                  </div>

                  {/* Quantity Controls & Line Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800 rounded text-sm font-bold transition-colors min-h-[44px] min-w-[44px]"
                        aria-label={`Decrease quantity of ${displayTitle}`}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800 rounded text-sm font-bold transition-colors min-h-[44px] min-w-[44px]"
                        aria-label={`Increase quantity of ${displayTitle}`}
                      >
                        +
                      </button>
                    </div>

                    {/* Price Auto-Calculated */}
                    <div className="text-right min-w-[90px]">
                      <p className="text-xs text-slate-400">
                        R {unitPrice.toFixed(2)} ea
                      </p>
                      <p className="text-sm font-bold text-emerald-400">
                        R {(unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove CTA */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Remove Item"
                      aria-label={`Remove ${displayTitle} from pack`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* 3. Total Pack Summary Footer */}
            {showSave && (
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Pack Cost</p>
                  <p className="text-2xl font-extrabold text-emerald-400">
                    R {totalPrice.toFixed(2)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={busy}
                  className="min-h-[44px] px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {busy ? "Saving..." : saveSuccess ? "Pack Saved!" : submitLabel}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GradePackItemSelector;
