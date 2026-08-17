import { requireAdmin } from "@/lib/admin/rbac";
import { SuppliersPageView } from "@/components/admin/views/SuppliersPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Suppliers | Admin | Pexpacks",
};

export default async function AdminSuppliersPage() {
  await requireAdmin({ permission: "suppliers.view" });
  return <SuppliersPageView />;
}
