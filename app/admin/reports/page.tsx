import { requireAdmin } from "@/lib/admin/rbac";
import { ReportsPageView } from "@/components/admin/views/ReportsPageView";
import { defaultRange, getReportSummary, getTopSchools } from "@/lib/admin/reports";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reports | Admin | Pexpacks",
};

export default async function AdminReportsPage() {
  await requireAdmin({ permission: "reports.view" });
  const range = defaultRange();
  const [summary, topSchools] = await Promise.all([
    getReportSummary(range.from, range.to),
    getTopSchools(range.from, range.to, 5),
  ]);
  return <ReportsPageView range={range} summary={summary} topSchools={topSchools} />;
}
