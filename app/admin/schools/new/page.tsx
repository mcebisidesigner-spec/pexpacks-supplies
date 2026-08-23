import { requireAdmin } from "@/lib/admin/rbac";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { createSchoolAction } from "../actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add School | Admin | Pexpacks",
};

export default async function NewSchoolPage() {
  await requireAdmin({ permission: "schools.create" });

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/schools"
        backLabel="Back to Schools"
        title="Add a School"
        subtitle="Create a school profile. It will appear on the public catalogue once published."
      />

      <SchoolForm school={null} action={createSchoolAction} />
    </div>
  );
}
