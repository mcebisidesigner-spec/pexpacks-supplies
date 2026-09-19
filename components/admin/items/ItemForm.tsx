"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { RotateCw, Save, Sparkles, Package, Store, Tag, X } from "lucide-react";
import type { ItemFormState, ItemRow } from "@/lib/admin/items";
import { createItemAction, updateItemAction } from "@/app/admin/items/actions";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { PACK_ITEM_ICONS, isPackItemIconKey } from "@/lib/packs/itemIcons";
import { inferIcon } from "@/lib/packs/normalisePackItems";
import { generateSkuFromName, sanitizeSku } from "@/lib/sku-generator";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { PEXCO_CLASSIFICATIONS } from "@/lib/admin/system-settings-shared";
import type { MasterPricingConfig } from "@/lib/admin/items";
import { AdminDropdown } from "@/components/admin/ui/AdminDropdown";
import { DbNotice } from "@/components/admin/ui/DbNotice";
import { MASTER_PRODUCT_CATEGORIES } from "@/lib/admin/item-constants";
import adminStyles from "@/app/admin/admin.module.css";

interface ItemFormProps {
  item: ItemRow | null;
  packs: { id: string; title: string }[];
  returnTo?: string;
  submitLabel?: string;
  /** Master product mode: the price field is the supplier Cost Price and a
   *  selling price is auto-computed from Pricing & Margin settings. */
  masterMode?: boolean;
  pricingConfig?: MasterPricingConfig;
  suppliers?: { id: string; name: string; code?: string }[];
  /** Called when the item name changes — used to keep parent header in sync */
  onNameChange?: (name: string) => void;
  /** Called when the SKU changes — used to keep parent header subtitle in sync */
  onSkuChange?: (sku: string) => void;
  /** Called when the category changes — used to keep parent header badge in sync */
  onCategoryChange?: (category: string) => void;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <AdminButton
      type="submit"
      variant="primary"
      size="md"
      loading={pending}
      icon={<Save size={14} />}
    >
      {label}
    </AdminButton>
  );
}

export function ItemForm({
  item,
  packs,
  returnTo = "/admin/items",
  submitLabel = "Save item",
  masterMode = false,
  pricingConfig,
  suppliers = [],
  onNameChange,
  onSkuChange,
  onCategoryChange,
}: ItemFormProps) {
  const router = useRouter();
  const action =
    item == null ? createItemAction : updateItemAction.bind(null, item.id);
  const [state, formAction] = useActionState<ItemFormState, FormData>(action, {
    ok: false,
  });
  const [icon, setIcon] = useState<string>(() => {
    if (
      item?.icon &&
      isPackItemIconKey(item.icon) &&
      item.icon !== "box" &&
      item.icon !== "package"
    ) {
      return item.icon;
    }
    if (item?.name) {
      const inferred = inferIcon(item.name);
      if (inferred && isPackItemIconKey(inferred)) return inferred;
    }
    return "folder";
  });

  const [productName, setProductName] = useState<string>(item?.name ?? "");
  const [category, setCategory] = useState<string>(
    item?.category ?? "Stationery",
  );
  const defaultBrand = item?.brand?.trim() ? item.brand : "Add-Brand-Name";
  const [brand, setBrand] = useState<string>(defaultBrand);
  const originalBrand = item?.brand?.trim() || "Add-Brand-Name";
  const isOriginalBrandReal =
    originalBrand && originalBrand.toLowerCase() !== "add-brand-name";
  const isNewBrandReal =
    brand.trim() && brand.toLowerCase() !== "add-brand-name";
  const isBrandChanged = Boolean(
    masterMode &&
      item &&
      isOriginalBrandReal &&
      isNewBrandReal &&
      originalBrand.toLowerCase() !== brand.trim().toLowerCase(),
  );
  const [saveMode, setSaveMode] = useState<"new_variant" | "update_existing">(
    "new_variant",
  );
  const effectiveSubmitLabel =
    masterMode && isBrandChanged
      ? saveMode === "new_variant"
        ? `Save as ${brand} product`
        : "Update product"
      : submitLabel;
  const [sku, setSku] = useState<string>(() => {
    if (!item?.name) return item?.sku ?? "";
    const oldAutoSku = generateSkuFromName(item.name, item.category);
    // If the existing SKU matches the old auto format without brand, upgrade it to include brand if brand is not none
    if (
      item?.sku === oldAutoSku &&
      defaultBrand &&
      defaultBrand.toLowerCase() !== "add-brand-name"
    ) {
      return generateSkuFromName(item.name, item.category, defaultBrand);
    }
    if (item?.sku) return item.sku;
    return generateSkuFromName(item.name, item.category, defaultBrand);
  });
  const [isCustomSku, setIsCustomSku] = useState<boolean>(() => {
    if (!item?.sku) return false;
    const autoWithBrand = generateSkuFromName(
      item.name || "",
      item.category,
      defaultBrand,
    );
    const oldAutoWithoutBrand = generateSkuFromName(
      item.name || "",
      item.category,
    );
    if (item.sku === autoWithBrand || item.sku === oldAutoWithoutBrand) {
      return false;
    }
    return true;
  });
  const [requiresPexcover, setRequiresPexcover] = useState<boolean>(
    item?.requires_pexcover ?? false,
  );
  const [pexcoCode, setPexcoCode] = useState<string>(item?.pexco_code ?? "");
  const [supplierId, setSupplierId] = useState<string>(item?.supplier_id ?? "");
  const [brandsList, setBrandsList] = useState<{ id: string; name: string }[]>([
    { id: "brand-none", name: "Add-Brand-Name" },
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
  ]);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [brandModalError, setBrandModalError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        if (data?.brands && Array.isArray(data.brands) && data.brands.length > 0) {
          const list = [...data.brands];
          if (!list.some((b) => b.name.toLowerCase() === "add-brand-name")) {
            list.unshift({ id: "brand-none", name: "Add-Brand-Name" });
          }
          setBrandsList(list);
        }
      })
      .catch(() => {});
  }, []);

  const handleBrandSelect = (val: string) => {
    if (val === "__ADD_NEW_BRAND__") {
      setNewBrandName("");
      setBrandModalError(null);
      setShowBrandModal(true);
      return;
    }
    setBrand(val);
    if (!isCustomSku && productName.trim()) {
      const newSku = generateSkuFromName(productName, category, val);
      setSku(newSku);
      onSkuChange?.(newSku);
    }
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleBrandSelect(e.target.value);
  };

  const handleCreateBrand = async () => {
    const clean = newBrandName.trim();
    if (!clean || clean.length < 2) {
      setBrandModalError("Brand name must be at least 2 characters.");
      return;
    }
    setIsCreatingBrand(true);
    setBrandModalError(null);
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      if (res.ok) {
        const data = await res.json();
        const created = data.brand || {
          id: `brand-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: clean,
        };
        setBrandsList((prev) => {
          if (prev.some((b) => b.name.toLowerCase() === clean.toLowerCase())) {
            return prev;
          }
          return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
        });
        setBrand(created.name);
        if (!isCustomSku && productName.trim()) {
          const newSku = generateSkuFromName(
            productName,
            category,
            created.name,
          );
          setSku(newSku);
          onSkuChange?.(newSku);
        }
        setShowBrandModal(false);
      } else {
        const fallback = {
          id: `brand-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: clean,
        };
        setBrandsList((prev) =>
          [...prev, fallback].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setBrand(clean);
        if (!isCustomSku && productName.trim()) {
          const newSku = generateSkuFromName(productName, category, clean);
          setSku(newSku);
          onSkuChange?.(newSku);
        }
        setShowBrandModal(false);
      }
    } catch {
      const fallback = {
        id: `brand-${clean.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: clean,
      };
      setBrandsList((prev) =>
        [...prev, fallback].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setBrand(clean);
      if (!isCustomSku && productName.trim()) {
        const newSku = generateSkuFromName(productName, category, clean);
        setSku(newSku);
        onSkuChange?.(newSku);
      }
      setShowBrandModal(false);
    } finally {
      setIsCreatingBrand(false);
    }
  };

  const initialCostValue = masterMode
    ? (item?.unit_cost ?? item?.unit_price ?? "")
    : (item?.unit_price ?? "");
  const [costValue, setCostValue] = useState<string>(
    String(initialCostValue ?? ""),
  );

  const computedSellingPrice = masterMode
    ? computeSellingFromCost(costValue, pricingConfig)
    : null;

  function computeSellingFromCost(
    costRaw: string,
    cfg?: MasterPricingConfig,
  ): number | null {
    const cost = Number(String(costRaw).replace(",", "."));
    if (!Number.isFinite(cost) || cost <= 0) return null;
    const marginPct =
      cfg && cfg.marginPct > 0 && cfg.marginPct < 100 ? cfg.marginPct : 49.9;
    return Math.round(cost * (1 + marginPct / 100) * 100) / 100;
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCostValue(e.target.value);
  };

  useEffect(() => {
    if (state?.ok && state.item) {
      // If the name changed, the slug changes — navigate to the new edit URL
      const newSlug =
        state.item.slug ||
        (state.item.name || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      if (newSlug) {
        router.replace(`/admin/products/${newSlug}/edit`);
      }
      router.refresh();
    }
  }, [state, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProductName(val);
    onNameChange?.(val);
    if (!isCustomSku && val.trim()) {
      const newSku = generateSkuFromName(val, category, brand);
      setSku(newSku);
      onSkuChange?.(newSku);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    onCategoryChange?.(val);
    if (!isCustomSku && productName.trim()) {
      const newSku = generateSkuFromName(productName, val, brand);
      setSku(newSku);
      onSkuChange?.(newSku);
    }
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSku = sanitizeSku(e.target.value);
    setSku(newSku);
    setIsCustomSku(true);
    onSkuChange?.(newSku);
  };

  const handleRegenerateSku = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCustomSku(false);
    const newSku = generateSkuFromName(
      productName.trim() || "Item",
      category,
      brand,
    );
    setSku(newSku);
    onSkuChange?.(newSku);
  };

  return (
    <form action={formAction} className={adminStyles.stack}>
      {/* Banner Alert Messages */}
      {state?.ok ? (
        <DbNotice
          type="success"
          message={
            state.message ||
            `Product "${item?.name || "Item"}" updated successfully.`
          }
        />
      ) : state?.message ? (
        <DbNotice type="error" message={state.message} />
      ) : null}

      <input type="hidden" name="sort_order" value={item?.sort_order ?? 0} />
      <input type="hidden" name="icon" value={icon} />
      <input
        type="hidden"
        name="pack_id"
        value={item?.pack_id ?? packs[0]?.id ?? ""}
      />
      <input
        type="hidden"
        name="save_mode"
        value={isBrandChanged ? saveMode : "auto"}
      />
      {!masterMode && <input type="hidden" name="brand" value={brand} />}

      <div className={adminStyles.detailLayout}>
        {/* ---- LEFT COLUMN ---- */}
        <div className={adminStyles.leftColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <ItemIcon name={icon || "folder"} size={16} />
                <span>Product Metadata &amp; Catalogue Information</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="sku">
                  SKU
                </label>
                <div className="relative flex items-center">
                  <input
                    id="sku"
                    name="sku"
                    className={`${adminStyles.inputField} pr-24 font-mono`}
                    value={sku}
                    onChange={handleSkuChange}
                    placeholder="Auto-generated"
                  />
                  <button
                    type="button"
                    onClick={handleRegenerateSku}
                    data-db-tooltip={
                      isCustomSku
                        ? "Custom SKU (Click to Auto-sync)"
                        : "Auto-synced (Click to Refresh)"
                    }
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      isCustomSku
                        ? "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                    }`}
                  >
                    {isCustomSku ? (
                      <RotateCw size={11} />
                    ) : (
                      <Sparkles size={11} />
                    )}
                    <span>Auto-sync</span>
                  </button>
                </div>
                {state?.errors?.sku && (
                  <span className="text-xs text-rose-400 mt-1 block">{state.errors.sku}</span>
                )}
              </div>
              <div>
                <label className={adminStyles.formLabel} htmlFor="category">
                  Category <span className={adminStyles.muted}>*</span>
                </label>
                <AdminDropdown<string>
                  id="category"
                  name="category"
                  value={category}
                  placeholder="— Select Category —"
                  searchable={true}
                  searchPlaceholder="Search category..."
                  options={MASTER_PRODUCT_CATEGORIES.map((cat) => ({
                    value: cat,
                    label: cat,
                  }))}
                  onChange={(val) => {
                    setCategory(val);
                    onCategoryChange?.(val);
                    if (!isCustomSku && productName.trim()) {
                      const newSku = generateSkuFromName(productName, val, brand);
                      setSku(newSku);
                      onSkuChange?.(newSku);
                    }
                  }}
                />
                {state?.errors?.category && (
                  <span className="text-xs text-rose-400 mt-1 block">
                    {state.errors.category}
                  </span>
                )}
              </div>
            </div>

            {masterMode ? (
              <div className={adminStyles.grid2equal}>
                <div>
                  <label className={adminStyles.formLabel} htmlFor="name">
                    Product Name <span className={adminStyles.muted}>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    className={adminStyles.inputField}
                    value={productName}
                    onChange={handleNameChange}
                    placeholder="e.g. A4 Exercise Book 72pg"
                    required
                  />
                  {state?.errors?.name && (
                    <span className="text-xs text-rose-400 mt-1 block">{state.errors.name}</span>
                  )}
                </div>

                <div>
                  <label className={adminStyles.formLabel} htmlFor="brand">
                    Brand name <span className={adminStyles.muted}>*</span>
                  </label>
                  <AdminDropdown<string>
                    id="brand"
                    name="brand"
                    value={brand}
                    placeholder="— Select Brand —"
                    searchable={true}
                    searchPlaceholder="Search brand by name..."
                    options={brandsList.map((b) => ({
                      value: b.name,
                      label: b.name,
                    }))}
                    onChange={handleBrandSelect}
                    footerAction={{
                      label: "+ Add New Brand...",
                      value: "__ADD_NEW_BRAND__",
                      onClick: () => {
                        setNewBrandName("");
                        setBrandModalError(null);
                        setShowBrandModal(true);
                      },
                    }}
                  />
                  {state?.errors?.brand && (
                    <span className="text-xs text-rose-400 mt-1 block">{state.errors.brand}</span>
                  )}
                  {!item && (
                    <span className="text-[11px] text-slate-400 mt-1 block leading-relaxed">
                      Products with the same name across different brands are stored as separate catalogue products.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className={adminStyles.formField}>
                <div>
                  <label className={adminStyles.formLabel} htmlFor="name">
                    Product Name <span className={adminStyles.muted}>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    className={adminStyles.inputField}
                    value={productName}
                    onChange={handleNameChange}
                    placeholder="e.g. A4 Exercise Book 72pg"
                    required
                  />
                  {state?.errors?.name && (
                    <span className="text-xs text-rose-400 mt-1 block">{state.errors.name}</span>
                  )}
                </div>
              </div>
            )}

            {isBrandChanged && (
              <div className="mt-3.5 p-3.5 bg-emerald-500/10 border border-emerald-500/35 rounded-lg flex flex-col gap-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">Brand Changed</span>
                  <span className="text-xs text-slate-100">
                    <strong>{originalBrand}</strong> &rarr; <strong>{brand}</strong>
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {saveMode === "new_variant" ? (
                    <span>
                      Saving will create a separate <strong>{brand}</strong> product with these details &amp; pricing. The original <strong>{originalBrand}</strong> product will not be overridden.
                    </span>
                  ) : (
                    <span>
                      This will rename the brand on the existing <strong>{originalBrand}</strong> product to <strong>{brand}</strong>.
                    </span>
                  )}
                </div>
                <div className="flex gap-4 flex-wrap mt-0.5 pt-2 border-t border-emerald-500/20">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-100 cursor-pointer">
                    <input
                      type="radio"
                      name="save_mode_selector"
                      value="new_variant"
                      checked={saveMode === "new_variant"}
                      onChange={() => setSaveMode("new_variant")}
                      className="accent-emerald-500 cursor-pointer"
                    />
                    <span>Save as new {brand} product (Preserve {originalBrand})</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-100 cursor-pointer">
                    <input
                      type="radio"
                      name="save_mode_selector"
                      value="update_existing"
                      checked={saveMode === "update_existing"}
                      onChange={() => setSaveMode("update_existing")}
                      className="accent-emerald-500 cursor-pointer"
                    />
                    <span>Rename brand on current product</span>
                  </label>
                </div>
              </div>
            )}

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="description">
                  Description &amp; Specifications
                </label>
                <textarea
                  id="description"
                  name="description"
                  className={adminStyles.textareaField}
                  defaultValue={item?.description ?? ""}
                  placeholder="Product description, material, and specifications..."
                />
                {state?.errors?.description && (
                  <span className="text-xs text-rose-400 mt-1 block">
                    {state.errors.description}
                  </span>
                )}
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div>
                <label
                  className={adminStyles.formLabel}
                  htmlFor="specification"
                >
                  Pack / Unit (e.g. Pack, Box, Each)
                </label>
                <input
                  id="specification"
                  name="specification"
                  className={adminStyles.inputField}
                  defaultValue={item?.specification ?? ""}
                  placeholder="e.g. Pack of 10"
                />
                {state?.errors?.specification && (
                  <span className="text-xs text-rose-400 mt-1 block">
                    {state.errors.specification}
                  </span>
                )}
              </div>
              <div>
                <label className={adminStyles.formLabel} htmlFor="quantity">
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  inputMode="numeric"
                  className={adminStyles.inputField}
                  defaultValue={item?.quantity ?? 1}
                  placeholder="1"
                />
                {state?.errors?.quantity && (
                  <span className="text-xs text-rose-400 mt-1 block">
                    {state.errors.quantity}
                  </span>
                )}
              </div>
            </div>

            {/* Pexcover Classification */}
            <div className={adminStyles.formField}>
              <div>
                <span className={adminStyles.formLabel}>
                  📚 Pexcover™ Book-Covering Classification
                </span>
                <p className={adminStyles.muted}>
                  Enable if this product is a book or exercise book that
                  requires covering. The PEXCO code selects the covering
                  classification.
                </p>
                <label
                  className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200"
                  htmlFor="requires_pexcover"
                >
                  <input
                    id="requires_pexcover"
                    type="checkbox"
                    name="requires_pexcover"
                    checked={requiresPexcover}
                    onChange={(e) => {
                      setRequiresPexcover(e.target.checked);
                      if (!e.target.checked) setPexcoCode("");
                    }}
                    className={adminStyles.checkbox}
                  />
                  Requires Pexcover™ covering
                </label>
                {requiresPexcover && (
                  <div className={adminStyles.formField}>
                    <div>
                      <input
                        type="hidden"
                        name="pexco_code"
                        value={pexcoCode}
                      />
                      <label
                        className={adminStyles.formLabel}
                        htmlFor="pexco_code_select"
                      >
                        PEXCO Classification Code
                      </label>
                      <select
                        id="pexco_code_select"
                        className={adminStyles.selectField}
                        value={pexcoCode}
                        onChange={(e) => setPexcoCode(e.target.value)}
                        aria-label="PEXCO classification code"
                      >
                        <option value="">— Select PEXCO Code —</option>
                        {PEXCO_CLASSIFICATIONS.map((classification) => (
                          <option
                            key={classification.code}
                            value={classification.code}
                          >
                            {classification.code} — {classification.label}
                          </option>
                        ))}
                      </select>
                      {state?.errors?.pexco_code && (
                        <span className="text-xs text-rose-400 mt-1 block">
                          {state.errors.pexco_code}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Icon Picker (for all stationery products and pack items) */}
            <div className={adminStyles.formField}>
              <div>
                <span className={adminStyles.formLabel}>Item Icon Symbol</span>
                <div className={adminStyles.stackRow}>
                  {icon ? (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/15 text-emerald-400 rounded-md text-xs font-semibold border border-emerald-500/30">
                      <ItemIcon name={icon} size={16} />
                      <span>Selected: {icon}</span>
                    </div>
                  ) : (
                    <span className={adminStyles.muted}>
                      No icon selected (auto fallback used)
                    </span>
                  )}
                </div>
                <div
                  className="flex flex-wrap gap-2 mt-2"
                  role="group"
                  aria-label="Pick an icon"
                >
                  {PACK_ITEM_ICONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors cursor-pointer ${
                        icon === option.key
                          ? "!border-emerald-500 !bg-emerald-500/20 !text-emerald-300"
                          : "border-slate-700/60 bg-slate-800 text-slate-300 hover:border-slate-500 hover:text-white"
                      }`}
                      onClick={() =>
                        setIcon(icon === option.key ? "" : option.key)
                      }
                      data-db-tooltip={option.label}
                      aria-pressed={icon === option.key}
                    >
                      <ItemIcon name={option.key} size={20} />
                    </button>
                  ))}
                </div>
                <span className={adminStyles.muted}>
                  Stationery item emblem displayed alongside the product across
                  catalogues, packs, and checkouts.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- RIGHT / SIDEBAR COLUMN ---- */}
        <aside className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Package size={16} className={adminStyles.iconTeal} />
                <span>Pricing &amp; Availability</span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="price">
                  {masterMode ? "Cost Price (R)" : "Selling Price (R)"}
                </label>
                <input
                  id="price"
                  name="price"
                  inputMode="decimal"
                  className={adminStyles.inputField}
                  defaultValue={
                    masterMode ? undefined : (item?.unit_price ?? "")
                  }
                  value={masterMode ? costValue : undefined}
                  onChange={masterMode ? handlePriceChange : undefined}
                  placeholder="0.00"
                />
                {state?.errors?.price && (
                  <span className="text-xs text-rose-400 mt-1 block">
                    {state.errors.price}
                  </span>
                )}
                {masterMode && (
                  <div
                    className="mt-2 p-2.5 bg-slate-900 border border-slate-700/60 rounded-lg flex flex-col gap-1"
                    data-testid="selling-preview"
                  >
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Calculated Selling Price
                    </span>
                    <span className="text-base font-bold text-emerald-400">
                      {computedSellingPrice != null
                        ? `R ${computedSellingPrice.toFixed(2)}`
                        : "—"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      = Cost + Target Margin (auto)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className={adminStyles.formLabel} htmlFor="supplier_id">
                  Supplier (Cost Price Source)
                </label>
                <select
                  id="supplier_id"
                  name="supplier_id"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className={adminStyles.selectField}
                  aria-label="Supplier whose cost price is used"
                >
                  <option value="">
                    — Select Supplier (Cost Price Source) —
                  </option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} {sup.code ? `(${sup.code})` : ""}
                    </option>
                  ))}
                </select>
                <span className={adminStyles.muted}>
                  Select the supplier whose cost price is used for this product.
                </span>
              </div>
            </div>

            <div className={adminStyles.formField}>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200" htmlFor="visible">
                  <input
                    id="visible"
                    type="checkbox"
                    name="visible"
                    defaultChecked={item?.visible ?? true}
                    className={adminStyles.checkbox}
                  />
                  Visible on Public Catalogue
                </label>
              </div>
            </div>

            <div className={adminStyles.stackRow}>
              <AdminButton href={returnTo} variant="secondary" size="md">
                Cancel
              </AdminButton>
              <SubmitButton
                label={
                  masterMode && isBrandChanged
                    ? saveMode === "new_variant"
                      ? `Save as ${brand} product`
                      : "Update product"
                    : submitLabel
                }
              />
            </div>
          </div>

          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Store size={16} className={adminStyles.iconBlue} />
                <span>Product Type</span>
              </div>
            </div>
            <div className={adminStyles.stack}>
              <span className={adminStyles.muted}>
                {masterMode
                  ? "Master catalogue product — reusable across school packs."
                  : "Pack-specific item."}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Brand Creation Modal */}
      {showBrandModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="brand-modal-heading"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            backgroundColor: "rgba(11, 17, 30, 0.85)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              borderRadius: "12px",
              backgroundColor: "var(--a-surface, #0f172a)",
              border: "1px solid var(--a-border, rgba(30, 41, 59, 0.9))",
              padding: "24px",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
              color: "var(--a-text, #ffffff)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                borderBottom:
                  "1px solid var(--a-border, rgba(30, 41, 59, 0.6))",
                paddingBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Tag size={16} style={{ color: "#10b981" }} />
                <h3
                  id="brand-modal-heading"
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  Add New Brand
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBrandModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "4px",
                }}
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className={adminStyles.formLabel} htmlFor="new-brand-name">
                Brand Name <span className={adminStyles.muted}>*</span>
              </label>
              <input
                id="new-brand-name"
                className={adminStyles.inputField}
                value={newBrandName}
                onChange={(e) => {
                  setNewBrandName(e.target.value);
                  if (brandModalError) setBrandModalError(null);
                }}
                placeholder="e.g. Treeline, Artline, Dala..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleCreateBrand();
                  }
                }}
              />
              {brandModalError && (
                <span className="text-xs text-rose-400 mt-1.5 block">
                  {brandModalError}
                </span>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                paddingTop: "12px",
                borderTop: "1px solid var(--a-border, rgba(30, 41, 59, 0.6))",
              }}
            >
              <button
                type="button"
                className={adminStyles.secondaryButton}
                onClick={() => setShowBrandModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={adminStyles.primaryButton}
                onClick={handleCreateBrand}
                disabled={isCreatingBrand}
              >
                {isCreatingBrand ? "Creating..." : "Create & Select Brand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
