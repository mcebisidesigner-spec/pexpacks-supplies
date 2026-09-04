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
import { DbNotice } from "@/components/admin/ui/DbNotice";

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
  subtotal,
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
  const targetPrice =
    price > 0 ? price : subtotal != null ? Math.round(subtotal * 100) / 100 : 0;
  const [value, setValue] = useState<string>(String(targetPrice));

  useEffect(() => {
    setValue(String(targetPrice));
  }, [targetPrice]);

  return (
    <div className={adminStyles.sidebarCard}>
      <form id={formId} action={formAction}>
        <input type="hidden" name="recalculate" value="true" />
        <input type="hidden" name="price" value={value} readOnly />
        <div className={adminStyles.sidebarCardHeader}>
          <span className={adminStyles.sidebarHeaderTitle}>{title}</span>
          {showSubmit ? <SubmitButton /> : null}
        </div>

        <div className={adminStyles.formField}>
          <div>
            <label className={adminStyles.formLabel}>Select Grade *</label>
            <select
              name="grade"
              value={selectedGrade}
              onChange={(event) => setSelectedGrade(event.target.value)}
              className={adminStyles.selectField}
            >
              {GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={adminStyles.formField}>
          <span className={adminStyles.formLabel}>Add Stationery Items</span>
          {children}
        </div>

        {state?.ok ? (
          <DbNotice
            type="success"
            message={state.message || "Price updated successfully."}
          />
        ) : state?.errors?.price ? (
          <DbNotice type="error" message={state.errors.price} />
        ) : null}
      </form>
    </div>
  );
}
