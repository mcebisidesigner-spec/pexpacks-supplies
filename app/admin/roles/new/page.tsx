import { requireAdmin } from "@/lib/admin/rbac";
import { permissionGroups } from "@/lib/admin/roles";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";
import viewStyles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "New role | Admin | Pexpacks",
};

export default async function NewRolePage() {
  await requireAdmin({ permission: "roles.manage" });

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        backHref="/admin/roles"
        backLabel="Back to Roles"
        title="New Role"
        subtitle="Define a named set of permissions you can assign to users."
      />
      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <div className={adminStyles.formCardInner}>
            <RoleForm
              initial={{ name: "", slug: "", description: null, permissionKeys: [] }}
              groups={permissionGroups()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
