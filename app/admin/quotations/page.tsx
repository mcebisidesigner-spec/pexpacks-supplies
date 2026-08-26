import { requireAdmin } from "@/lib/admin/rbac";
import { listQuotations } from "@/lib/admin/quotations";
import { QuotationsListView } from "@/components/admin/quotations/QuotationsListView";

export const metadata = {
  title: "Quotations | Admin | Pexpacks",
  description: "Manage school quotations, price proposals, and branded PDF generation.",
};

export default async function QuotationsPage() {
  await requireAdmin({ permission: "orders.view" });
  const data = await listQuotations({ pageSize: 100 });

  return <QuotationsListView initialData={data} />;
}
