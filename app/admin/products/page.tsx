import { requireAdmin } from "@/lib/admin/rbac";
import { MasterProductsPageView } from "@/components/admin/views/MasterProductsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Master Products & Inventory | Admin | Pexpacks",
};

export default async function AdminProductsPage() {
  await requireAdmin({ permission: "items.view" });
  return <MasterProductsPageView />;
}
