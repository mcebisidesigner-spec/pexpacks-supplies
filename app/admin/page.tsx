import { requireAdmin } from "@/lib/admin/rbac";
import { getDashboardStats } from "@/lib/admin/dashboard";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin({ permission: "dashboard.view" });
  const stats = await getDashboardStats();
  return <DashboardClient stats={stats} />;
}
