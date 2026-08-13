import { requireAdmin, displayName } from "@/lib/admin/rbac";
import { getDashboardStats } from "@/lib/admin/dashboard";
import DashboardClient from "@/components/admin/DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdmin({ permission: "dashboard.view" });
  const stats = await getDashboardStats();
  const name = displayName(session.user);

  return <DashboardClient stats={stats} userName={name ?? "Staff"} />;
}
