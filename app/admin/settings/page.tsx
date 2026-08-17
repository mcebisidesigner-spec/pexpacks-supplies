import { requireAdmin } from "@/lib/admin/rbac";
import { SettingsPageView } from "@/components/admin/views/SettingsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings | Admin | Pexpacks",
};

export default async function AdminSettingsPage() {
  await requireAdmin({ permission: "settings.manage" });
  return <SettingsPageView />;
}
