"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateWebsiteContentAction } from "@/app/admin/content/actions";
import type { ContentField, ContentFormState, ContentSection } from "@/lib/admin/content";
import styles from "./content-form.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save section"}
    </button>
  );
}

export function WebsiteContentForm({
  section,
  values,
}: {
  section: ContentSection;
  values: Record<string, unknown>;
}) {
  const [state, formAction] = useActionState<ContentFormState, FormData>(
    updateWebsiteContentAction.bind(null, section.key),
    {}
  );

  return (
    <form action={formAction} className={styles.form}>
      {state?.ok ? (
        <p className={styles.success} role="status">
          {state.message}
        </p>
      ) : state?.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      {section.fields.map((field) => (
        <FieldControl
          key={field.key}
          field={field}
          value={values[field.key]}
          error={state?.errors?.[field.key]}
        />
      ))}

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  );
}

function FieldControl({
  field,
  value,
  error,
}: {
  field: ContentField;
  value: unknown;
  error?: string;
}) {
  const fieldId = `content_${field.key}`;

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
      {field.type === "textarea" ? (
        <textarea
          id={fieldId}
          name={field.key}
          rows={field.key.includes("description") || field.key === "answer" ? 6 : 3}
          className={styles.textarea}
          defaultValue={String(value ?? "")}
        />
      ) : (
        <input
          id={fieldId}
          name={field.key}
          type="text"
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
