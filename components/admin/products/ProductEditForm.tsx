"use client";

import React, {
  useState,
  useTransition,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Package,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  X,
  Sparkles,
  Building2,
  Store,
  Tag,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   1. TYPES & CONTRACTS
   ═══════════════════════════════════════════════════════════════ */

export interface MasterProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  pack_unit: string;
  quantity: number;
  requires_covering: boolean;
  pexco_code: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  code?: string;
}

export interface ProductVariant {
  id: string;
  master_product_id: string;
  brand_id: string;
  brand_name: string;
  sku: string;
  cost_price: number;
  selling_price: number;
  supplier_id: string;
  supplier_name?: string;
  visible_on_catalogue: boolean;
  is_staged?: boolean;
}

export interface ProductEditFormProps {
  /** Initial master product data */
  initialMasterProduct?: Partial<MasterProduct>;
  /** Existing attached brand variants */
  initialVariants?: ProductVariant[];
  /** Master brand directory (defaults to SA stationery brands if omitted) */
  initialBrands?: Brand[];
  /** Available suppliers for cost source */
  suppliers?: Supplier[];
  /** Target margin markup percentage (default 38% -> 16.00 cost yields R 22.08) */
  targetMarginPercent?: number;
  /** Callback fired when saving the master product and all attached variants */
  onSave?: (data: {
    masterProduct: MasterProduct;
    variants: ProductVariant[];
  }) => Promise<void>;
  /** Optional back navigation link */
  returnHref?: string;
}

/* ═══════════════════════════════════════════════════════════════
   2. PRE-SEEDED DIRECTORIES & CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Pre-seeded South African stationery brands
 */
export const PRESEEDED_SA_BRANDS: Brand[] = [
  { id: "brand-aspire", name: "Aspire" },
  { id: "brand-bantex", name: "Bantex" },
  { id: "brand-bic", name: "Bic" },
  { id: "brand-croxley", name: "Croxley" },
  { id: "brand-faber-castell", name: "Faber-Castell" },
  { id: "brand-freedom", name: "Freedom" },
  { id: "brand-lion", name: "Lion" },
  { id: "brand-mondi", name: "Mondi" },
  { id: "brand-oxford", name: "Oxford" },
  { id: "brand-pilot", name: "Pilot" },
  { id: "brand-pritt", name: "Pritt" },
  { id: "brand-sasco", name: "Sasco" },
  { id: "brand-sigma", name: "Sigma" },
  { id: "brand-staedtler", name: "Staedtler" },
  { id: "brand-typek", name: "Typek" },
];

export const PRODUCT_CATEGORIES = [
  "Stationery",
  "Books",
  "Art & Craft",
  "Packaging",
  "Office Equipment",
] as const;

export const PEXCO_CLASSIFICATION_OPTIONS = [
  { code: "PEXC001", label: "PEXC001 — Standard Exercise Books (32–48 pages, A4/A5)" },
  { code: "PEXC002", label: "PEXC002 — Standard Exercise Books (72–80 pages, A4 college)" },
  { code: "PEXC003", label: "PEXC003 — Hardcover Note / Ledger Books (96–192 pages)" },
  { code: "PEXC004", label: "PEXC004 — Standard Textbooks (Softcover/Hardcover)" },
  { code: "PEXC005", label: "PEXC005 — Oversized Atlases / Workbooks" },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: "sup-bsc", name: "BSC Supplies", code: "BSC" },
  { id: "sup-freedom", name: "Freedom Stationery", code: "FRD" },
  { id: "sup-croxley", name: "Croxley South Africa", code: "CRX" },
  { id: "sup-waltons", name: "Bidvest Waltons", code: "WAL" },
];

/* ═══════════════════════════════════════════════════════════════
   3. UTILITY FUNCTIONS (SKU & MARGIN ENGINE)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Calculates selling price using cost and target margin percentage.
 * Example: 16.00 * 1.38 = 22.08
 */
export function calculateSellingPrice(
  costPrice: number,
  marginPercent: number = 38,
): number {
  if (!Number.isFinite(costPrice) || costPrice <= 0) return 0;
  const markupMultiplier = 1 + marginPercent / 100;
  return Math.round(costPrice * markupMultiplier * 100) / 100;
}

/**
 * Generates an automated SKU following the Pexpacks nomenclature:
 * e.g., PEX-STN-CEU-[BRAND]-[SEQ]
 */
export function generateVariantSku(
  productName: string,
  brandName: string,
  existingCount: number = 0,
): string {
  const prefix = "PEX-STN";

  // Initials from product name (e.g. "College Exercise Unruled" -> "CEU")
  const words = productName
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  let prodCode = "";
  if (words.length >= 3) {
    prodCode = words.slice(0, 3).map((w) => w[0].toUpperCase()).join("");
  } else if (words.length === 2) {
    prodCode = (words[0].slice(0, 2) + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    prodCode = words[0].slice(0, 3).toUpperCase();
  } else {
    prodCode = "GEN";
  }

  // Clean brand code (e.g., "Freedom" -> "FRD" or "FREEDOM")
  const cleanBrand = brandName
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 7) || "VAR";

  const seq = String(existingCount + 1).padStart(2, "0");
  return `${prefix}-${prodCode}-${cleanBrand}-${seq}`;
}

/* ═══════════════════════════════════════════════════════════════
   4. INLINE BRAND CREATION MODAL COMPONENT
   ═══════════════════════════════════════════════════════════════ */

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandCreated: (newBrand: Brand) => void;
}

function CreateBrandModal({ isOpen, onClose, onBrandCreated }: BrandModalProps) {
  const [brandName, setBrandName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBrandName("");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = brandName.trim();
    if (!cleanName || cleanName.length < 2) {
      setError("Brand name must be at least 2 characters.");
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        // Call global directory API
        const response = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cleanName }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        const createdBrand: Brand = data.brand || {
          id: `brand-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: cleanName,
        };

        onBrandCreated(createdBrand);
        onClose();
      } catch (err) {
        // Fallback for offline/staged environments
        const fallbackBrand: Brand = {
          id: `brand-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: cleanName,
        };
        onBrandCreated(fallbackBrand);
        onClose();
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="brand-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl shadow-black/80">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 size={18} />
            </div>
            <div>
              <h2 id="brand-modal-title" className="text-base font-semibold text-white">
                Add New Brand
              </h2>
              <p className="text-xs text-slate-400">
                Create a global stationery brand for variants
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="modal-brand-name"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Brand Name <span className="text-emerald-400">*</span>
            </label>
            <input
              ref={inputRef}
              id="modal-brand-name"
              type="text"
              value={brandName}
              onChange={(e) => {
                setBrandName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Treeline, Faber-Castell, Artline..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The brand will be added to the directory and automatically selected.
            </p>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Create &amp; Select</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. MAIN PRODUCT EDIT FORM COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function ProductEditForm({
  initialMasterProduct,
  initialVariants = [],
  initialBrands = PRESEEDED_SA_BRANDS,
  suppliers = DEFAULT_SUPPLIERS,
  targetMarginPercent = 38,
  onSave,
  returnHref = "/admin/products",
}: ProductEditFormProps) {
  // Master Product Form State
  const [masterProduct, setMasterProduct] = useState<MasterProduct>({
    id: initialMasterProduct?.id || `mp-${Date.now()}`,
    name: initialMasterProduct?.name || "College Exercise Unruled",
    category: initialMasterProduct?.category || "Stationery",
    description:
      initialMasterProduct?.description ||
      "A4- 72 pg -College Exercise Bk- Unruled",
    pack_unit: initialMasterProduct?.pack_unit || "Unit",
    quantity: initialMasterProduct?.quantity ?? 1,
    requires_covering: initialMasterProduct?.requires_covering ?? true,
    pexco_code:
      initialMasterProduct?.pexco_code ||
      "PEXC002",
  });

  // Master Brand Directory State (alphabetically sorted)
  const [brands, setBrands] = useState<Brand[]>(() => {
    return [...initialBrands].sort((a, b) => a.name.localeCompare(b.name));
  });

  // Attached Variants State
  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    if (initialVariants.length > 0) return initialVariants;

    // Default variant matching the screenshot state (Freedom brand, R 16.00 cost)
    const freedomBrand = initialBrands.find((b) => b.name.toLowerCase() === "freedom") || initialBrands[0];
    const initialCost = 16.0;
    const initialSelling = calculateSellingPrice(initialCost, targetMarginPercent);

    return [
      {
        id: `var-${Date.now()}`,
        master_product_id: initialMasterProduct?.id || `mp-${Date.now()}`,
        brand_id: freedomBrand?.id || "brand-freedom",
        brand_name: freedomBrand?.name || "Freedom",
        sku: "PEX-STN-CEU-992",
        cost_price: initialCost,
        selling_price: initialSelling,
        supplier_id: suppliers[0]?.id || "sup-bsc",
        supplier_name: suppliers[0]?.name || "BSC Supplies",
        visible_on_catalogue: true,
        is_staged: false,
      },
    ];
  });

  // Active Variant Staging Input State
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [costPriceInput, setCostPriceInput] = useState<string>("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    suppliers[0]?.id || "",
  );
  const [variantVisibility, setVariantVisibility] = useState<boolean>(true);
  const [customSkuInput, setCustomSkuInput] = useState<string>("");
  const [isCustomSku, setIsCustomSku] = useState<boolean>(false);

  // Modals, notices, and async transition states
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [isSaving, startSaveTransition] = useTransition();

  // Dynamic Calculated Selling Price
  const parsedCost = parseFloat(costPriceInput.replace(",", "."));
  const currentCost = Number.isFinite(parsedCost) && parsedCost > 0 ? parsedCost : 0;
  const currentCalculatedSellingPrice = useMemo(
    () => calculateSellingPrice(currentCost, targetMarginPercent),
    [currentCost, targetMarginPercent],
  );

  // Selected Brand Object
  const currentBrand = useMemo(
    () => brands.find((b) => b.id === selectedBrandId),
    [brands, selectedBrandId],
  );

  // Auto-derived SKU for staging preview
  const autoGeneratedSku = useMemo(() => {
    return generateVariantSku(
      masterProduct.name || "Product",
      currentBrand?.name || "GEN",
      variants.length,
    );
  }, [masterProduct.name, currentBrand?.name, variants.length]);

  const activeSku = isCustomSku && customSkuInput ? customSkuInput : autoGeneratedSku;

  // Clear toast after timeout
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  /* -------------------------------------------------------------
     Handing Brand Selection & "+ Add New Brand..."
     ------------------------------------------------------------- */
  const handleBrandSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__ADD_NEW_BRAND__") {
      setIsBrandModalOpen(true);
      return;
    }
    setSelectedBrandId(val);
  };

  const handleBrandCreated = (newBrand: Brand) => {
    setBrands((prev) => {
      const exists = prev.some((b) => b.id === newBrand.id || b.name.toLowerCase() === newBrand.name.toLowerCase());
      if (exists) return prev;
      const updated = [...prev, newBrand];
      return updated.sort((a, b) => a.name.localeCompare(b.name));
    });

    // Automatically select the freshly created brand
    setSelectedBrandId(newBrand.id);
    setToastMessage({
      type: "success",
      text: `Brand "${newBrand.name}" created and selected.`,
    });
  };

  /* -------------------------------------------------------------
     Staging a New Variant (Fast-Entry Workflow)
     ------------------------------------------------------------- */
  const handleAddVariant = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedBrandId) {
      setToastMessage({
        type: "error",
        text: "Please choose a brand for this variant.",
      });
      return;
    }

    if (currentCost <= 0) {
      setToastMessage({
        type: "error",
        text: "Please specify a valid Cost Price greater than 0.",
      });
      return;
    }

    // Check if variant for this brand already exists
    const duplicate = variants.find((v) => v.brand_id === selectedBrandId);
    if (duplicate) {
      setToastMessage({
        type: "info",
        text: `Variant for ${duplicate.brand_name} updated with new pricing.`,
      });
      // Update existing variant
      setVariants((prev) =>
        prev.map((v) =>
          v.brand_id === selectedBrandId
            ? {
                ...v,
                sku: activeSku,
                cost_price: currentCost,
                selling_price: currentCalculatedSellingPrice,
                supplier_id: selectedSupplierId,
                supplier_name:
                  suppliers.find((s) => s.id === selectedSupplierId)?.name ||
                  v.supplier_name,
                visible_on_catalogue: variantVisibility,
              }
            : v,
        ),
      );
    } else {
      // Create new staged variant
      const supplierObj = suppliers.find((s) => s.id === selectedSupplierId);
      const newVariant: ProductVariant = {
        id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        master_product_id: masterProduct.id,
        brand_id: selectedBrandId,
        brand_name: currentBrand?.name || "Unknown Brand",
        sku: activeSku,
        cost_price: currentCost,
        selling_price: currentCalculatedSellingPrice,
        supplier_id: selectedSupplierId,
        supplier_name: supplierObj ? `${supplierObj.name} (${supplierObj.code || "SUP"})` : "BSC Supplies",
        visible_on_catalogue: variantVisibility,
        is_staged: true,
      };

      setVariants((prev) => [newVariant, ...prev]);
      setToastMessage({
        type: "success",
        text: `Added ${newVariant.brand_name} variant (${newVariant.sku}).`,
      });
    }

    // Frictionless reset: clear cost & brand so user can immediately add another brand
    setSelectedBrandId("");
    setCostPriceInput("");
    setCustomSkuInput("");
    setIsCustomSku(false);
  };

  /* -------------------------------------------------------------
     Removing Staged Variant
     ------------------------------------------------------------- */
  const handleRemoveVariant = useCallback((variantId: string) => {
    setVariants((prev) => {
      const removed = prev.find((v) => v.id === variantId);
      const remaining = prev.filter((v) => v.id !== variantId);
      if (removed) {
        setToastMessage({
          type: "info",
          text: `Removed ${removed.brand_name} variant.`,
        });
      }
      return remaining;
    });
  }, []);

  /* -------------------------------------------------------------
     Saving Entire Master Product & Staged Variants
     ------------------------------------------------------------- */
  const handleSaveMasterProduct = () => {
    if (!masterProduct.name.trim()) {
      setToastMessage({
        type: "error",
        text: "Master product name is required.",
      });
      return;
    }

    startSaveTransition(async () => {
      try {
        if (onSave) {
          await onSave({
            masterProduct,
            variants,
          });
        } else {
          // Default save simulation / fetch call
          await new Promise((resolve) => setTimeout(resolve, 600));
        }

        setToastMessage({
          type: "success",
          text: `Master Product "${masterProduct.name}" and ${variants.length} variant(s) saved successfully.`,
        });
      } catch (err) {
        setToastMessage({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to save product.",
        });
      }
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100 font-sans antialiased pb-16">
      {/* ── Toast Notification Banner ── */}
      {toastMessage && (
        <div
          role="status"
          className={`flex items-center justify-between p-3.5 rounded-lg text-sm border shadow-lg transition-all animate-in fade-in ${
            toastMessage.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : toastMessage.type === "error"
                ? "bg-rose-950/60 border-rose-500/40 text-rose-200"
                : "bg-slate-900/90 border-slate-700 text-slate-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toastMessage.type === "success" ? (
              <Check size={16} className="text-emerald-400 shrink-0" />
            ) : toastMessage.type === "error" ? (
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
            ) : (
              <Sparkles size={16} className="text-blue-400 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-200"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Top Master Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            {returnHref && (
              <a
                href={returnHref}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Back to Catalog</span>
              </a>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {masterProduct.category}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1.5">
            {masterProduct.name || "Untitled Master Product"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Master Specification • {variants.length} Brand Variant
            {variants.length === 1 ? "" : "s"} Configured
          </p>
        </div>

        {/* Global Action Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveMasterProduct}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Responsive Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================
            LEFT COLUMN: Master Specs & Fast Variant Entry Builder
            ========================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Master Product Specifications */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3.5 mb-5">
              <Package size={17} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                Product Metadata &amp; Catalogue Information
              </h2>
            </div>

            <div className="space-y-4">
              {/* Product Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label
                    htmlFor="master-name"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Product Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    id="master-name"
                    type="text"
                    value={masterProduct.name}
                    onChange={(e) =>
                      setMasterProduct((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. College Exercise Unruled"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="master-category"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="master-category"
                    value={masterProduct.category}
                    onChange={(e) =>
                      setMasterProduct((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description & Specifications */}
              <div>
                <label
                  htmlFor="master-desc"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Description &amp; Specifications
                </label>
                <textarea
                  id="master-desc"
                  rows={2}
                  value={masterProduct.description}
                  onChange={(e) =>
                    setMasterProduct((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Material specs, binding details, ruling rules..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Pack Unit & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="master-unit"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Pack / Unit (e.g. Pack, Box, Each)
                  </label>
                  <input
                    id="master-unit"
                    type="text"
                    value={masterProduct.pack_unit}
                    onChange={(e) =>
                      setMasterProduct((p) => ({
                        ...p,
                        pack_unit: e.target.value,
                      }))
                    }
                    placeholder="Unit"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="master-qty"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Quantity per Master Item
                  </label>
                  <input
                    id="master-qty"
                    type="number"
                    min={1}
                    value={masterProduct.quantity}
                    onChange={(e) =>
                      setMasterProduct((p) => ({
                        ...p,
                        quantity: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Pexcover Classification Section */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  📚 Pexcover™ Book-Covering Classification
                </span>
                <p className="text-xs text-slate-400 mb-3">
                  Enable if this product is a book or exercise book that requires covering.
                </p>

                <label
                  htmlFor="master-covering"
                  className="inline-flex items-center gap-2 text-sm text-slate-200 cursor-pointer select-none"
                >
                  <input
                    id="master-covering"
                    type="checkbox"
                    checked={masterProduct.requires_covering}
                    onChange={(e) =>
                      setMasterProduct((p) => ({
                        ...p,
                        requires_covering: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                  />
                  <span>Requires Pexcover™ covering</span>
                </label>

                {masterProduct.requires_covering && (
                  <div className="mt-3">
                    <label
                      htmlFor="pexco-select"
                      className="block text-xs font-medium text-slate-400 mb-1"
                    >
                      PEXCO Classification Code
                    </label>
                    <select
                      id="pexco-select"
                      value={masterProduct.pexco_code}
                      onChange={(e) =>
                        setMasterProduct((p) => ({
                          ...p,
                          pexco_code: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    >
                      {PEXCO_CLASSIFICATION_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Fast Brand-Specific Variant Creator (Quick Multi-Entry) */}
          <div className="rounded-xl bg-slate-900 border border-emerald-500/30 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
              <div className="flex items-center gap-2.5">
                <Tag size={17} className="text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                  Add Brand Variant (Fast Multi-Entry)
                </h2>
              </div>
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Auto-Derives Margin ({targetMarginPercent}%)
              </span>
            </div>

            <form onSubmit={handleAddVariant} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Brand Selector with "+ Add New Brand..." Option */}
                <div className="sm:col-span-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="variant-brand-select"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      Brand Type <span className="text-emerald-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsBrandModalOpen(true)}
                      className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline inline-flex items-center gap-1"
                    >
                      <Plus size={11} />
                      <span>New Brand</span>
                    </button>
                  </div>

                  <select
                    id="variant-brand-select"
                    value={selectedBrandId}
                    onChange={handleBrandSelectChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    <option value="">— Select Brand —</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                    <option disabled className="text-slate-600 bg-slate-900">
                      ───────────────
                    </option>
                    <option
                      value="__ADD_NEW_BRAND__"
                      className="font-semibold text-emerald-400 bg-slate-900"
                    >
                      + Add New Brand...
                    </option>
                  </select>
                </div>

                {/* Cost Price Input */}
                <div className="sm:col-span-6">
                  <label
                    htmlFor="variant-cost-input"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Cost Price (R) <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    id="variant-cost-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={costPriceInput}
                    onChange={(e) => setCostPriceInput(e.target.value)}
                    placeholder="e.g. 16.00"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* SKU & Supplier Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* SKU with Auto-Sync Toggle */}
                <div className="sm:col-span-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="variant-sku-input"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      Variant SKU
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSku(false);
                        setCustomSkuInput("");
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-medium"
                    >
                      <RefreshCw size={11} />
                      <span>Auto-sync</span>
                    </button>
                  </div>
                  <input
                    id="variant-sku-input"
                    type="text"
                    value={activeSku}
                    onChange={(e) => {
                      setCustomSkuInput(e.target.value);
                      setIsCustomSku(true);
                    }}
                    placeholder="PEX-STN-CEU-..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono text-xs"
                  />
                </div>

                {/* Supplier Source */}
                <div className="sm:col-span-6">
                  <label
                    htmlFor="variant-supplier-select"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                  >
                    Supplier (Cost Source)
                  </label>
                  <select
                    id="variant-supplier-select"
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.code ? `(${s.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Inline Margin & Staging Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 bg-slate-950/40 p-3.5 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Target Margin
                    </span>
                    <span className="text-sm font-semibold text-emerald-400">
                      +{targetMarginPercent}% (Auto)
                    </span>
                  </div>

                  <div className="border-l border-slate-800 pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Derived Selling Price
                    </span>
                    <span className="text-lg font-bold text-white font-mono">
                      {currentCalculatedSellingPrice > 0
                        ? `R ${currentCalculatedSellingPrice.toFixed(2)}`
                        : "R 0.00"}
                    </span>
                  </div>
                </div>

                {/* Add Variant Button */}
                <button
                  type="submit"
                  disabled={!selectedBrandId || currentCost <= 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-lg shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  <span>Add Brand Variant</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Existing Variants Matrix Table */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <Store size={17} className="text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                  Attached Brand Variants
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {variants.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                School packs pick from these configured commercial brand options.
              </p>
            </div>

            {variants.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-800 rounded-lg">
                <Tag size={28} className="mx-auto text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-300">
                  No brand variants configured yet
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Select a brand (e.g., Freedom, Croxley) and enter a cost price above to attach the first variant.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4 text-right">Cost Price</th>
                      <th className="py-3 px-4 text-right">Selling Price</th>
                      <th className="py-3 px-4">Cost Source</th>
                      <th className="py-3 px-4 text-center">Catalogue</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {variants.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-100 border border-slate-700">
                            {v.brand_name}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                          {v.sku}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-300">
                          R {v.cost_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          R {v.selling_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-[130px]">
                          {v.supplier_name || "BSC Supplies"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setVariants((prev) =>
                                prev.map((item) =>
                                  item.id === v.id
                                    ? {
                                        ...item,
                                        visible_on_catalogue:
                                          !item.visible_on_catalogue,
                                      }
                                    : item,
                                ),
                              );
                            }}
                            className={`p-1 rounded-md transition-colors ${
                              v.visible_on_catalogue
                                ? "text-emerald-400 hover:bg-emerald-950/40"
                                : "text-slate-500 hover:bg-slate-800"
                            }`}
                            title={
                              v.visible_on_catalogue
                                ? "Visible on catalogue"
                                : "Hidden from catalogue"
                            }
                          >
                            {v.visible_on_catalogue ? (
                              <Eye size={15} />
                            ) : (
                              <EyeOff size={15} />
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                            title="Remove variant"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: Pricing & Availability Sidebar (Matches Current UI)
            ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Pricing & Availability Overview */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Package size={17} className="text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                Pricing &amp; Availability
              </h2>
            </div>

            {/* Benchmark Primary Cost Input (Freedom Default) */}
            <div>
              <label
                htmlFor="primary-cost"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Cost Price (R)
              </label>
              <input
                id="primary-cost"
                type="number"
                step="0.01"
                value={variants[0]?.cost_price || 16}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (variants.length > 0) {
                    setVariants((prev) => [
                      {
                        ...prev[0],
                        cost_price: val,
                        selling_price: calculateSellingPrice(
                          val,
                          targetMarginPercent,
                        ),
                      },
                      ...prev.slice(1),
                    ]);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Calculated Selling Price Highlight Card */}
            <div className="rounded-lg bg-slate-950/80 border border-emerald-500/20 p-4 relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Calculated Selling Price
              </span>
              <div className="text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">
                R{" "}
                {(variants[0]?.selling_price ||
                  calculateSellingPrice(16, targetMarginPercent)).toFixed(2)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                = Cost + Target Margin (auto)
              </span>
            </div>

            {/* Supplier Select */}
            <div>
              <label
                htmlFor="sidebar-supplier"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Supplier (Cost Price Source)
              </label>
              <select
                id="sidebar-supplier"
                value={variants[0]?.supplier_id || suppliers[0]?.id}
                onChange={(e) => {
                  const sid = e.target.value;
                  const sObj = suppliers.find((s) => s.id === sid);
                  if (variants.length > 0) {
                    setVariants((prev) => [
                      {
                        ...prev[0],
                        supplier_id: sid,
                        supplier_name: sObj?.name,
                      },
                      ...prev.slice(1),
                    ]);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} {sup.code ? `(${sup.code})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Select the supplier whose cost price is used for this product.
              </p>
            </div>

            {/* Visible on Public Catalogue Checkbox */}
            <label
              htmlFor="catalogue-visibility-check"
              className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer select-none"
            >
              <input
                id="catalogue-visibility-check"
                type="checkbox"
                checked={variants[0]?.visible_on_catalogue ?? true}
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (variants.length > 0) {
                    setVariants((prev) => [
                      { ...prev[0], visible_on_catalogue: checked },
                      ...prev.slice(1),
                    ]);
                  }
                }}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
              />
              <span className="font-medium">Visible on Public Catalogue</span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {returnHref && (
                <a
                  href={returnHref}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold text-center transition-colors"
                >
                  Cancel
                </a>
              )}
              <button
                type="button"
                onClick={handleSaveMasterProduct}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Save product</span>
              </button>
            </div>
          </div>

          {/* Card: Product Type Info */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <Store size={17} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">
                Product Type
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Master catalogue product — reusable across school packs with multiple brand options.
            </p>
          </div>
        </div>
      </div>

      {/* ── Brand Creation Modal ── */}
      <CreateBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onBrandCreated={handleBrandCreated}
      />
    </div>
  );
}

export default ProductEditForm;
