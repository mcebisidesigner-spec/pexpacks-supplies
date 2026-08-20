import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { updateSchoolAction } from "../../actions";
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
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/admin/schools/${schoolSlugOrId}/info`}
          className={styles.secondaryBtn}
          style={{ height: 32, fontSize: 11, background: "transparent", border: "none", color: "#94a3b8", paddingLeft: 0 }}
        >
          <ArrowLeft size={14} /> Back to {school.name}
        </Link>
      </div>

      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Edit School: {school.name}
            <span className={styles.badgeTeal}>● {school.status}</span>
          </h1>
          <p className={styles.headerSubtitle}>
            Update school profile, primary contacts, address, grades, search badge, logo, and partnership status.
          </p>
        </div>
      </div>

      {/* Redesigned DB Design Language Form */}
      <SchoolForm
        school={school}
        action={updateSchoolAction.bind(null, school.id)}
      />
    </div>
  );
}
