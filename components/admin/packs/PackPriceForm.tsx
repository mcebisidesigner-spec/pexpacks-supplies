"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { PackFormState } from "@/lib/admin/packs";
import { updatePackPriceAction } from "@/app/admin/packs/actions";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "../schools/SchoolForm.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save price"}
    </button>
  );
}

interface PackPriceFormProps {
  packId: string;
  price: number;
  subtotal?: number | null;
}

export function PackPriceForm({ packId, price, subtotal }: PackPriceFormProps) {
  const action = updatePackPriceAction.bind(null, packId);
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });
  const [value, setValue] = useState<string>(price > 0 ? String(price) : "0");

  const suggested = subtotal != null ? Math.round(subtotal * 100) / 100 : null;
  const differs =
    suggested != null && Math.abs(suggested - price) > 0.01;

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Total price</h2>
        {state?.ok ? (
          <p className={styles.success} role="status">
            {state.message}
          </p>
        ) : state?.errors?.price ? (
          <p className={styles.error} role="alert">
            {state.errors.price}
          </p>
        ) : null}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">
            Price (R)
          </label>
          <input
            id="price"
            name="price"
            className={styles.input}
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          {suggested != null ? (
            <div className={styles.hintRow}>
              <span className={styles.hint}>
                Items subtotal: {formatCurrency(suggested)}. Shown as
                &ldquo;From {formatCurrency(price)}&rdquo; on the public pack
                card. Saving updates the live school pages immediately.
              </span>
              {differs ? (
                <button
                  type="button"
                  className={styles.useTotalButton}
                  onClick={() => setValue(String(suggested))}
                >
                  Use items total
                </button>
              ) : null}
            </div>
          ) : (
            <span className={styles.hint}>
              Shown as &ldquo;From {formatCurrency(price)}&rdquo; on the public
              pack card. Saving updates the live school pages immediately.
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
