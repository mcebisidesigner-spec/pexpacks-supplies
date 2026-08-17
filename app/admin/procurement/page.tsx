import { requireAdmin } from "@/lib/admin/rbac";
import { ProcurementPageView } from "@/components/admin/views/ProcurementPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Procurement | Admin | Pexpacks",
};

export default async function AdminProcurementPage() {
  await requireAdmin({ permission: "procurement.view" });
  return <ProcurementPageView />;
}
