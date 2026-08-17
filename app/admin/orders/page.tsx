import { requireAdmin } from "@/lib/admin/rbac";
import { OrdersPageView } from "@/components/admin/views/OrdersPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Orders | Admin | Pexpacks",
};

export default async function AdminOrdersPage() {
  await requireAdmin({ permission: "orders.view" });
  return <OrdersPageView />;
}
