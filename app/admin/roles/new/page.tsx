import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { permissionGroups } from "@/lib/admin/roles";
import { RoleForm } from "@/components/admin/roles/RoleForm";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";

export const metadata = {
  title: "New role | Admin | Pexpacks",
};

export default async function NewRolePage() {
  await requireAdmin({ permission: "roles.manage" });

  return (
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href="/admin/roles" className={shared.resetLink}>
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
          <div style={{ padding: "clamp(20px, 3vw, 32px)" }}>
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
