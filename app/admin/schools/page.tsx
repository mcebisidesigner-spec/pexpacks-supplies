import { requireAdmin } from "@/lib/admin/rbac";
import { listSchools } from "@/lib/admin/schools";
import { SchoolsPageView } from "@/components/admin/views/SchoolsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Schools | Admin | Pexpacks",
};

export default async function AdminSchoolsPage() {
  await requireAdmin({ permission: "schools.view" });
  const initialData = await listSchools({ page: 1, pageSize: 20 });
  return <SchoolsPageView initialData={initialData} />;
}
