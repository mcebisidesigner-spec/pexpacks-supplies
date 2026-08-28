import { requireAdmin } from "@/lib/admin/rbac";
import {
  getSystemSettings,
  getSystemSettingsAuditLogs,
  getIntegrationHealth,
  getPerformanceMetrics,
} from "@/lib/admin/system-settings";
import { listRoles } from "@/lib/admin/users";
import { SettingsControlCentre } from "@/components/admin/settings/SettingsControlCentre";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings Control Centre | Admin | Pexpacks",
};

export default async function AdminSettingsPage() {
  const session = await requireAdmin({ permission: "settings.manage" });

  const [settings, auditLogs, integrations, performance, roles] = await Promise.all([
    getSystemSettings(),
    getSystemSettingsAuditLogs(20),
    getIntegrationHealth(),
    getPerformanceMetrics(),
    listRoles(),
  ]);

  return (
    <SettingsControlCentre
      initialSettings={settings}
      integrations={integrations}
      performance={performance}
      auditLogs={auditLogs}
      roles={roles}
      userEmail={session.user.email ?? ""}
    />
  );
}
