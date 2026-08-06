"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { uploadAssetAction } from "@/app/admin/assets/actions";
import type { AssetFormState } from "@/lib/admin/assets";
import styles from "./assets-form.module.css";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Uploading…" : "Upload file"}
    </button>
  );
}

export function AssetUploadForm() {
  const [state, formAction] = useActionState<AssetFormState, FormData>(
    uploadAssetAction,
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
        <label className={styles.label} htmlFor="file">
          File
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept=".png,.webp,.svg,.jpg,.jpeg,.gif,.pdf,image/png,image/webp,image/svg+xml,image/jpeg,image/gif,application/pdf"
          className={styles.fileInput}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="alt_text">
          Alt text
        </label>
        <input
          id="alt_text"
          name="alt_text"
          type="text"
          className={styles.input}
          placeholder="Describe the image for screen readers and SEO"
        />
      </div>

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  );
}
