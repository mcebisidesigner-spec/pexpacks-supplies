import { requireAdmin, displayName } from "@/lib/admin/rbac";
import { getDashboardStats } from "@/lib/admin/dashboard";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [session, stats] = await Promise.all([
    requireAdmin({ permission: "dashboard.view" }),
    getDashboardStats(),
  ]);

  const name = displayName(session.user);

  return <DashboardClient stats={stats} userName={name} />;
}



