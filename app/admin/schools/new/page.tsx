import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { createSchoolAction } from "../actions";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add School | Admin | Pexpacks",
};

export default async function NewSchoolPage() {
  await requireAdmin({ permission: "schools.create" });

  return (
    <div className={styles.container}>
      {/* Breadcrumb Back Button */}
      <div>
        <Link
          href="/admin/schools"
          className={`${styles.secondaryBtn} ${adminStyles.backLinkOverride}`}
        >
          <ArrowLeft size={14} /> Back to Schools
        </Link>
      </div>

      {/* Header with crisp white title */}
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={`${styles.headerTitle} ${styles["c-white"]}`}>
            Add a School
          </h1>
          <p className={styles.headerSubtitle}>
            Create a school profile. It will appear on the public catalogue once published.
          </p>
        </div>
      </div>

      {/* Form */}
      <SchoolForm school={null} action={createSchoolAction} />
    </div>
  );
}
