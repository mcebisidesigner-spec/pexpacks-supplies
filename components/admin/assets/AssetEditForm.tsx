"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateAssetAction } from "@/app/admin/assets/actions";
import type { AssetFormState } from "@/lib/admin/assets";
import styles from "./assets-form.module.css";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

export function AssetEditForm({
  id,
  name,
  altText,
}: {
  id: string;
  name: string;
  altText: string | null;
}) {
  const [state, formAction] = useActionState<AssetFormState, FormData>(
    updateAssetAction.bind(null, id),
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

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`name_${id}`}>
          File name
        </label>
        <input
          id={`name_${id}`}
          name="name"
          type="text"
          className={styles.input}
          defaultValue={name}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={`alt_${id}`}>
          Alt text
        </label>
        <input
          id={`alt_${id}`}
          name="alt_text"
          type="text"
          className={styles.input}
          defaultValue={altText ?? ""}
        />
      </div>

      <div className={styles.actions}>
        <SaveButton />
      </div>
    </form>
  );
}
