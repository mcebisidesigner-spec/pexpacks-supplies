import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
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

  return (
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href={`/admin/schools/${school.id}/info`} className={shared.resetLink}>
          <ArrowLeft aria-hidden="true" /> Back to school details
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit school metadata & contacts</h1>
        <p className={adminStyles.subtitle}>{school.name}</p>
      </div>
      <SchoolForm
        school={school}
        action={updateSchoolAction.bind(null, id)}
      />
    </div>
  );
}
