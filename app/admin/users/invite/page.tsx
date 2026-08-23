import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { listRoles } from "@/lib/admin/users";
import { InviteUserForm } from "@/components/admin/users/InviteUserForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "../../admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Invite user | Admin | Pexpacks",
};

export default async function InviteUserPage() {
  await requireAdmin({ permission: "users.create" });
  const roles = await listRoles();

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Invite a User"
        subtitle="Send an email invitation to a new team member. They will set their own password upon first sign-in."
        actions={
          <AdminButton
            href="/admin/users"
            variant="secondary"
            icon={<ArrowLeft size={14} />}
          >
            Back to Users
          </AdminButton>
        }
      />

      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <div className={adminStyles.pForm}>
            <InviteUserForm roles={roles} />
          </div>
        </div>
      </div>
    </div>
  );
}
