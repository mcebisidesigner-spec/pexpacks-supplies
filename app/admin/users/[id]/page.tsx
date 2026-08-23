import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  requireAdmin,
  hasPermission,
  displayName,
  type PermissionKey,
} from "@/lib/admin/rbac";
import {
  getUser,
  listRoles,
  getUserPermissionKeys,
  isBanned,
} from "@/lib/admin/users";
import { permissionGroups } from "@/lib/admin/roles";
import { UserRolesForm } from "@/components/admin/users/UserRolesForm";
import {
  UserPermissionsForm,
  type PermissionOption,
} from "@/components/admin/users/UserPermissionsForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import {
  deactivateUserAction,
  reactivateUserAction,
  deleteUserAction,
} from "../actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "../../admin.module.css";
import styles from "../users.module.css";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const session = await requireAdmin({ permission: "users.view" });
  const { id } = await params;
  const [user, roles, overrides] = await Promise.all([
    getUser(id),
    listRoles(),
    getUserPermissionKeys(id),
  ]);
  if (!user) notFound();

  const banned = isBanned(user);
  const canEdit = hasPermission(session, "users.edit");
  const canDeactivate = hasPermission(session, "users.deactivate");
  const canDelete = hasPermission(session, "users.delete");
  const isSelf = user.id === session.user.id;

  const permissionOptions: PermissionOption[] = [];
  for (const group of permissionGroups()) {
    for (const item of group.items) {
      permissionOptions.push({ key: item.key as PermissionKey, name: item.name, group: group.group });
    }
  }

  const userStatus = banned ? "banned" : user.last_sign_in_at ? "active" : "pending";

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title={displayName(user)}
        subtitle={`Email: ${user.email ?? "—"} • User ID: ${user.id}`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StatusBadge status={userStatus} showDot />
            <AdminButton
              href="/admin/users"
              variant="secondary"
              icon={<ArrowLeft size={14} />}
            >
              Back to Users
            </AdminButton>
          </div>
        }
      />

      <div className={styles.detailMeta}>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Email</div>
          <div className={styles.metaValue}>{user.email ?? "—"}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Status</div>
          <div className={styles.metaValue}>
            <StatusBadge status={userStatus} showDot />
          </div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Joined</div>
          <div className={styles.metaValue}>{formatDateTime(user.created_at)}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Last sign in</div>
          <div className={styles.metaValue}>{formatDateTime(user.last_sign_in_at)}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Roles</div>
          <div className={styles.roleChips}>
            {user.roleSlugs.length > 0 ? (
              user.roleSlugs.map((slug) => (
                <span
                  key={slug}
                  className={`${styles.roleChip} ${slug === "super_admin" ? styles.roleChipSuper : ""}`}
                >
                  {slug.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className={styles.roleChipNone}>No roles assigned</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionGrid}>
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Assigned roles</h2>
          <p className={styles.sectionDesc}>
            Roles bundle permissions. Users inherit all permissions from their assigned roles.
          </p>
          <UserRolesForm
            userId={user.id}
            roles={roles}
            assigned={user.roleIds}
          />
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Permission overrides</h2>
          <p className={styles.sectionDesc}>
            Grant additional permissions to this specific user beyond their role assignments.
          </p>
          <UserPermissionsForm
            userId={user.id}
            permissions={permissionOptions}
            overrides={overrides}
          />
        </div>
      </div>

      {!isSelf && (canDeactivate || canDelete) ? (
        <div className={styles.dangerZone}>
          <h2 className={styles.dangerTitle}>Danger zone</h2>
          <p className={styles.dangerDesc}>
            Deactivating prevents the user from signing in. Deleting removes the user permanently.
          </p>
          <div className={styles.dangerActions}>
            {canDeactivate ? (
              banned ? (
                <form action={reactivateUserAction.bind(null, user.id)}>
                  <ConfirmButton
                    label="Reactivate user"
                    title="Reactivate user"
                    confirmText={`Allow ${displayName(user)} to sign in again?`}
                    busyLabel="Reactivating…"
                    className={`${adminStyles.rowButton} ${styles.dangerBtnReactivate}`}
                  />
                </form>
              ) : (
                <form action={deactivateUserAction.bind(null, user.id)}>
                  <ConfirmButton
                    label="Deactivate user"
                    title="Deactivate user"
                    confirmText={`Suspend ${displayName(user)} from signing in?`}
                    busyLabel="Deactivating…"
                    className={`${adminStyles.rowButton} ${styles.dangerBtnDeactivate}`}
                  />
                </form>
              )
            ) : null}

            {canDelete ? (
              <form action={deleteUserAction.bind(null, user.id)}>
                <ConfirmButton
                  label="Delete user"
                  title="Delete user"
                  confirmText={`Permanently delete ${displayName(user)}? This action cannot be undone.`}
                  busyLabel="Deleting…"
                  className={`${adminStyles.rowButton} ${adminStyles.rowButtonDelete}`}
                />
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
