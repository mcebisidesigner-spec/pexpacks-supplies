import { requireAdmin } from "@/lib/admin/rbac";
import { listSchoolGroupedSummary } from "@/lib/admin/packs";
import { SchoolPacksView } from "@/components/admin/packs/SchoolPacksView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "School Packs | Admin | Pexpacks",
};

export default async function AdminSchoolPacksPage() {
  await requireAdmin({ permission: "packs.view" });
  const initialData = await listSchoolGroupedSummary({ page: 1, pageSize: 5000 });
  return <SchoolPacksView initialData={initialData} />;
}
