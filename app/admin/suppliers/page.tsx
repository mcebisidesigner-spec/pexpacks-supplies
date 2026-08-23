import { requireAdmin } from "@/lib/admin/rbac";
import { listSuppliers } from "@/lib/admin/operations";
import { SuppliersPageView } from "@/components/admin/views/SuppliersPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Suppliers | Admin | Pexpacks",
};

export default async function AdminSuppliersPage() {
  await requireAdmin({ permission: "suppliers.view" });
  const suppliers = await listSuppliers();
  return <SuppliersPageView initialSuppliers={suppliers} />;
}
