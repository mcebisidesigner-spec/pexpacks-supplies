"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { RotateCw, Save, Sparkles } from "lucide-react";
import type { ItemFormState, ItemRow } from "@/lib/admin/items";
import { createItemAction, updateItemAction } from "@/app/admin/items/actions";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { PACK_ITEM_ICONS, isPackItemIconKey } from "@/lib/packs/itemIcons";
import { inferIcon } from "@/lib/packs/normalisePackItems";
import { generateSkuFromName, sanitizeSku } from "@/lib/sku-generator";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "./ItemForm.module.css";

interface ItemFormProps {
  item: ItemRow | null;
  packs: { id: string; title: string }[];
  returnTo?: string;
  submitLabel?: string;
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
}: ItemFormProps) {
  const router = useRouter();
  const action =
    item == null ? createItemAction : updateItemAction.bind(null, item.id);
  const [state, formAction] = useActionState<ItemFormState, FormData>(action, {
    ok: false,
  });
  const [icon, setIcon] = useState<string>(() => {
    if (item?.icon && isPackItemIconKey(item.icon) && item.icon !== "box" && item.icon !== "package") {
      return item.icon;
    }
    if (item?.name) {
      const inferred = inferIcon(item.name);
      if (inferred && isPackItemIconKey(inferred)) return inferred;
    }
    return "folder";
  });

  const [productName, setProductName] = useState<string>(item?.name ?? "");
  const [category, setCategory] = useState<string>(item?.category ?? "Stationery");
  const [sku, setSku] = useState<string>(
    item?.sku ?? (item?.name ? generateSkuFromName(item.name, item.category) : "")
  );
  const [isCustomSku, setIsCustomSku] = useState<boolean>(Boolean(item?.sku));

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setProductName(val);
    if (!isCustomSku && val.trim()) {
      setSku(generateSkuFromName(val, category));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCategory(val);
    if (!isCustomSku && productName.trim()) {
      setSku(generateSkuFromName(productName, val));
    }
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSku(sanitizeSku(e.target.value));
    setIsCustomSku(true);
  };

  const handleRegenerateSku = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCustomSku(false);
    const newSku = generateSkuFromName(productName.trim() || "Item", category);
    setSku(newSku);
  };

  return (
    <form action={formAction} className={styles.container}>
      {/* Banner Alert Messages */}
      {state?.ok ? (
        <div
          className={`${adminStyles.badgeGreen} ${adminStyles.p12} ${adminStyles.text13} ${adminStyles.block}`}
          style={{ marginBottom: "16px", borderRadius: "8px", width: "100%" }}
          role="status"
        >
          &#x2713; {state.message || `Product "${item?.name || "Item"}" updated successfully.`}
        </div>
      ) : state?.message ? (
        <div
          className={`${adminStyles.badgeRed} ${adminStyles.p12} ${adminStyles.text13} ${adminStyles.block} ${adminStyles.cRed}`}
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            marginBottom: "16px",
            borderRadius: "8px",
            width: "100%",
          }}
          role="alert"
        >
          &#x26A0; {state.message}
        </div>
      ) : null}

      <input type="hidden" name="sort_order" value={item?.sort_order ?? 0} />
      <input type="hidden" name="icon" value={icon} />
      <input type="hidden" name="pack_id" value={item?.pack_id ?? packs[0]?.id ?? ""} />

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={adminStyles.sectionIconTeal}>
            <ItemIcon name={icon || "folder"} size={16} />
          </div>
          <span>Product Metadata &amp; Catalogue Information</span>
        </div>

        {/* Row 1: SKU & Category */}
        <div className={styles.grid2}>
          <FloatingInput
            id="sku"
            name="sku"
            label="SKU"
            value={sku}
            className={styles.skuInput}
            onChange={handleSkuChange}
            error={state?.errors?.sku}
            rightAdornment={
              <button
                type="button"
                onClick={handleRegenerateSku}
                title={isCustomSku ? "Custom SKU (Click to Auto-sync)" : "Auto-synced (Click to Refresh)"}
                className={`${styles.skuButtonAdornment} ${isCustomSku ? styles.skuButtonLocked : ""}`}
              >
                {isCustomSku ? <RotateCw size={11} /> : <Sparkles size={11} />}
                <span>{isCustomSku ? "Auto-sync" : "Auto-sync"}</span>
              </button>
            }
          />

          <FloatingInput
            id="category"
            name="category"
            label="Category"
            value={category}
            onChange={handleCategoryChange}
            error={state?.errors?.category}
          />
        </div>

        {/* Row 2: Item Name */}
        <FloatingInput
          id="name"
          name="name"
          label="Item Name"
          value={productName}
          onChange={handleNameChange}
          required
          error={state?.errors?.name}
        />

        {/* Row 3: Description */}
        <FloatingTextarea
          id="description"
          name="description"
          label="Description &amp; Specifications"
          defaultValue={item?.description ?? ""}
          error={state?.errors?.description}
        />

        {/* Row 4: Pack / Unit & Qty */}
        <div className={styles.grid2}>
          <FloatingInput
            id="specification"
            name="specification"
            label="Pack / Unit (e.g. Pack, Box, Each)"
            defaultValue={item?.specification ?? ""}
            error={state?.errors?.specification}
          />

          <FloatingInput
            id="quantity"
            name="quantity"
            inputMode="numeric"
            label="Quantity"
            defaultValue={item?.quantity ?? 1}
            error={state?.errors?.quantity}
          />
        </div>

        {/* Row 5: Price & Visibility */}
        <div className={styles.grid2}>
          <FloatingInput
            id="price"
            name="price"
            inputMode="decimal"
            label="Selling Price (R)"
            defaultValue={item?.unit_price ?? ""}
            error={state?.errors?.price}
          />

          <div className={styles.checkboxCell}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="visible"
                defaultChecked={item?.visible ?? true}
                className={adminStyles.checkbox}
              />
              Visible on Public Catalogue
            </label>
          </div>
        </div>

        {/* Icon Picker Section */}
        <div className={styles.iconSection}>
          <div className={styles.iconHeaderRow}>
            <span className={styles.iconLabel}>Item Icon Symbol</span>
            {icon ? (
              <div className={styles.iconSelectedPreview}>
                <ItemIcon name={icon} size={16} />
                <span>Selected: {icon}</span>
              </div>
            ) : (
              <span className={styles.hint}>No icon selected (auto fallback used)</span>
            )}
          </div>

          <div className={styles.iconGrid} role="group" aria-label="Pick an icon">
            {PACK_ITEM_ICONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`${styles.iconOption} ${
                  icon === option.key ? styles.iconOptionActive : ""
                }`}
                onClick={() => setIcon(icon === option.key ? "" : option.key)}
                title={option.label}
                aria-pressed={icon === option.key}
              >
                <ItemIcon name={option.key} size={20} />
              </button>
            ))}
          </div>
          <span className={styles.hint}>
            Optional item emblem displayed alongside the product on school pack checkouts.
          </span>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsRow}>
          <AdminButton href={returnTo} variant="secondary" size="md">
            Cancel
          </AdminButton>
          <SubmitButton label={submitLabel} />
        </div>
      </div>
    </form>
  );
}
