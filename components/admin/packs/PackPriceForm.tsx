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
  schoolName?: string;
  packTitle?: string;
}

export function PackPriceForm({ packId, price, subtotal, schoolName, packTitle }: PackPriceFormProps) {
  const action = updatePackPriceAction.bind(null, packId);
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });
  const [value, setValue] = useState<string>(price > 0 ? String(price) : "0");

  const suggested = subtotal != null ? Math.round(subtotal * 100) / 100 : null;
  const differs =
    suggested != null && Math.abs(suggested - price) > 0.01;

  const fullTitle = schoolName
    ? `${schoolName} ${packTitle || ""}`
    : packTitle || "";

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.headerRow} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "8px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--admin-text, #ffffff)", margin: 0, letterSpacing: "-0.02em" }}>
            Edit pack
          </h1>
          <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--admin-text-3, #94a3b8)", margin: "4px 0 0" }}>
            {fullTitle}
          </p>
        </div>
        <SubmitButton />
      </div>

      <div className={styles.section} style={{ background: "var(--admin-surface, #0f172a)", border: "1px solid var(--admin-border, #1e293b)", borderRadius: "16px", padding: "24px" }}>
        <h2 className={styles.sectionTitle} style={{ fontSize: "12px", fontWeight: 800, color: "var(--admin-text-3, #94a3b8)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
          TOTAL PRICE
        </h2>
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
          <label className={styles.label} htmlFor="price" style={{ fontSize: "12px", fontWeight: 600, color: "var(--admin-text-2, #cbd5e1)", marginBottom: "6px", display: "block" }}>
            Price (R)
          </label>
          <input
            id="price"
            name="price"
            className={styles.input}
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={{ width: "100%", height: "48px", background: "rgba(2, 6, 23, 0.5)", border: "1px solid var(--admin-border-strong, #334155)", borderRadius: "10px", padding: "0 16px", color: "#ffffff", fontSize: "16px", fontWeight: 600 }}
            required
          />
          {suggested != null ? (
            <div className={styles.hintRow} style={{ marginTop: "10px" }}>
              <span className={styles.hint} style={{ fontSize: "12px", color: "var(--admin-text-3, #94a3b8)", lineHeight: 1.5 }}>
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
            <span className={styles.hint} style={{ fontSize: "12px", color: "var(--admin-text-3, #94a3b8)", marginTop: "10px", display: "block" }}>
              Shown as &ldquo;From {formatCurrency(price)}&rdquo; on the public
              pack card. Saving updates the live school pages immediately.
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
