"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { RotateCw, Sparkles } from "lucide-react";
import type { ItemFormState, ItemRow } from "@/lib/admin/items";
import { createItemAction, updateItemAction } from "@/app/admin/items/actions";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { PACK_ITEM_ICONS, isPackItemIconKey } from "@/lib/packs/itemIcons";
import { generateSkuFromName, sanitizeSku } from "@/lib/sku-generator";
import adminStyles from "@/app/admin/admin.module.css";
import formStyles from "../schools/SchoolForm.module.css";
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
    <button type="submit" className={formStyles.saveButton} disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
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
  const [icon, setIcon] = useState<string>(
    item?.icon && isPackItemIconKey(item.icon) ? item.icon : ""
  );

  const [productName, setProductName] = useState<string>(item?.name ?? "");
  const [category, setCategory] = useState<string>(item?.category ?? "Stationery");
  const [sku, setSku] = useState<string>(
    item?.sku ?? (item?.name ? generateSkuFromName(item.name, item.category) : "")
  );
  const [isCustomSku, setIsCustomSku] = useState<boolean>(Boolean(item?.sku));

  useEffect(() => {
    if (state?.ok) {
      const timer = setTimeout(() => {
        router.push(returnTo);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state, router, returnTo]);

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

  const handleRegenerateSku = () => {
    setIsCustomSku(false);
    const newSku = generateSkuFromName(productName.trim() || "Item", category);
    setSku(newSku);
  };

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={formStyles.error} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  return (
    <form action={formAction} className={formStyles.form}>
      {/* Banner Alert Messages */}
      {state?.ok ? (
        <div
          className={`${adminStyles.badgeGreen} ${adminStyles.p12} ${adminStyles.text13} ${adminStyles.block}`}
          style={{ marginBottom: "16px", borderRadius: "8px", width: "100%" }}
          role="status"
        >
          &#x2713; {state.message || `Product "${item?.name || "Item"}" updated.`}
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

      <div className={formStyles.section}>
        <input type="hidden" name="pack_id" value={item?.pack_id ?? packs[0]?.id ?? ""} />

        {/* Row 1: SKU & Category */}
        <div className={styles.formGrid}>
          <div className={formStyles.field}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className={formStyles.label} htmlFor="sku" style={{ margin: 0 }}>
                SKU
              </label>
              <button
                type="button"
                onClick={handleRegenerateSku}
                title={isCustomSku ? "Locked SKU (Click to Auto-generate from Name)" : "Auto-generated SKU (Click to Refresh)"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "5px",
                  border: isCustomSku ? "1px solid rgba(234, 179, 8, 0.35)" : "1px solid rgba(16, 185, 129, 0.35)",
                  background: isCustomSku ? "rgba(234, 179, 8, 0.08)" : "rgba(16, 185, 129, 0.08)",
                  color: isCustomSku ? "#facc15" : "#10b981",
                  cursor: "pointer",
                }}
              >
                {isCustomSku ? <RotateCw size={11} /> : <Sparkles size={11} />}
                <span>{isCustomSku ? "Auto-generate" : "Auto-sync"}</span>
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                id="sku"
                name="sku"
                className={formStyles.input}
                value={sku}
                onChange={handleSkuChange}
                placeholder="e.g. PEX-WRT-00101"
              />
            </div>
            <span className={formStyles.hint}>
              {isCustomSku
                ? "Manual SKU lock active. Click Auto-generate to re-sync with product name."
                : "Standardized SKU auto-generated from Category and Item name."}
            </span>
            {err("sku")}
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="category">
              Category
            </label>
            <input
              id="category"
              name="category"
              className={formStyles.input}
              value={category}
              onChange={handleCategoryChange}
              placeholder="e.g. Stationery, Books, Art & Craft"
            />
            {err("category")}
          </div>
        </div>

        {/* Row 2: Item Name */}
        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="name">
            Item name *
          </label>
          <input
            id="name"
            name="name"
            className={formStyles.input}
            value={productName}
            onChange={handleNameChange}
            placeholder="e.g. A4 Clear Plastic Folders with Button"
            required
          />
          {err("name")}
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className={formStyles.textarea}
            rows={3}
            defaultValue={item?.description ?? ""}
            placeholder="e.g. Assorted colours or approved school brand details"
          />
          {err("description")}
        </div>

        {/* Row 2: Pack / Unit & Qty */}
        <div className={styles.formGrid}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="specification">
              Pack / Unit
            </label>
            <input
              id="specification"
              name="specification"
              className={formStyles.input}
              defaultValue={item?.specification ?? ""}
              placeholder="e.g. Pack"
            />
            {err("specification")}
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="quantity">
              Qty
            </label>
            <input
              id="quantity"
              name="quantity"
              className={formStyles.input}
              inputMode="numeric"
              defaultValue={item?.quantity ?? 1}
              placeholder="1"
            />
            <span className={formStyles.hint}>
              Quantity of this item.
            </span>
            {err("quantity")}
          </div>
        </div>

        {/* Row 3: Price & Visible on site */}
        <div className={styles.formGrid}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="price">
              Price (R)
            </label>
            <input
              id="price"
              name="price"
              className={formStyles.input}
              inputMode="decimal"
              defaultValue={item?.unit_price ?? ""}
              placeholder="0.00"
            />
            <span className={formStyles.hint}>
              Price of the item. Leave blank for no price.
            </span>
            {err("price")}
          </div>

          <div className={styles.checkboxCell}>
            <label className={formStyles.checkbox}>
              <input
                type="checkbox"
                name="visible"
                defaultChecked={item?.visible ?? true}
              />
              Visible on site
            </label>
          </div>
        </div>

        {/* Icon Picker Section */}
        <div className={styles.iconField}>
          <label className={formStyles.label}>Icon</label>
          <div className={styles.iconPicker} role="group" aria-label="Pick an icon">
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
                <ItemIcon name={option.key} size={22} />
              </button>
            ))}
          </div>
          <span className={formStyles.hint}>
            Optional. Shown next to the item on the public pack list.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={formStyles.actions}>
        <Link href={returnTo} className={formStyles.cancelButton}>
          Cancel
        </Link>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
