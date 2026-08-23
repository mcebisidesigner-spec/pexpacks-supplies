import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { createSchoolAction } from "../actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add School | Admin | Pexpacks",
};

export default async function NewSchoolPage() {
  await requireAdmin({ permission: "schools.create" });

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Add a School"
        subtitle="Create a school profile. It will appear on the public catalogue once published."
        actions={
          <AdminButton
            href="/admin/schools"
            variant="secondary"
            icon={<ArrowLeft size={14} />}
          >
            Back to Schools
          </AdminButton>
        }
      />

      <SchoolForm school={null} action={createSchoolAction} />
    </div>
  );
}
