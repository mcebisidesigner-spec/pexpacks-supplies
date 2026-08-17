import { requireAdmin } from "@/lib/admin/rbac";
import { PaymentsPageView } from "@/components/admin/views/PaymentsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Payments | Admin | Pexpacks",
};

export default async function AdminPaymentsPage() {
  await requireAdmin({ permission: "payments.view" });
  return <PaymentsPageView />;
}
