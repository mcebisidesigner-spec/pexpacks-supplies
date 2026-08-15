"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { PackFormState } from "@/lib/admin/packs";
import { updatePackPriceAction } from "@/app/admin/packs/actions";
import styles from "./EditPack.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving..." : "Save pack"}
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

  const suggested = subtotal != null ? Math.round(subtotal * 100) / 100 : null;
  const targetPrice = suggested ?? price;
  const [value, setValue] = useState<string>(String(targetPrice));

  const fullTitle = schoolName
    ? `${schoolName} ${packTitle || ""}`
    : packTitle || "";

  useEffect(() => {
    setValue(String(targetPrice));
  }, [targetPrice]);

  return (
    <form action={formAction} className={styles.priceForm}>
      <input type="hidden" name="price" value={value} readOnly />
      <div className={styles.heroRow}>
        <div>
          <h1 className={styles.title}>Edit pack</h1>
          <p className={styles.subtitle}>{fullTitle}</p>
        </div>
        <SubmitButton />
      </div>
      {state?.ok ? (
        <p className={styles.success} role="status">
          {state.message}
        </p>
      ) : state?.errors?.price ? (
        <p className={styles.error} role="alert">
          {state.errors.price}
        </p>
      ) : null}
    </form>
  );
}
