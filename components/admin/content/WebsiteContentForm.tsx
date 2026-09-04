"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { updateWebsiteContentAction } from "@/app/admin/content/actions";
import type {
  ContentField,
  ContentFormState,
  ContentSection,
} from "@/lib/admin/content";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "./content-form.module.css";

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
      {pending ? "Saving…" : "Save section"}
    </AdminButton>
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
    {},
  );

  return (
    <form action={formAction} className={adminStyles.stack}>
      {state?.ok ? (
        <p className={styles.success} role="status">
          {state.message}
        </p>
      ) : state?.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={adminStyles.detailLayout}>
        <div className={adminStyles.leftColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <span>Section Content</span>
              </div>
            </div>
            {section.fields.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                value={values[field.key]}
                error={state?.errors?.[field.key]}
              />
            ))}
          </div>
        </div>
        <aside className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <span>Save</span>
              </div>
            </div>
            <div className={adminStyles.stackRow}>
              <SubmitButton />
            </div>
          </div>
        </aside>
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
      <div className={adminStyles.formField}>
        <div>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              id={fieldId}
              name={field.key}
              defaultChecked={Boolean(value)}
              className={adminStyles.checkbox}
            />
            <span>
              <span className={styles.checkLabel}>{field.label}</span>
            </span>
          </label>
          {field.help ? (
            <p className={adminStyles.muted}>{field.help}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={adminStyles.formField}>
      <div>
        <label className={adminStyles.formLabel} htmlFor={fieldId}>
          {field.label}
        </label>
        {field.type === "textarea" ? (
          <textarea
            id={fieldId}
            name={field.key}
            rows={
              field.key.includes("description") || field.key === "answer"
                ? 6
                : 3
            }
            className={adminStyles.textareaField}
            defaultValue={String(value ?? "")}
          />
        ) : (
          <input
            id={fieldId}
            name={field.key}
            type="text"
            className={adminStyles.inputField}
            defaultValue={String(value ?? "")}
          />
        )}
        {error ? (
          <span className={styles.error} role="alert">
            {error}
          </span>
        ) : null}
      </div>
    </div>
  );
}
