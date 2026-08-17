import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolPackCreateForm } from "@/components/admin/packs/SchoolPackCreateForm";
import { createSchoolPackAction } from "../../actions";
import styles from "@/components/admin/packs/EditPack.module.css";

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
    <div className={styles.page}>
      <p className={styles.backRow}>
        <Link href={`/admin/packs/${schoolRoute}`} className={styles.backLink}>
          <ArrowLeft aria-hidden="true" /> Back to {school.name}
        </Link>
      </p>
      <SchoolPackCreateForm
        schoolId={school.id}
        schoolName={school.name}
        showImporter={hasPermission(session, "items.import")}
        action={createAction}
      />
    </div>
  );
}
