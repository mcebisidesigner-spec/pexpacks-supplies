"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import {
  updateUserPermissionsAction,
  type PermissionOverrideState,
} from "@/app/admin/users/actions";
import adminStyles from "@/app/admin/admin.module.css";
import { DbNotice } from "@/components/admin/ui/DbNotice";
import { AdminButton } from "@/components/admin/ui/AdminButton";

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
    <AdminButton
      type="submit"
      variant="primary"
      loading={pending}
      icon={<Save size={14} />}
    >
      Save overrides
    </AdminButton>
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
    {},
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
    <form action={formAction} className={adminStyles.stack}>
      <input
        type="hidden"
        name="overrides"
        value={JSON.stringify(overrideList)}
      />
      {state?.ok ? (
        <DbNotice type="success" message={state.message ?? "Saved."} />
      ) : state?.message ? (
        <DbNotice type="error" message={state.message} />
      ) : null}

      <div className={adminStyles.sidebarCard}>
        <p className={adminStyles.mutedText}>
          Overrides sit on top of role permissions. &ldquo;Allow&rdquo; and
          &ldquo;Deny&rdquo; beat any role grants; &ldquo;Inherit&rdquo; leaves
          the user to their roles.
        </p>
      </div>

      {groups.map((g) => (
        <div key={g.group} className={adminStyles.sidebarCard}>
          <div
            className={`${adminStyles.fieldLabel} ${adminStyles.uppercase} ${adminStyles.lsWide}`}
          >
            {g.group}
          </div>
          <div className={adminStyles.stack}>
            {g.items.map((p) => {
              const value = values.get(p.key) ?? "inherit";
              return (
                <div
                  key={p.key}
                  className={`${adminStyles.flexBetween} ${adminStyles["items-center"]} ${adminStyles["gap-10"]}`}
                >
                  <span
                    className={`${adminStyles.fieldLabel} ${adminStyles["flex-1"]}`}
                  >
                    {p.name}
                  </span>
                  <span
                    className={`${adminStyles.fontMono} ${adminStyles.mutedText}`}
                  >
                    {p.key}
                  </span>
                  <select
                    className={adminStyles.selectField}
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

      <div
        className={`${adminStyles.flexBetween} ${adminStyles["items-center"]} ${adminStyles["gap-12"]} ${adminStyles["flex-wrap"]}`}
      >
        <p className={adminStyles.mutedText}>
          {overrideList.length} override(s) active.
        </p>
        <SaveButton />
      </div>
    </form>
  );
}
