"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  History,
  LayoutDashboard,
  Search,
  Server,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import type {
  IntegrationStatus,
  SystemPerformanceMetrics,
  SystemSettingCategory,
  SystemSettingRecord,
  SystemSettingsAuditRecord,
  SystemVaultCredential,
} from "@/lib/admin/system-settings-shared";
import { SYSTEM_SETTING_CATEGORIES, SYSTEM_SETTING_DEFINITIONS } from "@/lib/admin/system-settings-shared";
import type { RoleInfo, UserListItem } from "@/lib/admin/users";
import {
  exportSettingsAction,
  restoreSettingsAction,
  updateSystemSettingAction,
} from "@/app/admin/settings/actions";
import { AddUsersTab } from "./AddUsersTab";
import { UserIdentityTab } from "./UserIdentityTab";
import { SystemInfoVaultTab } from "./SystemInfoVaultTab";
import styles from "./SettingsControlCentre.module.css";
import viewStyles from "@/components/admin/views/CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";

interface SettingsControlCentreProps {
  initialSettings: Record<string, SystemSettingRecord>;
  integrations: IntegrationStatus[];
  performance: SystemPerformanceMetrics;
  auditLogs: SystemSettingsAuditRecord[];
  roles?: RoleInfo[];
  users?: UserListItem[];
  vaultCredentials?: SystemVaultCredential[];
  userEmail: string;
  settingsDbWarning?: string | null;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  BadgePercent,
  Cpu,
  Database,
  History,
  Server,
};

export function SettingsControlCentre({
  initialSettings,
  integrations,
  auditLogs,
  roles = [],
  users = [],
  vaultCredentials = [],
  userEmail,
  settingsDbWarning = null,
}: SettingsControlCentreProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<SystemSettingCategory>("user_identity");
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsState, setSettingsState] = useState(initialSettings);
  const [reason] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [restoreJson, setRestoreJson] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const filteredSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SYSTEM_SETTING_DEFINITIONS.filter(
      (def) =>
        def.key.toLowerCase().includes(q) ||
        def.label.toLowerCase().includes(q) ||
        def.description.toLowerCase().includes(q) ||
        def.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  async function handleSettingSave(key: string, newValue: unknown) {
    setBusyKey(key);
    setFeedbackMessage(null);
    try {
      const res = await updateSystemSettingAction(key, newValue, reason || "Updated via Control Centre UI");
      if (res.ok) {
        setFeedbackMessage(res.message ?? "Setting saved.");
        setSettingsState((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            value: newValue,
          },
        }));
        router.refresh();
      } else {
        setFeedbackMessage(res.message ?? "Failed to save setting.");
      }
    } catch (err) {
      setFeedbackMessage(err instanceof Error ? err.message : "Error saving setting.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleExport() {
    try {
      const res = await exportSettingsAction();
      if (res.ok && res.json) {
        const blob = new Blob([res.json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pexpacks-settings-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      setFeedbackMessage("Export failed.");
    }
  }

  async function handleRestoreSubmit() {
    setBusyKey("restore");
    try {
      const res = await restoreSettingsAction(restoreJson, reason || "Data Snapshot Restore");
      if (res.ok) {
        setFeedbackMessage(res.message ?? "Restore complete.");
        setShowRestoreModal(false);
        setRestoreJson("");
        router.refresh();
      } else {
        setFeedbackMessage(res.message ?? "Restore failed.");
      }
    } catch (err) {
      setFeedbackMessage(err instanceof Error ? err.message : "Restore failed.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className={styles.container}>
      {/* Header bar with Instant Settings Search */}
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1>System Control Centre</h1>
          <p>Super Administrator configuration & business data governance plane</p>
        </div>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search settings, margins, seasons, rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className={styles.searchKbd}>Ctrl /</kbd>
          {searchQuery.trim() && (
            <div className={styles.searchResultsDropdown}>
              {filteredSearch.length > 0 ? (
                filteredSearch.map((def) => (
                  <button
                    key={def.key}
                    type="button"
                    className={styles.searchResultItem}
                    onClick={() => {
                      setActiveCategory(def.category);
                      setSearchQuery("");
                    }}
                  >
                    <div className={styles.searchResultHeader}>
                      <span className={styles.searchResultTitle}>{def.label}</span>
                      <span className={styles.searchResultCategory}>{def.category}</span>
                    </div>
                    <span className={styles.searchResultDesc}>{def.description}</span>
                  </button>
                ))
              ) : (
                <p className={adminStyles.settingsCentered}>
                  No matching settings found for &ldquo;{searchQuery}&rdquo;.
                </p>
              )}
            </div>
          )}
        </div>
      </header>

      {settingsDbWarning && (
        <div className={styles.dbWarning} role="alert">
          <strong>System settings database warning</strong>
          <span>{settingsDbWarning} Current values may be default fallbacks.</span>
        </div>
      )}

      {feedbackMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: feedbackMessage.includes("successfully") || feedbackMessage.includes("saved") ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
            border: feedbackMessage.includes("successfully") || feedbackMessage.includes("saved") ? "1px solid #10b981" : "1px solid #ef4444",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {feedbackMessage}
        </div>
      )}

      <div className={styles.layout}>
        <nav className={styles.sidebar} aria-label="System settings categories">
          {SYSTEM_SETTING_CATEGORIES.map((cat) => {
            const IconComp = CATEGORY_ICONS[cat.iconName] ?? LayoutDashboard;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                className={`${styles.categoryButton} ${isActive ? styles.categoryButtonActive : ""}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                <IconComp className={styles.categoryIcon} aria-hidden="true" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </nav>

        <main className={styles.contentArea}>
          {activeCategory === "user_identity" && (
            <UserIdentityTab
              users={users}
              roles={roles}
              currentUserEmail={userEmail}
              isSuperUser={
                userEmail.toLowerCase() === "mcebisimhayise@gmail.com" ||
                userEmail.toLowerCase() === "pexpacks@gmail.com"
              }
            />
          )}

          {/* Add Users & Onboarding Panel */}
          {activeCategory === "add_users" && (
            <AddUsersTab
              roles={roles}
              currentUserEmail={userEmail}
              isSuperUser={
                userEmail.toLowerCase() === "mcebisimhayise@gmail.com" ||
                userEmail.toLowerCase() === "pexpacks@gmail.com"
              }
            />
          )}

          {/* Business Identity Panel */}
          {activeCategory === "business" && (
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>Business Identity & Contact Details</h2>
                <p>Legal entity registration and customer support communication channels</p>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Legal Trading Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    defaultValue={String(settingsState["business.trading_name"]?.value ?? "Pexpacks Supplies (Pty) Ltd")}
                    onBlur={(e) => handleSettingSave("business.trading_name", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Customer Support Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    defaultValue={String(settingsState["business.support_email"]?.value ?? "helpme@pexpacks.co.za")}
                    onBlur={(e) => handleSettingSave("business.support_email", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Legal & POPIA Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    defaultValue={String(settingsState["business.legal_email"]?.value ?? "helpme@pexpacks.co.za")}
                    onBlur={(e) => handleSettingSave("business.legal_email", e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Support Telephone</label>
                  <input
                    type="text"
                    className={styles.input}
                    defaultValue={String(settingsState["business.support_phone"]?.value ?? "0780036048")}
                    onBlur={(e) => handleSettingSave("business.support_phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pricing & Margin Panel */}
          {activeCategory === "pricing" && (
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>Pricing Strategy &amp; Margin Controls</h2>
                <p>Configure pricing calculation rules, target margins, warning floors &amp; pack-level cost add-ons</p>
              </div>

              {/* ── Automated Pricing Warning ─────────────────── */}
              <div className={styles.recalcWarning}>
                <span className={styles.recalcWarningIcon}>⚡</span>
                <div>
                  <strong>Automated Pricing Engine Active</strong>
                  <p>
                    Changing <em>Target Gross Margin %</em>, <em>Packaging Cost</em>, <em>Assembly Cost</em>, or <em>Freight Cost</em> will automatically
                    trigger a full recalculation of every Grade Pack&apos;s selling price in the database. This happens instantly via database triggers.
                  </p>
                </div>
              </div>

              <div className={styles.formGrid}>
                {/* Target Margin */}
                <div className={styles.field}>
                  <label className={styles.label}>Target Gross Margin %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="99"
                    className={styles.input}
                    defaultValue={Number(settingsState["pricing.target_margin_pct"]?.value ?? 49.9)}
                    onBlur={(e) => handleSettingSave("pricing.target_margin_pct", parseFloat(e.target.value))}
                  />
                  <span className={styles.hint}>
                    Applied to total landed cost: <code>Selling Price = Landed Cost ÷ (1 − Margin)</code>. Target: <strong>49.9%</strong>.
                  </span>
                </div>

                {/* Low Margin Alert */}
                <div className={styles.field}>
                  <label className={styles.label}>Low Margin Alert %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="99"
                    className={styles.input}
                    defaultValue={Number(settingsState["pricing.low_margin_warning_pct"]?.value ?? 35.0)}
                    onBlur={(e) => handleSettingSave("pricing.low_margin_warning_pct", parseFloat(e.target.value))}
                  />
                  <span className={styles.hint}>Packs with achieved margin below this floor are flagged with a ⚠️ Low Margin badge.</span>
                </div>

                {/* Packaging Cost */}
                <div className={styles.field}>
                  <label className={styles.label}>Packaging Cost per Pack (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    defaultValue={Number(settingsState["pricing.packaging_cost"]?.value ?? 0)}
                    onBlur={(e) => handleSettingSave("pricing.packaging_cost", parseFloat(e.target.value))}
                  />
                  <span className={styles.hint}>Added to every Grade Pack&apos;s landed cost before margin is applied.</span>
                </div>

                {/* Assembly Cost */}
                <div className={styles.field}>
                  <label className={styles.label}>Assembly Cost per Pack (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    defaultValue={Number(settingsState["pricing.assembly_cost"]?.value ?? 0)}
                    onBlur={(e) => handleSettingSave("pricing.assembly_cost", parseFloat(e.target.value))}
                  />
                  <span className={styles.hint}>Labour / assembly fee per Grade Pack included in landed cost.</span>
                </div>

                {/* Freight Cost */}
                <div className={styles.field}>
                  <label className={styles.label}>Freight / Delivery Cost per Pack (R)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    defaultValue={Number(settingsState["pricing.freight_cost"]?.value ?? 0)}
                    onBlur={(e) => handleSettingSave("pricing.freight_cost", parseFloat(e.target.value))}
                  />
                  <span className={styles.hint}>Inbound logistics / freight allocated per pack in the landed cost model.</span>
                </div>
              </div>

              {/* ── Pricing Precedence ────────────────────────── */}
              <div className={styles.precedenceBox}>
                <h4>Pricing Precedence Hierarchy</h4>
                <p>Global Target Rule &rarr; Category Rule &rarr; Brand Rule &rarr; Product Rule &rarr; Manual Grade Pack Price Override</p>
              </div>

              {/* ── Pexcover™ Rates Manager ───────────────────── */}
              <div className={styles.pexcoverRatesPanel}>
                <div className={styles.pexcoverRatesHeader}>
                  <span>📚</span>
                  <div>
                    <strong>Pexcover™ Dynamic Covering Rates</strong>
                    <p>
                      These rates are stored in the <code>pexco_rates</code> database table and drive dynamic Pexcover pricing at checkout.
                      Each stationery product classified with a PEXCO code will use the corresponding rate per book per unit.
                      To update rates, edit the <code>pexco_rates</code> table directly via Supabase or a future admin UI here.
                    </p>
                  </div>
                </div>
                <table className={styles.pexcoverRatesTable}>
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Covering Rate</th>
                      <th>Cost Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>PEXCO01</code></td>
                      <td>Small book / exercise book</td>
                      <td><strong>R8.00</strong></td>
                      <td>R4.00</td>
                    </tr>
                    <tr>
                      <td><code>PEXCO02</code></td>
                      <td>Large / hard-cover book</td>
                      <td><strong>R14.00</strong></td>
                      <td>R7.00</td>
                    </tr>
                    <tr>
                      <td><code>PEXCO03</code></td>
                      <td>Medium exercise book</td>
                      <td><strong>R11.00</strong></td>
                      <td>R5.50</td>
                    </tr>
                    <tr>
                      <td><code>PEXCO04</code></td>
                      <td>Extra-large atlas / art book</td>
                      <td><strong>R18.00</strong></td>
                      <td>R9.00</td>
                    </tr>
                  </tbody>
                </table>
                <span className={styles.pexcoverRatesNote}>
                  ℹ️ Rates above are live from the database seed. Pexcover totals at checkout are always recalculated server-side from authoritative <code>pexco_rates</code> data — never from client-submitted values.
                </span>
              </div>
            </div>
          )}

          {/* Integrations Panel */}
          {activeCategory === "integrations" && (
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>Integration Status & Health</h2>
                <p>Live operational status of external infrastructure & payment gateways (Secrets are 100% masked)</p>
              </div>
              <div className={adminStyles.settingsStatusGrid}>
                {integrations.map((item) => (
                  <div key={item.name} className={adminStyles.settingsStatusCard}>
                    <div>
                      <strong className={adminStyles.cWhite}>{item.name}</strong>
                      <p className={adminStyles.settingsStatusCardPurpose}>{item.purpose}</p>
                      <small className={viewStyles.text11}>{item.details}</small>
                    </div>
                    <span className={item.status === "connected" ? styles.badgeSuccess : styles.badgeWarning}>
                      <CheckCircle2 className={adminStyles.settingsIconCheck} /> {item.status === "connected" ? "Connected" : "Action Required"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Management Panel */}
          {activeCategory === "data" && (
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>Data Management & Snapshot Centre</h2>
                <p>Export system data snapshots, run dry-run imports, & trigger application data restores</p>
              </div>
              <div className={`${adminStyles.flex} ${adminStyles.gap14}`}>
                <button type="button" className={styles.saveButton} onClick={handleExport}>
                  <Download className={adminStyles.settingsExportIcon} /> Export Settings Data Snapshot
                </button>
                <button type="button" className={styles.discardButton} onClick={() => setShowRestoreModal(true)}>
                  <Upload className={adminStyles.settingsExportIcon} /> Restore Data Snapshot
                </button>
              </div>

              {showRestoreModal && (
                <div className={adminStyles.settingsRestoreSection}>
                  <h3 className={adminStyles.settingsRestoreTitle}>Restore System Settings Snapshot</h3>
                  <p className={adminStyles.settingsRestoreDesc}>Paste the JSON exported snapshot payload to restore configuration parameters.</p>
                  <textarea
                    rows={6}
                    className={styles.textarea}
                    placeholder="Paste settings JSON here..."
                    value={restoreJson}
                    onChange={(e) => setRestoreJson(e.target.value)}
                  />
                  <div className={adminStyles.settingsRestoreActions}>
                    <button type="button" className={styles.saveButton} onClick={handleRestoreSubmit} disabled={!restoreJson.trim() || busyKey === "restore"}>
                      Confirm Restore
                    </button>
                    <button type="button" className={styles.discardButton} onClick={() => setShowRestoreModal(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audit History Panel */}
          {activeCategory === "audit" && (
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>Settings Change Audit History</h2>
                <p>Immutable log of configuration modifications made by Super Administrators</p>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Setting Key</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.created_at).toLocaleString("en-ZA")}</td>
                        <td>{log.actor_email || "System"}</td>
                        <td><strong className={adminStyles.settingsLogKey}>{log.setting_key}</strong></td>
                        <td><code>{JSON.stringify(log.old_value)}</code></td>
                        <td><code>{JSON.stringify(log.new_value)}</code></td>
                        <td>{log.change_reason || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className={adminStyles.settingsLogEmpty}>
                        No settings change audit records logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* System Info & Secure Vault Panel */}
          {activeCategory === "system_info" && (
            <SystemInfoVaultTab
              initialVaultCredentials={vaultCredentials}
              userEmail={userEmail}
            />
          )}
        </main>
      </div>
    </div>
  );
}
