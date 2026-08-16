import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { listPackSchools } from "@/lib/admin/packs";
import { getSchool } from "@/lib/admin/schools";
import { PackForm } from "@/components/admin/packs/PackForm";
import { createPackAction } from "../actions";
import adminStyles from "../../admin.module.css";

export const metadata = {
  title: "Add pack | Admin | Pexpacks",
};

interface NewPackPageProps {
  searchParams?: Promise<{ school_id?: string }>;
}

export default async function NewPackPage({ searchParams }: NewPackPageProps) {
  await requireAdmin({ permission: "packs.create" });
  const params = searchParams ? await searchParams : {};
  const schoolId = params.school_id;

  if (schoolId) {
    const school = await getSchool(schoolId);
    const targetSlug = school?.slug || schoolId;
    redirect(`/admin/packs/${targetSlug}/add-pack`);
  }

  const schools = await listPackSchools();

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Add a pack</h1>
        <p className={adminStyles.subtitle}>
          Choose a school and add a grade to create its stationery pack. The
          public pack card is built automatically from the live site data.
        </p>
      </div>
      <PackForm schools={schools} action={createPackAction} />
    </div>
  );
}
