import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { listPackSchools } from "@/lib/admin/packs";
import { getSchool } from "@/lib/admin/schools";
import { PackForm } from "@/components/admin/packs/PackForm";
import { createPackAction } from "../../actions";
import adminStyles from "../../../admin.module.css";
import shared from "../../../schools/schools.module.css";

export const metadata = {
  title: "Add Pack | Admin | Pexpacks",
};

interface AddPackPageProps {
  params: Promise<{ id: string }>;
}

export default async function AddPackPage({ params }: AddPackPageProps) {
  await requireAdmin({ permission: "packs.create" });
  const { id } = await params;
  const schools = await listPackSchools();
  const school = await getSchool(id);

  const schoolId = school?.id ?? (schools.find((s) => s.slug === id || s.id === id)?.id || "");
  const schoolSlug = school?.slug || id;
  const schoolName = school?.name;

  return (
    <div className={adminStyles.adminContainer}>
      <p style={{ marginBottom: 12 }}>
        <Link href={`/admin/packs/${schoolSlug}`} className={shared.resetLink}>
          <ArrowLeft aria-hidden="true" /> Back to {schoolName ?? "school packs"}
        </Link>
      </p>

      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>
          Add a pack {schoolName ? `for ${schoolName}` : ""}
        </h1>
        <p className={adminStyles.subtitle}>
          Add a grade to create its stationery pack. The public pack card is built
          automatically from live site data.
        </p>
      </div>

      <PackForm
        schools={schools}
        defaultSchoolId={schoolId}
        action={createPackAction}
      />
    </div>
  );
}
