import { requireAdmin } from "@/lib/admin/rbac";
import { SchoolsPageView } from "@/components/admin/views/SchoolsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Schools | Admin | Pexpacks",
};

export default async function AdminSchoolsPage() {
  await requireAdmin({ permission: "schools.view" });
  return <SchoolsPageView />;
}
