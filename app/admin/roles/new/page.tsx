import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { permissionGroups } from "@/lib/admin/roles";
import { RoleForm } from "@/components/admin/roles/RoleForm";
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
      <p>
        <Link href="/admin/roles" className={adminStyles.resetLink}>
          <ArrowLeft aria-hidden="true" /> Back to roles
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>New role</h1>
        <p className={adminStyles.subtitle}>
          Define a named set of permissions you can assign to users.
        </p>
      </div>
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
