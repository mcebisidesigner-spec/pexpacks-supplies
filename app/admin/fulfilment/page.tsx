import { requireAdmin } from "@/lib/admin/rbac";
import { FulfilmentPageView } from "@/components/admin/views/FulfilmentPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Packing & Fulfilment | Admin | Pexpacks",
};

export default async function AdminFulfilmentPage() {
  await requireAdmin({ permission: "fulfilment.view" });
  return <FulfilmentPageView />;
}
