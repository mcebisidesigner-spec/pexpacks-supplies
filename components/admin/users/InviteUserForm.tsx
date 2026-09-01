"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { InviteResult, RoleInfo } from "@/lib/admin/users";
import { inviteUserAction } from "@/app/admin/users/actions";
import styles from "./user-forms.module.css";
import { DbNotice } from "@/components/admin/ui/DbNotice";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Sending invite…" : "Send invite"}
    </button>
  );
}

export function InviteUserForm({ roles }: { roles: RoleInfo[] }) {
  const [state, formAction] = useActionState<InviteResult, FormData>(inviteUserAction, {
    ok: false,
  });

  return (
    <form action={formAction} className={styles.form}>
      {state?.ok ? (
        <DbNotice
          type="success"
          message={state.message || "Invitation sent successfully."}
        />
      ) : state?.message ? (
        <DbNotice
          type="error"
          message={state.message}
        />
      ) : null}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="full_name">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          className={styles.input}
          placeholder="e.g. Thandi Nkosi"
          autoComplete="name"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={styles.input}
          placeholder="name@school.co.za"
          required
          autoComplete="off"
        />
        {state?.errors?.email ? (
          <span className={styles.error} role="alert">
            {state.errors.email}
          </span>
        ) : null}
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Initial roles</legend>
        <div className={styles.checkList}>
          {roles.map((role) => (
            <label key={role.id} className={styles.checkRow}>
              <input type="checkbox" name="roles" value={role.slug} className={styles.checkbox} />
              <span>
                <span className={styles.checkLabel}>{role.name}</span>
                <span className={styles.checkHint}>{role.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.actions}>
        <Link href="/admin/users" className={styles.cancelButton}>
          Cancel
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}
