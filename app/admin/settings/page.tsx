import { requireSuperAdmin } from "@/lib/admin/rbac";
import {
  getSystemSettings,
  getSystemSettingsAuditLogs,
  getIntegrationHealth,
  getPerformanceMetrics,
  getSystemVaultCredentials,
  checkSystemSettingsHealth,
} from "@/lib/admin/system-settings";
import { listRoles, listUsers } from "@/lib/admin/users";
import { listPexcoRates } from "@/lib/admin/pexco-rates";
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
    settingsHealth,
    pexcoRates,
  ] = await Promise.all([
    getSystemSettings(),
    getSystemSettingsAuditLogs(20),
    getIntegrationHealth(),
    getPerformanceMetrics(),
    listRoles(),
    listUsers({ pageSize: 50 }),
    getSystemVaultCredentials(),
    checkSystemSettingsHealth(),
    listPexcoRates(),
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
      initialPexcoRates={pexcoRates}
      userEmail={session.user.email ?? ""}
      settingsDbWarning={
        settingsHealth.ok
          ? null
          : (settingsHealth.message ??
            "System settings database is unavailable.")
      }
    />
  );
}
