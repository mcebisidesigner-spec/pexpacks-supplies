"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import type { PackFormState } from "@/lib/admin/packs";
import { updatePackPriceAction } from "@/app/admin/packs/actions";
import editStyles from "./EditPack.module.css";
import coreStyles from "@/components/admin/views/CorePagesView.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={coreStyles.primaryBtn} disabled={pending}>
      <Save size={14} /> {pending ? "Saving..." : "Save price"}
    </button>
  );
}

interface PackPriceFormProps {
  packId: string;
  price: number;
  itemCount: number;
  subtotal?: number | null;
  schoolName?: string;
  packTitle?: string;
}

export function PackPriceForm({
  packId,
  price,
  itemCount,
  subtotal,
  schoolName,
  packTitle,
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
      ? ((price - subtotal) / subtotal * 100).toFixed(1)
      : null;

  useEffect(() => {
    setValue(String(targetPrice));
  }, [targetPrice]);

  return (
    <div className={coreStyles.tableCard}>
      <form action={formAction}>
        <input type="hidden" name="price" value={value} readOnly />
        <div className={editStyles.priceHeader}>
          <div>
            <div className={editStyles.priceLabel}>Set Pack Price</div>
            <div className={editStyles.priceSub}>
              {itemCount} {itemCount === 1 ? "item" : "items"} &middot; subtotal {subtotal != null ? `R ${subtotal.toFixed(2)}` : "—"}
            </div>
          </div>
          <SubmitButton />
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

        {margin != null && (
          <div className={editStyles.marginRow}>
            <span className={editStyles.marginLabel}>Margin:</span>
            <span
              className={editStyles.marginValue}
              style={{
                color:
                  Number(margin) < 10
                    ? "#f87171"
                    : Number(margin) < 20
                    ? "#facc15"
                    : "#34d399",
              }}
            >
              {margin}%
            </span>
          </div>
        )}

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
