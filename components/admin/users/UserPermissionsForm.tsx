"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateUserPermissionsAction,
  type PermissionOverrideState,
} from "@/app/admin/users/actions";
import styles from "./user-forms.module.css";

export interface PermissionOption {
  key: string;
  name: string;
  group: string;
}

type OverrideValue = "allow" | "deny";
type MatrixValue = OverrideValue | "inherit";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save overrides"}
    </button>
  );
}

export function UserPermissionsForm({
  userId,
  permissions,
  overrides,
}: {
  userId: string;
  permissions: PermissionOption[];
  overrides: { key: string; granted: boolean }[];
}) {
  const initial = new Map<string, OverrideValue>();
  for (const o of overrides) {
    initial.set(o.key, o.granted ? "allow" : "deny");
  }
  const [values, setValues] = useState<Map<string, MatrixValue>>(initial);
  const [state, formAction] = useActionState<PermissionOverrideState, FormData>(
    updateUserPermissionsAction.bind(null, userId),
    {}
  );

  const overrideList = [...values.entries()]
    .filter(([, v]) => v !== "inherit")
    .map(([key, v]) => ({ key, granted: v === "allow" }));

  const groups: { group: string; items: PermissionOption[] }[] = [];
  const groupMap = new Map<string, PermissionOption[]>();
  for (const p of permissions) {
    const list = groupMap.get(p.group) ?? [];
    list.push(p);
    groupMap.set(p.group, list);
  }
  for (const [group, items] of groupMap) groups.push({ group, items });

  return (
    <form action={formAction} className={styles.rolesForm}>
      <input type="hidden" name="overrides" value={JSON.stringify(overrideList)} />
      {state?.ok ? (
        <p className={styles.success} role="status">
          {state.message ?? "Saved."}
        </p>
      ) : state?.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <div className={styles.matrixNote}>
        Overrides sit on top of role permissions. “Allow” and “Deny” beat any role grants; “Inherit”
        leaves the user to their roles.
      </div>

      {groups.map((g) => (
        <div key={g.group} className={styles.matrixGroup}>
          <div className={styles.matrixGroupTitle}>{g.group}</div>
          <div className={styles.matrixRows}>
            {g.items.map((p) => {
              const value = values.get(p.key) ?? "inherit";
              return (
                <div key={p.key} className={styles.matrixRow}>
                  <span className={styles.matrixName}>{p.name}</span>
                  <span className={styles.matrixMono}>{p.key}</span>
                  <select
                    className={styles.matrixSelect}
                    value={value}
                    onChange={(e) => {
                      const next = new Map(values);
                      next.set(p.key, e.target.value as MatrixValue);
                      setValues(next);
                    }}
                    aria-label={`Override for ${p.name}`}
                  >
                    <option value="inherit">Inherit</option>
                    <option value="allow">Allow</option>
                    <option value="deny">Deny</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className={styles.formFooter}>
        <p className={styles.hintText}>{overrideList.length} override(s) active.</p>
        <SaveButton />
      </div>
    </form>
  );
}
