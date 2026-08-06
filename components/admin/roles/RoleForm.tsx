"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createRoleAction, updateRoleAction } from "@/app/admin/roles/actions";
import type { RoleFormState } from "@/lib/admin/roles";
import styles from "./role-form.module.css";

export interface PermissionGroupOption {
  group: string;
  items: { key: string; name: string }[];
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
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

  const [state, formAction] = useActionState<RoleFormState, FormData>(action, {});

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

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Role name *
          </label>
          <input
            id="name"
            name="name"
            className={styles.input}
            placeholder="e.g. School Manager"
            defaultValue={initial.name}
            required
          />
          {state?.errors?.name ? (
            <span className={styles.error} role="alert">
              {state.errors.name}
            </span>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            className={styles.input}
            placeholder="auto from name"
            defaultValue={initial.slug}
            disabled={isEdit && initial.slug === "super_admin"}
          />
          {state?.errors?.slug ? (
            <span className={styles.error} role="alert">
              {state.errors.slug}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          rows={3}
          placeholder="What can members of this role do?"
          defaultValue={initial.description ?? ""}
        />
        {state?.errors?.description ? (
          <span className={styles.error} role="alert">
            {state.errors.description}
          </span>
        ) : null}
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.label}>Permissions</legend>
        <p className={styles.hintText}>
          Select every permission this role grants. A role with no permissions can still sign in,
          but cannot access any admin section.
        </p>
        <div className={styles.groups}>
          {groups.map((g) => (
            <div key={g.group} className={styles.group}>
              <div className={styles.groupTitle}>{g.group}</div>
              <div className={styles.groupBody}>
                {g.items.map((p) => (
                  <label key={p.key} className={styles.checkRow}>
                    <input
                      type="checkbox"
                      name="permissions"
                      value={p.key}
                      defaultChecked={initial.permissionKeys.includes(p.key)}
                      className={styles.checkbox}
                    />
                    <span>
                      <span className={styles.checkLabel}>{p.name}</span>
                      <span className={styles.checkMono}>{p.key}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className={styles.actions}>
        <Link href="/admin/roles" className={styles.cancelButton}>
          Cancel
        </Link>
        <SubmitButton
          label={isEdit ? "Save changes" : "Create role"}
          pendingLabel={isEdit ? "Saving…" : "Creating…"}
        />
      </div>
    </form>
  );
}
