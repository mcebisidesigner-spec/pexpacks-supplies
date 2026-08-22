import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { updateSchoolAction } from "../../actions";
import adminStyles from "@/app/admin/admin.module.css";
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
          className={`${styles.secondaryBtn} ${styles.backLinkOverride}`}
        >
          <ArrowLeft size={14} /> Back to {school.name}
        </Link>
      </div>

      {/* Header */}
      <div className={`${adminStyles.headerRow} ${styles.mt8} ${styles.mb12}`}>
        <div className={styles.headerTitleGroup}>
          <h1 className={`${styles.headerTitle} ${styles.itemsCenter} ${styles.gap10}`}>
            Edit School: {school.name}
            <span className={`${styles.badgeGreen} ${styles.text11} ${styles.fw600}`}>
              <span className={styles.text8}>●</span> {school.status ? school.status.toLowerCase() : "active"}
            </span>
          </h1>
          <p className={`${styles.text13} ${styles.cMuted} ${styles.mt4}`}>
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
