"use client";

import { useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { updatePackPriceAction } from "@/app/admin/packs/actions";
import type { PackFormState } from "@/lib/admin/packs";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "./SchoolPackCreateForm.module.css";

const GRADES = [
  "Grade R",
  ...Array.from({ length: 12 }, (_, index) => `Grade ${index + 1}`),
];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <AdminButton
      type="submit"
      variant="primary"
      size="md"
      loading={pending}
      icon={<Save size={14} />}
    >
      Save price
    </AdminButton>
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
  schoolName,
  packTitle = "",
  showSubmit = false,
  title = "Set Pack Grade & Items",
  children,
}: PackPriceFormProps) {
  const action = updatePackPriceAction.bind(null, packId);
  const [state, formAction] = useActionState<PackFormState, FormData>(action, {
    ok: false,
  });

  const initialGrade = useMemo(() => {
    const match = packTitle.match(/grade\s*([r\d]+)/i);
    if (match) {
      const val = match[1].toUpperCase();
      return val === "R" ? "Grade R" : `Grade ${val}`;
    }
    return "Grade R";
  }, [packTitle]);

  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const suggested = subtotal != null ? Math.round(subtotal * 100) / 100 : null;
  const targetPrice = suggested ?? price;
  const [value, setValue] = useState<string>(String(targetPrice));

  useEffect(() => {
    setValue(String(targetPrice));
  }, [targetPrice]);

  return (
    <div className={`${adminStyles.tableCard} ${styles.priceCard}`}>
      <form id={formId} action={formAction}>
        <input type="hidden" name="price" value={value} readOnly />
        <div className={styles.priceHeader}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <h2 className={styles.cardTitle}>{title}</h2>
            {showSubmit ? <SubmitButton /> : null}
          </div>
        </div>

        <div className={styles.priceControls}>
          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Select Grade *</span>
            <select
              name="grade"
              value={selectedGrade}
              onChange={(event) => setSelectedGrade(event.target.value)}
              className={styles.fieldSelect}
            >
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>

          <div className={`${styles.fieldGroup} ${styles.itemSearchGroup}`}>
            <span className={styles.fieldLabel}>Add Stationery Items</span>
            {children}
          </div>
        </div>

        {state?.ok ? (
          <div className={adminStyles.success} role="status">
            {state.message}
          </div>
        ) : state?.errors?.price ? (
          <div className={adminStyles.error} role="alert">
            {state.errors.price}
          </div>
        ) : null}
      </form>
    </div>
  );
}
