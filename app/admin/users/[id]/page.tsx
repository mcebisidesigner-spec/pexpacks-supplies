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

  return (
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href="/admin/users" className={adminStyles.resetLink}>
          <ArrowLeft aria-hidden="true" /> Back to users
        </Link>
      </p>

      <div className={adminStyles.headerRow}>
        <h1 className={adminStyles.pageTitle}>{displayName(user)}</h1>
      </div>

      <div className={styles.detailMeta}>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Email</div>
          <div className={styles.metaValue}>{user.email ?? "—"}</div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>Status</div>
          <div className={styles.metaValue}>
            {banned ? "Banned" : user.last_sign_in_at ? "Active" : "Invited"}
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
              <span>No role</span>
            )}
          </div>
        </div>
        <div className={styles.metaItem}>
          <div className={styles.metaLabel}>User ID</div>
          <div className={styles.metaValue}>{user.id}</div>
        </div>
      </div>

      <div className={styles.stack}>
        {canEdit ? (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Roles</h2>
            <p className={styles.cardSubtitle}>
              Memberships control what this user can do. Changes take effect immediately.
            </p>
            <UserRolesForm userId={user.id} roles={roles} assigned={user.roleSlugs} />
          </section>
        ) : (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Roles</h2>
            <p className={styles.cardSubtitle}>
              You don’t have permission to edit roles. Current memberships are shown above.
            </p>
          </section>
        )}

        {canEdit ? (
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Permission overrides</h2>
            <p className={styles.cardSubtitle}>
              Fine-grained exceptions for this user, on top of their roles.
            </p>
            <UserPermissionsForm
              userId={user.id}
              permissions={permissionOptions}
              overrides={overrides}
            />
          </section>
        ) : null}

        {canDeactivate || canDelete ? (
          <section className={`${styles.card} ${styles.dangerZone}`}>
            <h2 className={styles.cardTitle}>Danger zone</h2>
            <div className={styles.stack}>
              {canDeactivate && !isSelf ? (
                <div className={styles.dangerRow}>
                  <div>
                    <div className={styles.dangerTitle}>
                      {banned ? "Reactivate account" : "Deactivate account"}
                    </div>
                    <p className={styles.dangerText}>
                      {banned
                        ? "Allow this user to sign in again."
                        : "Immediately signs the user out and blocks sign-in. They keep their roles."}
                    </p>
                  </div>
                  <form
                    action={
                      banned
                        ? reactivateUserAction.bind(null, user.id)
                        : deactivateUserAction.bind(null, user.id)
                    }
                  >
                    <ConfirmButton
                      label={banned ? "Reactivate" : "Deactivate"}
                      confirmText={
                        banned
                          ? `Reactivate ${displayName(user)}?`
                          : `Deactivate ${displayName(user)}? They will be signed out immediately.`
                      }
                      busyLabel={banned ? "Reactivating…" : "Deactivating…"}
                      className={`${styles.dangerButton} ${banned ? styles.dangerButtonRestore : ""}`}
                    />
                  </form>
                </div>
              ) : null}
              {canDelete && !isSelf ? (
                <div className={styles.dangerRow}>
                  <div>
                    <div className={styles.dangerTitle}>Delete account</div>
                    <p className={styles.dangerText}>
                      Permanently removes this user from authentication. Cannot be undone.
                    </p>
                  </div>
                  <form action={deleteUserAction.bind(null, user.id)}>
                    <ConfirmButton
                      label="Delete user"
                      confirmText={`Permanently delete ${displayName(user)} (${user.email})? This cannot be undone.`}
                      busyLabel="Deleting…"
                      className={styles.dangerButton}
                    />
                  </form>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
