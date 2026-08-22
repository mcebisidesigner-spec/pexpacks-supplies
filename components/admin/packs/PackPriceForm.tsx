"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { updatePackPriceAction } from "@/app/admin/packs/actions";
import type { PackFormState } from "@/lib/admin/packs";
import coreStyles from "@/components/admin/views/CorePagesView.module.css";
import editStyles from "./EditPack.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={coreStyles.primaryBtn} disabled={pending}>
      <Save size={14} /> {pending ? "Saving..." : "Save price"}
    </button>
  );
}

interface PackPriceFormProps {
  formId?: string;
  packId: string;
  price: number;
  itemCount: number;
  subtotal?: number | null;
  schoolName?: string;
  packTitle?: string;
  showSubmit?: boolean;
  title?: string;
  children?: ReactNode;
}

export function PackPriceForm({
  formId,
  packId,
  price,
  itemCount,
  subtotal,
  showSubmit = true,
  title = "Set Pack Price",
  children,
}: PackPriceFormProps) {
  const action = updatePackPriceAction.bind(null, packId);
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });

  const suggested = subtotal != null ? Math.round(subtotal * 100) / 100 : null;
  const targetPrice = suggested ?? price;
  const [value, setValue] = useState<string>(String(targetPrice));

  const margin =
    subtotal != null && subtotal > 0
      ? (((price - subtotal) / subtotal) * 100).toFixed(1)
      : null;
  const marginNumber = margin == null ? null : Number(margin);
  const marginTone =
    marginNumber == null
      ? ""
      : marginNumber < 10
        ? editStyles.marginDanger
        : marginNumber < 20
          ? editStyles.marginWarning
          : editStyles.marginPositive;

  useEffect(() => {
    setValue(String(targetPrice));
  }, [targetPrice]);

  return (
    <div className={coreStyles.tableCard}>
      <form id={formId} action={formAction}>
        <input type="hidden" name="price" value={value} readOnly />
        <div className={editStyles.priceHeader}>
          <div>
            <div className={editStyles.priceLabel}>{title}</div>
            <div className={editStyles.priceSub}>
              {itemCount} {itemCount === 1 ? "item" : "items"} - subtotal{" "}
              {subtotal != null ? `R ${subtotal.toFixed(2)}` : "-"}
            </div>
          </div>
          {showSubmit ? <SubmitButton /> : null}
        </div>

        <div className={editStyles.priceInputRow}>
          <span className={editStyles.currencyPrefix}>R</span>
          <input
            type="number"
            step="0.01"
            min="0"
            className={editStyles.priceInput}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {suggested != null && price !== suggested && (
            <button
              type="button"
              className={editStyles.useSubtotalBtn}
              onClick={() => setValue(String(suggested))}
            >
              Use subtotal
            </button>
          )}
        </div>

        {children ? (
          <div className={editStyles.inlineItemsSlot}>{children}</div>
        ) : null}

        {state?.ok ? (
          <div className={coreStyles.success} role="status">
            {state.message}
          </div>
        ) : state?.errors?.price ? (
          <div className={coreStyles.error} role="alert">
            {state.errors.price}
          </div>
        ) : null}
      </form>
    </div>
  );
}
