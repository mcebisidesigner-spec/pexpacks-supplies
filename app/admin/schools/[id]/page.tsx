import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool, slugify } from "@/lib/admin/schools";
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

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const canonicalSlug = school.slug || slugify(school.name);
  if (isUuid && canonicalSlug) {
    redirect(`/admin/schools/${canonicalSlug}`);
  }

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
        action={updateSchoolAction.bind(null, school.id)}
      />
    </div>
  );
}
