import Link from "next/link";
import { requireAdmin } from "@/lib/admin/rbac";
import { listRoles } from "@/lib/admin/users";
import { InviteUserForm } from "@/components/admin/users/InviteUserForm";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";

export const metadata = {
  title: "Invite user | Admin | Pexpacks",
};

export default async function InviteUserPage() {
  await requireAdmin({ permission: "users.create" });
  const roles = await listRoles();

  return (
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href="/admin/users" className={shared.resetLink}>
          ← Back to users
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Invite a user</h1>
        <p className={adminStyles.subtitle}>
          Send an email invitation to a new team member. They set their own password on first
          sign-in.
        </p>
      </div>
      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <div style={{ padding: "clamp(20px, 3vw, 32px)" }}>
            <InviteUserForm roles={roles} />
          </div>
        </div>
      </div>
    </div>
  );
}
