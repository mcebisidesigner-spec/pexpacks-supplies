import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { updateSchoolAction } from "../actions";
import adminStyles from "../../admin.module.css";

interface EditSchoolPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSchoolPage({ params }: EditSchoolPageProps) {
  await requireAdmin({ permission: "schools.view" });
  const { id } = await params;
  const school = await getSchool(id);
  if (!school) notFound();

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit school</h1>
        <p className={adminStyles.subtitle}>{school.name}</p>
      </div>
      <SchoolForm
        school={school}
        action={updateSchoolAction.bind(null, id)}
      />
    </div>
  );
}
