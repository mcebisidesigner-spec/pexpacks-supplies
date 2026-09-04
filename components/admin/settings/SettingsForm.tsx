"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/app/admin/settings/actions";
import type {
  SettingField,
  SettingFormState,
  SettingSection,
} from "@/lib/admin/settings";
import { DbNotice } from "@/components/admin/ui/DbNotice";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";

function SubmitButton() {
  return (
    <AdminButton type="submit" variant="primary" size="md">
      Save settings
    </AdminButton>
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
    {},
  );

  return (
    <form action={formAction} className={adminStyles.stack}>
      {state?.ok ? (
        <DbNotice type="success" message={state.message || "Settings saved."} />
      ) : state?.message ? (
        <DbNotice type="error" message={state.message} />
      ) : null}

      {section.fields.map((field) => (
        <SettingFieldControl
          key={field.key}
          field={field}
          value={values[field.key]}
          error={state?.errors?.[field.key]}
        />
      ))}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginTop: "6px",
        }}
      >
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
      <div className={adminStyles.formField}>
        <label
          className={adminStyles.formLabel}
          htmlFor={fieldId}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            id={fieldId}
            name={field.key}
            defaultChecked={Boolean(value)}
            style={{
              marginTop: "3px",
              accentColor: "var(--db-brand)",
              width: "16px",
              height: "16px",
              flexShrink: 0,
            }}
          />
          <span>
            <span
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--a-text)",
              }}
            >
              {field.label}
            </span>
            {field.help ? (
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "var(--a-text-3)",
                  marginTop: "2px",
                }}
              >
                {field.help}
              </span>
            ) : null}
          </span>
        </label>
      </div>
    );
  }

  return (
    <div className={adminStyles.formField}>
      <label className={adminStyles.formLabel} htmlFor={fieldId}>
        {field.label}
      </label>
      {field.type === "select" ? (
        <select
          id={fieldId}
          name={field.key}
          className={adminStyles.selectField}
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
          className={adminStyles.inputField}
          defaultValue={String(value ?? "")}
        />
      )}
      {error ? (
        <span role="alert" style={{ color: "#f87171", fontSize: "12px" }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
