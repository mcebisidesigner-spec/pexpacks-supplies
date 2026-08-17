import { requireAdmin } from "@/lib/admin/rbac";
import { ReportsPageView } from "@/components/admin/views/ReportsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reports | Admin | Pexpacks",
};

export default async function AdminReportsPage() {
  await requireAdmin({ permission: "reports.view" });
  return <ReportsPageView />;
}
