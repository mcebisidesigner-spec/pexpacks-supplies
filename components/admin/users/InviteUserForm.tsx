"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { InviteResult, RoleInfo } from "@/lib/admin/users";
import { inviteUserAction } from "@/app/admin/users/actions";
import adminStyles from "@/app/admin/admin.module.css";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { DbNotice } from "@/components/admin/ui/DbNotice";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <AdminButton type="submit" variant="primary" loading={pending}>
      {pending ? "Sending invite…" : "Send invite"}
    </AdminButton>
  );
}

export function InviteUserForm({ roles }: { roles: RoleInfo[] }) {
  const [state, formAction] = useActionState<InviteResult, FormData>(
    inviteUserAction,
    {
      ok: false,
    },
  );

  return (
    <form action={formAction} className={adminStyles.stack}>
      {state?.ok ? (
        <DbNotice
          type="success"
          message={state.message || "Invitation sent successfully."}
        />
      ) : state?.message ? (
        <DbNotice type="error" message={state.message} />
      ) : null}

      <div className={adminStyles.formField}>
        <label className={adminStyles.formLabel} htmlFor="full_name">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          className={adminStyles.inputField}
          placeholder="e.g. Thandi Nkosi"
          autoComplete="name"
        />
      </div>

      <div className={adminStyles.formField}>
        <label className={adminStyles.formLabel} htmlFor="email">
          Email address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={adminStyles.inputField}
          placeholder="name@school.co.za"
          required
          autoComplete="off"
        />
        {state?.errors?.email ? (
          <span className={adminStyles.error} role="alert">
            {state.errors.email}
          </span>
        ) : null}
      </div>

      <fieldset
        className={adminStyles.formField}
        style={{ border: "none", margin: 0, padding: 0 }}
      >
        <legend className={adminStyles.formLabel}>Initial roles</legend>
        <div className={adminStyles.stack}>
          {roles.map((role) => (
            <label
              key={role.id}
              className={adminStyles.stackRow}
              style={{
                alignItems: "flex-start",
                background: "var(--a-bg)",
                border: "1px solid var(--a-border-strong)",
                borderRadius: "var(--a-radius-sm)",
                padding: "10px 14px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="roles"
                value={role.slug}
                className={adminStyles.checkbox}
              />
              <span>
                <span className={adminStyles.cWhite}>{role.name}</span>
                <span
                  className={adminStyles.cSubtle}
                  style={{ display: "block", marginTop: 2 }}
                >
                  {role.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className={adminStyles.stackRow} style={{ marginTop: 6 }}>
        <AdminButton href="/admin/users" variant="secondary">
          Cancel
        </AdminButton>
        <SubmitButton />
      </div>
    </form>
  );
}
