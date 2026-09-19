import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, displayName } from "@/lib/admin/rbac";
import { getRole, permissionGroups } from "@/lib/admin/roles";
import { listUsers } from "@/lib/admin/users";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { deleteRoleAction } from "../actions";
import adminStyles from "../../adminStyles";

interface RoleDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  await requireAdmin({ permission: "roles.manage" });
  const { id } = await params;
  const role = await getRole(id);
  if (!role) notFound();

  const members = await listUsers({
    role: role.slug,
    page: 1,
    pageSize: 8,
  });

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        backHref="/admin/roles"
        backLabel="Back to Roles"
        title={role.name}
        subtitle={role.slug === "super_admin" ? "Seed role" : `Role: ${role.slug}`}
      />

      <div className={adminStyles.stack}>
        <div className={adminStyles.tableCard}>
            <div className={adminStyles.tableWrapper}>
            <div className={adminStyles.pForm}>
              <RoleForm
                initial={{
                  id: role.id,
                  name: role.name,
                  slug: role.slug,
                  description: role.description,
                  permissionKeys: role.permissionKeys,
                }}
                groups={permissionGroups()}
              />
            </div>
          </div>
        </div>

        <div className={adminStyles.tableCard}>
          <div className="flex items-start justify-between gap-4 flex-wrap p-[22px_22px_14px]">
            <div>
              <h2 className="m-0 text-lg font-extrabold text-[var(--a-text)]">Members</h2>
              <p className="mt-1 mb-0 text-[13px] text-[var(--db-text-muted)]">
                {role.memberCount} {role.memberCount === 1 ? "person" : "people"} with this role.
                Manage assignments from each user’s profile.
              </p>
            </div>
            <Link href={`/admin/users?role=${role.slug}`} className={adminStyles.actionLink}>
              View in users
            </Link>
          </div>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Member</th>
                </tr>
              </thead>
              <tbody>
                {members.users.length === 0 ? (
                  <tr>
                    <td className="text-[var(--db-text-muted)]">No members yet.</td>
                  </tr>
                ) : (
                  members.users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <Link href={`/admin/users/${user.id}`} className="flex flex-col gap-0.5 no-underline">
                          <span className="font-bold text-[var(--a-text)]">{displayName(user)}</span>
                          <span className="text-xs text-[var(--db-text-muted)]">{user.email}</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {members.total > members.users.length ? (
            <div className="p-[12px_22px] text-[13px] text-[var(--db-text-muted)] border-t border-[var(--db-border)] [&_a]:text-[var(--db-brand)] [&_a]:font-bold [&_a]:no-underline">
              +{members.total - members.users.length} more ·{" "}
              <Link href={`/admin/users?role=${role.slug}`}>view all</Link>
            </div>
          ) : null}
        </div>

        {role.slug !== "super_admin" && role.memberCount === 0 ? (
          <div className="flex items-center justify-between gap-4 flex-wrap bg-[var(--pex-bg)] border border-[var(--db-danger-border)] rounded-2xl p-[22px]">
            <div>
              <div className="font-bold text-[var(--a-text)] text-sm">Delete this role</div>
              <p className="mt-0.5 mb-0 text-[13px] text-[var(--db-text-muted)] max-w-[520px]">
                Permanently removes “{role.name}” and its permission set. Only possible while the
                role has no members.
              </p>
            </div>
            <form action={deleteRoleAction.bind(null, role.id)}>
              <ConfirmButton
                label="Delete role"
                confirmText={`Permanently delete the "${role.name}" role? This cannot be undone.`}
                busyLabel="Deleting…"
                className="bg-[var(--db-danger-subtle)] text-[var(--db-danger-text)] border border-[var(--db-danger-border)] rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer font-inherit"
              />
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
