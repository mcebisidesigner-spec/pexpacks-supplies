import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { updateSchoolAction } from "../../actions";
import adminStyles from "../../../admin.module.css";
import shared from "../../schools.module.css";

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
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href={`/admin/schools/${schoolSlugOrId}/info`} className={shared.resetLink}>
          <ArrowLeft aria-hidden="true" /> Back to {school.name}
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit school</h1>
        <p className={adminStyles.subtitle}>{school.name}</p>
      </div>
      <SchoolForm
        school={school}
        action={updateSchoolAction.bind(null, school.id)}
      />
    </div>
  );
}
