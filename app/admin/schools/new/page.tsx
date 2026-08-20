import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { SchoolForm } from "@/components/admin/schools/SchoolForm";
import { createSchoolAction } from "../actions";
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
          className={styles.secondaryBtn}
          style={{
            height: 32,
            fontSize: 11,
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            paddingLeft: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to Schools
        </Link>
      </div>

      {/* Header with crisp white title */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle} style={{ color: "#ffffff" }}>
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
