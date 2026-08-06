import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, displayName } from "@/lib/admin/rbac";
import { getRole, permissionGroups } from "@/lib/admin/roles";
import { listUsers } from "@/lib/admin/users";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteRoleAction } from "../actions";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";
import styles from "../roles.module.css";

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
      <p>
        <Link href="/admin/roles" className={shared.resetLink}>
          ← Back to roles
        </Link>
      </p>

      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>
          {role.name}
          {role.slug === "super_admin" ? <span className={styles.seedTag}> seed</span> : null}
        </h1>
      </div>

      <div className={adminStyles.stack}>
        <div className={adminStyles.tableCard}>
          <div className={adminStyles.tableWrapper}>
            <div style={{ padding: "clamp(20px, 3vw, 32px)" }}>
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
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Members</h2>
              <p className={styles.cardSubtitle}>
                {role.memberCount} {role.memberCount === 1 ? "person" : "people"} with this role.
                Manage assignments from each user’s profile.
              </p>
            </div>
            <Link href={`/admin/users?role=${role.slug}`} className={styles.actionLink}>
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
                    <td className={styles.noMembers}>No members yet.</td>
                  </tr>
                ) : (
                  members.users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <Link href={`/admin/users/${user.id}`} className={styles.memberLink}>
                          <span className={styles.memberName}>{displayName(user)}</span>
                          <span className={styles.memberEmail}>{user.email}</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {members.total > members.users.length ? (
            <div className={styles.moreMembers}>
              +{members.total - members.users.length} more ·{" "}
              <Link href={`/admin/users?role=${role.slug}`}>view all</Link>
            </div>
          ) : null}
        </div>

        {role.slug !== "super_admin" && role.memberCount === 0 ? (
          <div className={styles.deleteCard}>
            <div>
              <div className={styles.deleteTitle}>Delete this role</div>
              <p className={styles.deleteText}>
                Permanently removes “{role.name}” and its permission set. Only possible while the
                role has no members.
              </p>
            </div>
            <form action={deleteRoleAction.bind(null, role.id)}>
              <ConfirmButton
                label="Delete role"
                confirmText={`Permanently delete the "${role.name}" role? This cannot be undone.`}
                busyLabel="Deleting…"
                className={styles.deleteButton}
              />
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
