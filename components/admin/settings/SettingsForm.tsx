"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateSettingsAction } from "@/app/admin/settings/actions";
import type { SettingField, SettingFormState, SettingSection } from "@/lib/admin/settings";
import styles from "./settings-form.module.css";
import { DbNotice } from "@/components/admin/ui/DbNotice";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

export function SettingsForm({
  section,
  values,
}: {
  section: SettingSection;
  values: Record<string, unknown>;
}) {
  const [state, formAction] = useActionState<SettingFormState, FormData>(
    updateSettingsAction.bind(null, section.key),
    {}
  );

  return (
    <form action={formAction} className={styles.form}>
      {state?.ok ? (
        <DbNotice
          type="success"
          message={state.message || "Settings saved."}
        />
      ) : state?.message ? (
        <DbNotice
          type="error"
          message={state.message}
        />
      ) : null}

      {section.fields.map((field) => (
        <SettingFieldControl key={field.key} field={field} value={values[field.key]} error={state?.errors?.[field.key]} />
      ))}

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  );
}

function SettingFieldControl({
  field,
  value,
  error,
}: {
  field: SettingField;
  value: unknown;
  error?: string;
}) {
  const fieldId = `setting_${field.key}`;

  if (field.type === "checkbox") {
    return (
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          id={fieldId}
          name={field.key}
          defaultChecked={Boolean(value)}
          className={styles.checkbox}
        />
        <span>
          <span className={styles.checkLabel}>{field.label}</span>
          {field.help ? <span className={styles.checkHelp}>{field.help}</span> : null}
        </span>
      </label>
    );
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {field.label}
      </label>
      {field.type === "select" ? (
        <select
          id={fieldId}
          name={field.key}
          className={styles.select}
          defaultValue={String(value ?? "")}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={fieldId}
          name={field.key}
          type={field.type}
          className={styles.input}
          defaultValue={String(value ?? "")}
        />
      )}
      {error ? (
        <span className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
