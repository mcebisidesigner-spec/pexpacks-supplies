import { requireAdmin } from "@/lib/admin/rbac";
import { MasterProductsPageView } from "@/components/admin/views/MasterProductsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Master Products | Admin | Pexpacks",
};

export default async function AdminMasterProductsPage() {
  await requireAdmin({ permission: "catalogue.view" });
  return <MasterProductsPageView />;
}
