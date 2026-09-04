"use client";

import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import type { RoleInfo } from "@/lib/admin/users";
import { updateUserRolesAction } from "@/app/admin/users/actions";
import adminStyles from "@/app/admin/admin.module.css";
import { AdminButton } from "@/components/admin/ui/AdminButton";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <AdminButton
      type="submit"
      variant="primary"
      loading={pending}
      icon={<Save size={14} />}
    >
      Save roles
    </AdminButton>
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
    <form
      action={updateUserRolesAction.bind(null, userId)}
      className={adminStyles.stack}
    >
      <div className={adminStyles.checkboxStack}>
        {roles.map((role) => (
          <label key={role.id} className={adminStyles.sidebarCard}>
            <input
              type="checkbox"
              name="roles"
              value={role.slug}
              defaultChecked={assigned.includes(role.slug)}
              className={adminStyles.checkbox}
            />
            <span>
              <span className={adminStyles.fieldLabel}>{role.name}</span>
              <span className={adminStyles.mutedText}>{role.description}</span>
            </span>
          </label>
        ))}
      </div>
      <div
        className={`${adminStyles.flexBetween} ${adminStyles["items-center"]} ${adminStyles["gap-12"]} ${adminStyles["flex-wrap"]}`}
      >
        <p className={adminStyles.mutedText}>
          Role changes apply immediately. Only Super Admins can assign or remove
          the Super Admin role.
        </p>
        <SaveButton />
      </div>
    </form>
  );
}
