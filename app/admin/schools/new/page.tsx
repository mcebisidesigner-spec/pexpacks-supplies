import { requireAdmin } from "@/lib/admin/rbac";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { createSchoolAction } from "../actions";
import adminStyles from "../../admin.module.css";

export const metadata = {
  title: "Add school | Admin | Pexpacks",
};

export default async function NewSchoolPage() {
  await requireAdmin({ permission: "schools.create" });

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Add a school</h1>
        <p className={adminStyles.subtitle}>
          Create a school profile. It will appear on the public catalogue once
          published.
        </p>
      </div>
      <SchoolForm school={null} action={createSchoolAction} />
    </div>
  );
}
