import { requireAdmin } from "@/lib/admin/rbac";
import { SchoolPacksView } from "@/components/admin/packs/SchoolPacksView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "School Packs | Admin | Pexpacks",
};

export default async function AdminSchoolPacksPage() {
  await requireAdmin({ permission: "packs.view" });

  return <SchoolPacksView />;
}
