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
import adminStyles from "../../adminStyles";

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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-5">
        <div className="bg-[var(--db-surface-inner)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Email</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">{user.email ?? "—"}</div>
        </div>
        <div className="bg-[var(--db-surface-inner)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Status</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">
            <StatusBadge status={userStatus} showDot />
          </div>
        </div>
        <div className="bg-[var(--db-surface-inner)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Joined</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">{formatDateTime(user.created_at)}</div>
        </div>
        <div className="bg-[var(--db-surface-inner)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Last sign in</div>
          <div className="mt-1 text-sm font-bold text-[var(--a-text)] break-words">{formatDateTime(user.last_sign_in_at)}</div>
        </div>
        <div className="bg-[var(--db-surface-inner)] rounded-xl p-3 px-3.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.05em] text-[var(--db-text-muted)]">Roles</div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {user.roleSlugs.length > 0 ? (
              user.roleSlugs.map((slug) => (
                <span
                  key={slug}
                  className={`text-[11px] font-bold py-[3px] px-2 rounded-full ${
                    slug === "super_admin"
                      ? "bg-[var(--db-warning-subtle)] text-[var(--db-warning-text)]"
                      : "bg-blue-600/10 text-[var(--db-info)]"
                  }`}
                >
                  {slug.replace(/_/g, " ")}
                </span>
              ))
            ) : (
              <span className="text-xs text-[var(--db-text-muted)]">No roles assigned</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-2xl p-[22px]">
          <h2 className="m-0 mb-1 text-lg font-extrabold text-[var(--a-text)]">Assigned roles</h2>
          <p className="m-0 mb-4 text-[13px] text-[var(--db-text-muted)]">
            Roles bundle permissions. Users inherit all permissions from their assigned roles.
          </p>
          <UserRolesForm
            userId={user.id}
            roles={roles}
            assigned={user.roleIds}
          />
        </div>

        <div className="bg-[var(--pex-bg)] border border-[var(--db-border)] rounded-2xl p-[22px]">
          <h2 className="m-0 mb-1 text-lg font-extrabold text-[var(--a-text)]">Permission overrides</h2>
          <p className="m-0 mb-4 text-[13px] text-[var(--db-text-muted)]">
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
        <div className="bg-[var(--pex-bg)] border border-[var(--db-danger-border)] rounded-2xl p-[22px] mt-6">
          <h2 className="m-0 mb-1 font-bold text-[var(--a-text)] text-sm">Danger zone</h2>
          <p className="m-0 mb-4 text-[13px] text-[var(--db-text-muted)]">
            Deactivating prevents the user from signing in. Deleting removes the user permanently.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {canDeactivate ? (
              banned ? (
                <form action={reactivateUserAction.bind(null, user.id)}>
                  <ConfirmButton
                    label="Reactivate user"
                    title="Reactivate user"
                    confirmText={`Allow ${displayName(user)} to sign in again?`}
                    busyLabel="Reactivating…"
                    className={`${adminStyles.rowButton} text-[var(--db-success-text)]`}
                  />
                </form>
              ) : (
                <form action={deactivateUserAction.bind(null, user.id)}>
                  <ConfirmButton
                    label="Deactivate user"
                    title="Deactivate user"
                    confirmText={`Suspend ${displayName(user)} from signing in?`}
                    busyLabel="Deactivating…"
                    className={`${adminStyles.rowButton} text-[var(--db-text-muted)]`}
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
