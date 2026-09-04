"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createRoleAction, updateRoleAction } from "@/app/admin/roles/actions";
import type { RoleFormState } from "@/lib/admin/roles";
import adminStyles from "@/app/admin/admin.module.css";
import { DbNotice } from "@/components/admin/ui/DbNotice";
import { AdminButton } from "@/components/admin/ui/AdminButton";

export interface PermissionGroupOption {
  group: string;
  items: { key: string; name: string }[];
}

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <AdminButton type="submit" variant="primary" loading={pending}>
      {pending ? pendingLabel : label}
    </AdminButton>
  );
}

export interface RoleFormInitial {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  permissionKeys: string[];
}

export function RoleForm({
  initial,
  groups,
}: {
  initial: RoleFormInitial;
  groups: PermissionGroupOption[];
}) {
  const isEdit = Boolean(initial.id);

  const action = isEdit
    ? updateRoleAction.bind(null, initial.id!)
    : createRoleAction;

  const [state, formAction] = useActionState<RoleFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className={adminStyles.formStack}>
      {state?.ok ? (
        <DbNotice
          type="success"
          message={state.message || "Role updated successfully."}
        />
      ) : state?.message ? (
        <DbNotice type="error" message={state.message} />
      ) : null}

      <div className={adminStyles.formGrid2}>
        <div className={adminStyles.formField}>
          <label className={adminStyles.formLabel} htmlFor="name">
            Role name *
          </label>
          <input
            id="name"
            name="name"
            className={adminStyles.inputField}
            placeholder="e.g. School Manager"
            defaultValue={initial.name}
            required
          />
          {state?.errors?.name ? (
            <span className={adminStyles.error} role="alert">
              {state.errors.name}
            </span>
          ) : null}
        </div>

        <div className={adminStyles.formField}>
          <label className={adminStyles.formLabel} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            className={adminStyles.inputField}
            placeholder="auto from name"
            defaultValue={initial.slug}
            disabled={isEdit && initial.slug === "super_admin"}
          />
          {state?.errors?.slug ? (
            <span className={adminStyles.error} role="alert">
              {state.errors.slug}
            </span>
          ) : null}
        </div>
      </div>

      <div className={adminStyles.formField}>
        <label className={adminStyles.formLabel} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={adminStyles.textareaField}
          rows={3}
          placeholder="What can members of this role do?"
          defaultValue={initial.description ?? ""}
        />
        {state?.errors?.description ? (
          <span className={adminStyles.error} role="alert">
            {state.errors.description}
          </span>
        ) : null}
      </div>

      <fieldset className="permissions-fieldset">
        <legend className={adminStyles.formLabel}>Permissions</legend>
        <p className={adminStyles.mutedText}>
          Select every permission this role grants. A role with no permissions
          can still sign in, but cannot access any admin section.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "14px",
          }}
        >
          {groups.map((g) => (
            <div
              key={g.group}
              style={{
                border: "1px solid var(--a-border)",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--a-text)",
                  background: "var(--a-surface-2)",
                  padding: "8px 14px",
                  borderBottom: "1px solid var(--a-border)",
                }}
              >
                {g.group}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "6px",
                  gap: "2px",
                }}
              >
                {g.items.map((p) => (
                  <label
                    key={p.key}
                    className={adminStyles.checkboxRow}
                    style={{
                      padding: "7px 8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="permissions"
                      value={p.key}
                      defaultChecked={initial.permissionKeys.includes(p.key)}
                      className={adminStyles.checkbox}
                      style={{ marginTop: "3px" }}
                    />
                    <span>
                      <span
                        style={{
                          display: "block",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "var(--a-text)",
                        }}
                      >
                        {p.name}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-mono, monospace)",
                          fontSize: "11px",
                          color: "var(--a-text-4)",
                          marginTop: "1px",
                        }}
                      >
                        {p.key}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className={`${adminStyles.stackRow} ${adminStyles.mt6}`}>
        <AdminButton variant="secondary" href="/admin/roles">
          Cancel
        </AdminButton>
        <SubmitButton
          label={isEdit ? "Save changes" : "Create role"}
          pendingLabel={isEdit ? "Saving…" : "Creating…"}
        />
      </div>
    </form>
  );
}
