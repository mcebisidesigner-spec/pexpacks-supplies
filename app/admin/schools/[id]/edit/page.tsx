import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { updateSchoolAction } from "../../actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface EditSchoolPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSchoolPage({ params }: EditSchoolPageProps) {
  await requireAdmin({ permission: "schools.edit" });
  const { id } = await params;
  const school = await getSchool(id);
  if (!school) notFound();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid && school.slug) {
    redirect(`/admin/schools/${school.slug}/edit`);
  }

  const schoolSlugOrId = school.slug || school.id;

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref={`/admin/schools/${schoolSlugOrId}/info`}
        backLabel="Back to School"
        title={school.name}
        titleHighlight="Edit Profile"
        subtitle="Update school profile, primary contacts, address, grades, search badge, logo, and partnership status."
        actions={<StatusBadge status={school.status || "active"} showDot />}
      />

      <SchoolForm
        school={school}
        action={updateSchoolAction.bind(null, school.id)}
      />
    </div>
  );
}
