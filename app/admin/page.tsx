import { requireAdmin } from "@/lib/admin/rbac";
import { getDashboardStats } from "@/lib/admin/dashboard";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [, stats] = await Promise.all([
    requireAdmin({ permission: "dashboard.view" }),
    getDashboardStats(),
  ]);

  return <DashboardClient stats={stats} />;
}



