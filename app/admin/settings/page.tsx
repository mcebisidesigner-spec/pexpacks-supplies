import { requireAdmin } from "@/lib/admin/rbac";
import {
  getSystemSettings,
  getIntegrationHealth,
  getPerformanceMetrics,
  getSystemSettingsAuditLogs,
} from "@/lib/admin/system-settings";
import { SettingsControlCentre } from "@/components/admin/settings/SettingsControlCentre";

export const metadata = {
  title: "System Control Centre | Admin | Pexpacks",
};

export default async function SettingsPage() {
  const session = await requireAdmin({ permission: "settings.manage" });
  const [settings, integrations, performance, auditLogs] = await Promise.all([
    getSystemSettings(),
    getIntegrationHealth(),
    getPerformanceMetrics(),
    getSystemSettingsAuditLogs(50),
  ]);

  return (
    <SettingsControlCentre
      initialSettings={settings}
      integrations={integrations}
      performance={performance}
      auditLogs={auditLogs}
      userEmail={session.user.email ?? "admin@pexpacks.co.za"}
    />
  );
}
