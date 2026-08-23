"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { ItemFormState, ItemRow } from "@/lib/admin/items";
import { createItemAction, updateItemAction } from "@/app/admin/items/actions";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { PACK_ITEM_ICONS, isPackItemIconKey } from "@/lib/packs/itemIcons";
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

  useEffect(() => {
    if (state?.ok) router.push(returnTo);
  }, [state, router, returnTo]);

  const err = (field: string) =>
    state?.errors?.[field] ? (
      <span className={formStyles.error} role="alert">
        {state.errors[field]}
      </span>
    ) : null;

  return (
    <form action={formAction} className={formStyles.form}>
      {state?.ok ? (
        <p className={formStyles.success} role="status">
          Item saved.
        </p>
      ) : state?.message ? (
        <p className={formStyles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <input type="hidden" name="sort_order" value={item?.sort_order ?? 0} />
      <input type="hidden" name="icon" value={icon} />

      <div className={formStyles.section}>
        <input type="hidden" name="pack_id" value={item?.pack_id ?? packs[0]?.id ?? ""} />

        {/* Row 1: Item code & ITEM NAME */}
        <div className={styles.formGrid}>
          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="category">
              Category
            </label>
            <input
              id="category"
              name="category"
              className={formStyles.input}
              defaultValue={item?.category ?? "Stationery"}
              placeholder="e.g. Stationery, Books, Art & Craft"
            />
            {err("category")}
          </div>

          <div className={formStyles.field}>
            <label className={formStyles.label} htmlFor="name">
              Item name *
            </label>
            <input
              id="name"
              name="name"
              className={formStyles.input}
              defaultValue={item?.name ?? ""}
              placeholder="e.g. A4 Clear Plastic Folders with Button"
              required
            />
            {err("name")}
          </div>
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
