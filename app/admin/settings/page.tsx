import { requireSuperAdmin } from "@/lib/admin/rbac";
import {
  getSystemSettings,
  getSystemSettingsAuditLogs,
  getIntegrationHealth,
  getPerformanceMetrics,
  getSystemVaultCredentials,
} from "@/lib/admin/system-settings";
import { listRoles, listUsers } from "@/lib/admin/users";
import { SettingsControlCentre } from "@/components/admin/settings/SettingsControlCentre";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings Control Centre | Admin | Pexpacks",
};

export default async function AdminSettingsPage() {
  const session = await requireSuperAdmin();

  const [
    settings,
    auditLogs,
    integrations,
    performance,
    roles,
    usersResult,
    vaultCredentials,
  ] = await Promise.all([
    getSystemSettings(),
    getSystemSettingsAuditLogs(20),
    getIntegrationHealth(),
    getPerformanceMetrics(),
    listRoles(),
    listUsers({ pageSize: 50 }),
    getSystemVaultCredentials(),
  ]);

  return (
    <SettingsControlCentre
      initialSettings={settings}
      integrations={integrations}
      performance={performance}
      auditLogs={auditLogs}
      roles={roles}
      users={usersResult.users}
      vaultCredentials={vaultCredentials}
      userEmail={session.user.email ?? ""}
    />
  );
}
