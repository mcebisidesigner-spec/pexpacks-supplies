import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { SchoolPackCreateForm } from "@/components/admin/packs/SchoolPackCreateForm";
import { createSchoolPackAction } from "../../packs/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import styles from "@/components/admin/views/CorePagesView.module.css";

export const metadata = {
  title: "Add Pack Items | Admin | Pexpacks",
};

interface AddPackItemsPageProps {
  params: Promise<{ schoolName: string }>;
  searchParams?: Promise<{ grade?: string }>;
}

export default async function AddPackItemsPage({
  params,
  searchParams,
}: AddPackItemsPageProps) {
  const session = await requireAdmin({ permission: "packs.create" });
  const { schoolName } = await params;
  const sParams = searchParams ? await searchParams : {};
  const school = await getSchool(schoolName);
  if (!school) notFound();

  const schoolRoute = school.slug || school.id;
  const createAction = createSchoolPackAction.bind(
    null,
    school.id,
    schoolRoute,
  );

  return (
    <div className={`${styles.container} ${styles.packEditorContainer}`}>
      <AdminPageHeader
        backHref={`/admin/packs/${schoolRoute}`}
        backLabel={`Back to ${school.name}`}
        title={school.name}
        titleHighlight="New Pack"
        subtitle={`${school.name} / Manage pack items, pricing, and bulk CSV uploads`}
      />

      <SchoolPackCreateForm
        schoolId={school.id}
        schoolName={school.name}
        showImporter={hasPermission(session, "items.import")}
        initialGrade={sParams.grade || "Grade R"}
        action={createAction}
      />
    </div>
  );
}
