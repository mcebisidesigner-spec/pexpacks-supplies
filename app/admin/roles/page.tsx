import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { listRoles } from "@/lib/admin/roles";
import { deleteRoleAction } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "../admin.module.css";
import styles from "./roles.module.css";

export default async function RolesPage() {
  await requireAdmin({ permission: "roles.manage" });
  const roles = await listRoles();

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title="Roles & Permissions"
        count={roles.length}
        subtitle="Manage administrative roles and assigned security permissions."
        actions={
          <AdminButton
            href="/admin/roles/new"
            variant="primary"
            icon={<Plus size={14} />}
          >
            New Role
          </AdminButton>
        }
      />

      {roles.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>No roles yet</h2>
              <p className={adminStyles.emptyStateText}>
                Create your first role to start assigning permissions.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Members</th>
                  <th>Permissions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <div className={styles.roleCell}>
                        <span className={styles.roleDot} aria-hidden="true" />
                        <div>
                          <div className={styles.roleName}>
                            {role.name}
                            {role.slug === "super_admin" ? (
                              <span className={styles.seedTag}> seed</span>
                            ) : null}
                          </div>
                          <div className={styles.roleSlug}>{role.slug}</div>
                          {role.description ? (
                            <div className={styles.roleDesc}>{role.description}</div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td>{role.memberCount}</td>
                    <td>{role.permissionCount}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/admin/roles/${role.id}`} className={adminStyles.actionLink}>
                          Edit
                        </Link>
                        {role.slug !== "super_admin" && role.memberCount === 0 ? (
                          <form action={deleteRoleAction.bind(null, role.id)}>
                            <ConfirmButton
                              label="Delete"
                              confirmText={`Permanently delete the "${role.name}" role? This cannot be undone.`}
                              busyLabel="Deleting…"
                              className={`${adminStyles.rowButton} ${adminStyles.rowButtonDelete}`}
                            />
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
