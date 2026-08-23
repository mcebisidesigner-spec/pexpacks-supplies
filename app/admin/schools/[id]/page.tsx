import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { updateSchoolAction } from "../actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface EditSchoolPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSchoolPage({ params }: EditSchoolPageProps) {
  await requireAdmin({ permission: "schools.view" });
  const { id } = await params;
  const school = await getSchool(id);
  if (!school) notFound();

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/schools"
        backLabel="Back to Schools"
        title={school.name}
        titleHighlight="Edit Profile"
        subtitle="Manage school details, contact records, and public search listing."
      />
      <SchoolForm
        school={school}
        action={updateSchoolAction.bind(null, id)}
      />
    </div>
  );
}
