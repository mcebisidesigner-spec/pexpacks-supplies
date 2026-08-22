import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolPackCreateForm } from "@/components/admin/packs/SchoolPackCreateForm";
import { createSchoolPackAction } from "../../actions";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add Pack | Admin | Pexpacks",
};

interface AddPackPageProps {
  params: Promise<{ id: string }>;
}

export default async function AddPackPage({ params }: AddPackPageProps) {
  const session = await requireAdmin({ permission: "packs.create" });
  const { id } = await params;
  const school = await getSchool(id);
  if (!school) notFound();

  const schoolRoute = school.slug || school.id;
  const createAction = createSchoolPackAction.bind(null, school.id, schoolRoute);

  return (
    <div className={styles.container}>
      <Link
        href={`/admin/packs/${schoolRoute}`}
        className={styles.secondaryBtn}
        style={{ height: 32, fontSize: 11, background: "transparent", border: "none", color: "#94a3b8", paddingLeft: 0 }}
      >
        <ArrowLeft size={14} /> Back to {school.name}
      </Link>
      <SchoolPackCreateForm
        schoolId={school.id}
        schoolName={school.name}
        showImporter={hasPermission(session, "items.import")}
        action={createAction}
      />
    </div>
  );
}
