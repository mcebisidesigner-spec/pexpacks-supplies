"use client";

import { useFormStatus } from "react-dom";
import type { RoleInfo } from "@/lib/admin/users";
import { updateUserRolesAction } from "@/app/admin/users/actions";
import styles from "./user-forms.module.css";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save roles"}
    </button>
  );
}

export function UserRolesForm({
  userId,
  roles,
  assigned,
}: {
  userId: string;
  roles: RoleInfo[];
  assigned: string[];
}) {
  return (
    <form action={updateUserRolesAction.bind(null, userId)} className={styles.rolesForm}>
      <div className={styles.checkList}>
        {roles.map((role) => (
          <label key={role.id} className={styles.checkRow}>
            <input
              type="checkbox"
              name="roles"
              value={role.slug}
              defaultChecked={assigned.includes(role.slug)}
              className={styles.checkbox}
            />
            <span>
              <span className={styles.checkLabel}>{role.name}</span>
              <span className={styles.checkHint}>{role.description}</span>
            </span>
          </label>
        ))}
      </div>
      <div className={styles.formFooter}>
        <p className={styles.hintText}>
          Role changes apply immediately. Only Super Admins can assign or remove the Super
          Admin role.
        </p>
        <SaveButton />
      </div>
    </form>
  );
}
