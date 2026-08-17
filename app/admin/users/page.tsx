import Link from "next/link";
import { requireAdmin, hasPermission, displayName } from "@/lib/admin/rbac";
import { listUsers, isBanned, type UserListFilters } from "@/lib/admin/users";
import { PAGE_SIZE, formatDate } from "@/lib/admin/ui-utils";
import { deactivateUserAction, reactivateUserAction, deleteUserAction } from "./actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Pagination } from "@/components/admin/Pagination";
import adminStyles from "../admin.module.css";
import styles from "./users.module.css";

interface UsersPageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    page?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await requireAdmin({ permission: "users.view" });
  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const filters: UserListFilters = {
    q: params.q?.trim() || undefined,
    role: params.role || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const { users, total, pageCount, roleOptions } = await listUsers(filters);
  const baseParams = { q: filters.q, role: filters.role };
  const hasFilters = Boolean(filters.q || filters.role);
  const canDeactivate = hasPermission(session, "users.deactivate");
  const canDelete = hasPermission(session, "users.delete");

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title="Users"
        count={total}
        actions={
          hasPermission(session, "users.create") ? (
            <Link href="/admin/users/invite" className={styles.addButton}>
              + Invite user
            </Link>
          ) : undefined
        }
      />

      <form method="get" action="/admin/users" className={styles.filterForm}>
        <input
          type="search"
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search email, name or ID…"
          className={`${styles.filterInput} ${styles.searchInput}`}
          aria-label="Search users"
        />
        <select name="role" defaultValue={filters.role ?? ""} className={styles.filterInput}>
          <option value="">All roles</option>
          {roleOptions.map((r) => (
            <option key={r.id} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
        <button type="submit" className={styles.applyButton}>
          Apply
        </button>
        {hasFilters ? (
          <Link href="/admin/users" className={styles.resetLink}>
            Reset
          </Link>
        ) : null}
      </form>

      {users.length === 0 ? (
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.emptyStateContainer}>
            <div className={adminStyles.emptyStateInner}>
              <div className={adminStyles.emptyIconWrapper}>
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2 className={adminStyles.emptyStateTitle}>
                {hasFilters ? "No users match your filters" : "No users yet"}
              </h2>
              <p className={adminStyles.emptyStateText}>
                {hasFilters
                  ? "Try clearing your filters, or invite a new team member."
                  : "Invite your first team member to give them admin access."}
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
                  <th>User</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Last sign in</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const banned = isBanned(user);
                  const statusClass = banned
                    ? styles.badgeBanned
                    : user.last_sign_in_at
                      ? styles.badgeActive
                      : styles.badgeInvited;
                  const statusLabel = banned
                    ? "Banned"
                    : user.last_sign_in_at
                      ? "Active"
                      : "Invited";
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.avatar} aria-hidden="true">
                            {(displayName(user).charAt(0) ?? "?").toUpperCase()}
                          </span>
                          <div>
                            <div className={styles.userName}>{displayName(user)}</div>
                            <div className={styles.userEmail}>
                              {user.email}
                              {user.id === session.user.id ? (
                                <span className={styles.selfTag}> you</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={styles.flags}>
                          {user.roleSlugs.length > 0 ? (
                            user.roleSlugs.map((slug) => (
                              <span
                                key={slug}
                                className={`${styles.flag} ${slug === "super_admin" ? styles.flagSuper : styles.flagRole}`}
                              >
                                {slug.replace(/_/g, " ")}
                              </span>
                            ))
                          ) : (
                            <span className={styles.noRole}>No role</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`${adminStyles.badge} ${statusClass}`}>{statusLabel}</span>
                      </td>
                      <td>{formatDate(user.last_sign_in_at)}</td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className={styles.actions}>
                          <Link href={`/admin/users/${user.id}`} className={styles.actionLink}>
                            View
                          </Link>
                          {canDeactivate && user.id !== session.user.id ? (
                            banned ? (
                              <form action={reactivateUserAction.bind(null, user.id)}>
                                <ConfirmButton
                                  label="Reactivate"
                                  confirmText={`Reactivate ${displayName(user)}?`}
                                  busyLabel="Reactivating…"
                                  className={`${styles.rowButton} ${styles.rowButtonRestore}`}
                                />
                              </form>
                            ) : (
                              <form action={deactivateUserAction.bind(null, user.id)}>
                                <ConfirmButton
                                  label="Deactivate"
                                  confirmText={`Deactivate ${displayName(user)}? They will be signed out and blocked.`}
                                  busyLabel="Deactivating…"
                                  className={`${styles.rowButton} ${styles.rowButtonDeactivate}`}
                                />
                              </form>
                            )
                          ) : null}
                          {canDelete && user.id !== session.user.id ? (
                            <form action={deleteUserAction.bind(null, user.id)}>
                              <ConfirmButton
                                label="Delete"
                                confirmText={`Permanently delete ${displayName(user)} (${user.email})? This cannot be undone.`}
                                busyLabel="Deleting…"
                                className={`${styles.rowButton} ${styles.rowButtonDelete}`}
                              />
                            </form>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        basePath="/admin/users"
        params={baseParams}
        currentPage={page}
        totalPages={pageCount}
      />
    </div>
  );
}
