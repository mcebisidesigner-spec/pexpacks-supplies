import { requireAdmin } from "@/lib/admin/rbac";
import {
  getSystemSettings,
  getSystemSettingsAuditLogs,
  getIntegrationHealth,
  getPerformanceMetrics,
} from "@/lib/admin/system-settings";
import { SettingsControlCentre } from "@/components/admin/settings/SettingsControlCentre";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings Control Centre | Admin | Pexpacks",
};

export default async function AdminSettingsPage() {
  const session = await requireAdmin({ permission: "settings.manage" });

  const [settings, auditLogs, integrations, performance] = await Promise.all([
    getSystemSettings(),
    getSystemSettingsAuditLogs(20),
    getIntegrationHealth(),
    getPerformanceMetrics(),
  ]);

  return (
    <SettingsControlCentre
      initialSettings={settings}
      integrations={integrations}
      performance={performance}
      auditLogs={auditLogs}
      userEmail={session.user.email ?? ""}
    />
  );
}
