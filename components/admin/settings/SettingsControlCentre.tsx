"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgePercent,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  History,
  LayoutDashboard,
  Save,
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
import {
  PEXCO_CLASSIFICATIONS,
  SYSTEM_SETTING_CATEGORIES,
  SYSTEM_SETTING_DEFINITIONS,
} from "@/lib/admin/system-settings-shared";
import type { RoleInfo, UserListItem } from "@/lib/admin/users";
import {
  exportSettingsAction,
  restoreSettingsAction,
  savePricingSettingsAction,
  updateSystemSettingAction,
} from "@/app/admin/settings/actions";
import type { PexcoAdminRate } from "@/lib/admin/pexco-rates";
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
  initialPexcoRates?: PexcoAdminRate[];
  userEmail: string;
  settingsDbWarning?: string | null;
}

type PexcoRateDraft = {
  coveringSql: string;
};

const PRICING_DRAFT_KEYS = [
  "pricing.target_margin_pct",
  "pricing.low_margin_warning_pct",
  "pricing.packaging_cost",
  "pricing.assembly_cost",
  "pricing.freight_cost",
] as const;

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
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
  initialPexcoRates = [],
  userEmail,
  settingsDbWarning = null,
}: SettingsControlCentreProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] =
    useState<SystemSettingCategory>("user_identity");
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsState, setSettingsState] = useState(initialSettings);
  const [reason] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const setFeedbackMessage = (
    message: string | null,
    type?: "success" | "error",
  ) => {
    if (!message) {
      setFeedback(null);
      return;
    }
    const isPositive =
      type === "success" ||
      (!type &&
        (message.toLowerCase().includes("successfully") ||
          message.toLowerCase().includes("saved") ||
          message.toLowerCase().includes("updated") ||
          message.toLowerCase().includes("complete")));
    setFeedback({
      message,
      type: isPositive ? "success" : "error",
    });
  };
  const [restoreJson, setRestoreJson] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const [pexcoDrafts, setPexcoDrafts] = useState<
    Record<string, PexcoRateDraft>
  >(() =>
    Object.fromEntries(
      PEXCO_CLASSIFICATIONS.map((c) => {
        const rate = initialPexcoRates.find((r) => r.code === c.code);
        return [
          c.code,
          {
            coveringSql: rate ? (rate.coveringPriceCents / 100).toFixed(2) : "",
          },
        ];
      }),
    ),
  );

  const [pricingDrafts, setPricingDrafts] = useState<Record<string, string>>(
    () => {
      const mk = (key: string, fallback: number) => {
        const value = initialSettings[key]?.value;
        return String(
          value === undefined || value === null ? fallback : Number(value),
        );
      };
      return {
        "pricing.target_margin_pct": mk("pricing.target_margin_pct", 49.9),
        "pricing.low_margin_warning_pct": mk(
          "pricing.low_margin_warning_pct",
          35.0,
        ),
        "pricing.packaging_cost": mk("pricing.packaging_cost", 0),
        "pricing.assembly_cost": mk("pricing.assembly_cost", 0),
        "pricing.freight_cost": mk("pricing.freight_cost", 0),
      };
    },
  );

  const filteredSearch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SYSTEM_SETTING_DEFINITIONS.filter(
      (def) =>
        def.key.toLowerCase().includes(q) ||
        def.label.toLowerCase().includes(q) ||
        def.description.toLowerCase().includes(q) ||
        def.category.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [searchQuery]);

  async function handleSettingSave(key: string, newValue: unknown) {
    setBusyKey(key);
    setFeedbackMessage(null);
    try {
      const res = await updateSystemSettingAction(
        key,
        newValue,
        reason || "Updated via Control Centre UI",
      );
      if (res.ok) {
        setFeedbackMessage(res.message ?? "Setting saved.", "success");
        setSettingsState((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            value: newValue,
          },
        }));
        router.refresh();
      } else {
        setFeedbackMessage(res.message ?? "Failed to save setting.", "error");
      }
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : "Error saving setting.",
        "error",
      );
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
      setFeedbackMessage("Export failed.", "error");
    }
  }

  async function handleRestoreSubmit() {
    setBusyKey("restore");
    try {
      const res = await restoreSettingsAction(
        restoreJson,
        reason || "Data Snapshot Restore",
      );
      if (res.ok) {
        setFeedbackMessage(res.message ?? "Restore complete.", "success");
        setShowRestoreModal(false);
        setRestoreJson("");
        router.refresh();
      } else {
        setFeedbackMessage(res.message ?? "Restore failed.", "error");
      }
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : "Restore failed.",
        "error",
      );
    } finally {
      setBusyKey(null);
    }
  }

  function updatePexcoDraft(code: string, patch: Partial<PexcoRateDraft>) {
    setPexcoDrafts((prev) => ({
      ...prev,
      [code]: { ...prev[code], ...patch },
    }));
  }

  function setPricingDraft(key: string, value: string) {
    setPricingDrafts((prev) => ({ ...prev, [key]: value }));
  }

  function draftMarginPercent(): number {
    const raw = parseFloat(pricingDrafts["pricing.target_margin_pct"]);
    if (Number.isFinite(raw) && raw >= 0 && raw < 100) return raw;
    return Number(settingsState["pricing.target_margin_pct"]?.value ?? 49.9);
  }

  async function handleSaveAllChanges() {
    const marginPct = parseFloat(pricingDrafts["pricing.target_margin_pct"]);
    const lowMargin = parseFloat(
      pricingDrafts["pricing.low_margin_warning_pct"],
    );
    const packaging = parseFloat(pricingDrafts["pricing.packaging_cost"]);
    const assembly = parseFloat(pricingDrafts["pricing.assembly_cost"]);
    const freight = parseFloat(pricingDrafts["pricing.freight_cost"]);

    if (!Number.isFinite(marginPct) || marginPct < 0 || marginPct >= 100) {
      setFeedbackMessage(
        "Target Gross Margin % must be a number between 0 and 100.",
      );
      return;
    }
    if (!Number.isFinite(lowMargin) || lowMargin < 0 || lowMargin >= 100) {
      setFeedbackMessage(
        "Low Margin Alert % must be a number between 0 and 100.",
      );
      return;
    }
    const costFields: [number, string][] = [
      [packaging, "Packaging Cost"],
      [assembly, "Assembly Cost"],
      [freight, "Freight / Delivery Cost"],
    ];
    for (const [value, label] of costFields) {
      if (!Number.isFinite(value) || value < 0) {
        setFeedbackMessage(`${label} per Pack must be R0.00 or more.`);
        return;
      }
    }

    const changed = (key: string, value: number) => {
      const saved = settingsState[key]?.value;
      const savedNum = typeof saved === "number" ? saved : Number(saved ?? 0);
      return Math.abs(value - savedNum) > 1e-6;
    };

    const candidateValues = new Map<string, number>([
      ["pricing.target_margin_pct", marginPct],
      ["pricing.low_margin_warning_pct", lowMargin],
      ["pricing.packaging_cost", packaging],
      ["pricing.assembly_cost", assembly],
      ["pricing.freight_cost", freight],
    ]);
    const pricing: { key: string; value: number }[] = [];
    for (const key of PRICING_DRAFT_KEYS) {
      const value = candidateValues.get(key);
      if (value !== undefined && changed(key, value)) {
        pricing.push({ key, value });
      }
    }

    const pexco: { code: string; coveringPriceCents: number }[] = [];
    for (const item of PEXCO_CLASSIFICATIONS) {
      const draft = pexcoDrafts[item.code];
      const raw = draft?.coveringSql?.trim() ?? "";
      const rate = initialPexcoRates.find((r) => r.code === item.code);
      if (!raw) {
        if (rate) {
          setFeedbackMessage(
            `${item.code}: enter a valid Covering Rate (R0.00 or more).`,
          );
          return;
        }
        continue;
      }
      const coveringRands = parseFloat(raw);
      if (!Number.isFinite(coveringRands) || coveringRands < 0) {
        setFeedbackMessage(
          `${item.code}: enter a valid Covering Rate (R0.00 or more).`,
        );
        return;
      }
      const coveringCents = Math.round(coveringRands * 100);
      const baseline = rate?.coveringPriceCents ?? null;
      if (baseline === null || coveringCents !== baseline) {
        pexco.push({ code: item.code, coveringPriceCents: coveringCents });
      }
    }

    if (pricing.length === 0 && pexco.length === 0) {
      setFeedbackMessage("No pending changes to save.");
      return;
    }

    setBusyKey("save-all");
    setFeedbackMessage(null);
    try {
      const res = await savePricingSettingsAction(
        { pricing, pexco },
        "Saved via Control Centre Save Changes",
      );
      if (!res.ok) {
        setFeedbackMessage(res.message ?? "Failed to save pricing changes.", "error");
        return;
      }

      setFeedbackMessage(res.message ?? "All pricing changes saved.", "success");
      setSettingsState((prev) => {
        const next = { ...prev };
        for (const p of pricing) {
          const def = SYSTEM_SETTING_DEFINITIONS.find((d) => d.key === p.key);
          next[p.key] = {
            ...(next[p.key] as SystemSettingRecord),
            key: p.key,
            category: def?.category ?? "pricing",
            value: p.value,
            value_type: def?.valueType ?? "number",
            scope: def?.scope ?? "global",
            description: def?.description ?? "",
            is_sensitive: def?.isSensitive ?? false,
            is_public: def?.isPublic ?? false,
            requires_approval: def?.requiresApproval ?? false,
            version: (next[p.key]?.version ?? 1) + 1,
          };
        }
        return next;
      });
      setPricingDrafts((prev) => {
        const next = { ...prev };
        for (const p of pricing) next[p.key] = String(p.value);
        return next;
      });
      if (res.pexcoRates && res.pexcoRates.length > 0) {
        setPexcoDrafts(
          Object.fromEntries(
            PEXCO_CLASSIFICATIONS.map((c) => {
              const rate = res.pexcoRates.find((r) => r.code === c.code);
              return [
                c.code,
                {
                  coveringSql: rate
                    ? (rate.coveringPriceCents / 100).toFixed(2)
                    : "",
                },
              ];
            }),
          ),
        );
      }
      router.refresh();
    } catch (err) {
      setFeedbackMessage(
        err instanceof Error ? err.message : "Failed to save pricing changes.",
        "error",
      );
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
          <p>
            Super Administrator configuration & business data governance plane
          </p>
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
                      <span className={styles.searchResultTitle}>
                        {def.label}
                      </span>
                      <span className={styles.searchResultCategory}>
                        {def.category}
                      </span>
                    </div>
                    <span className={styles.searchResultDesc}>
                      {def.description}
                    </span>
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
          <span>
            {settingsDbWarning} Current values may be default fallbacks.
          </span>
        </div>
      )}

      {feedback && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: 12,
            background:
              feedback.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border:
              feedback.type === "success"
                ? "1px solid #10b981"
                : "1px solid #ef4444",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} style={{ color: "#10b981", flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
          )}
          <span>{feedback.message}</span>
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

          <button
            type="button"
            className={styles.sidebarSaveAction}
            onClick={handleSaveAllChanges}
            disabled={busyKey === "save-all"}
          >
            <Save className={styles.categoryIcon} aria-hidden="true" />
            {busyKey === "save-all" ? "Saving Changes…" : "Save Changes"}
          </button>
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
                <p>
                  Legal entity registration and customer support communication
                  channels
                </p>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Legal Trading Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    defaultValue={String(
                      settingsState["business.trading_name"]?.value ??
                        "Pexpacks Supplies (Pty) Ltd",
                    )}
                    onBlur={(e) =>
                      handleSettingSave("business.trading_name", e.target.value)
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Customer Support Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    defaultValue={String(
                      settingsState["business.support_email"]?.value ??
                        "helpme@pexpacks.co.za",
                    )}
                    onBlur={(e) =>
                      handleSettingSave(
                        "business.support_email",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Legal & POPIA Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    defaultValue={String(
                      settingsState["business.legal_email"]?.value ??
                        "helpme@pexpacks.co.za",
                    )}
                    onBlur={(e) =>
                      handleSettingSave("business.legal_email", e.target.value)
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Support Telephone</label>
                  <input
                    type="text"
                    className={styles.input}
                    defaultValue={String(
                      settingsState["business.support_phone"]?.value ??
                        "0780036048",
                    )}
                    onBlur={(e) =>
                      handleSettingSave(
                        "business.support_phone",
                        e.target.value,
                      )
                    }
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
                <p>
                  Configure pricing calculation rules, target margins, warning
                  floors &amp; pack-level cost add-ons
                </p>
              </div>

              {/* ── Automated Pricing Warning ─────────────────── */}
              <div className={styles.recalcWarning}>
                <span className={styles.recalcWarningIcon}>⚡</span>
                <div>
                  <strong>Automated Pricing Engine Active</strong>
                  <p>
                    Changing <em>Target Gross Margin %</em>,{" "}
                    <em>Packaging Cost</em>, <em>Assembly Cost</em>, or{" "}
                    <em>Freight Cost</em> will automatically trigger a full
                    recalculation of every Grade Pack&apos;s selling price in
                    the database. This happens instantly via database triggers.
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
                    value={pricingDrafts["pricing.target_margin_pct"]}
                    onChange={(e) =>
                      setPricingDraft(
                        "pricing.target_margin_pct",
                        e.target.value,
                      )
                    }
                  />
                  <span className={styles.hint}>
                    Applied to total landed cost:{" "}
                    <code>Selling Price = Landed Cost ÷ (1 − Margin)</code>.
                    Pexcover covering rates are set per classification in the
                    Pexcover™ panel below. Target:{" "}
                    <strong>{draftMarginPercent().toFixed(1)}%</strong>.
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
                    value={pricingDrafts["pricing.low_margin_warning_pct"]}
                    onChange={(e) =>
                      setPricingDraft(
                        "pricing.low_margin_warning_pct",
                        e.target.value,
                      )
                    }
                  />
                  <span className={styles.hint}>
                    Packs with achieved margin below this floor are flagged with
                    a ⚠️ Low Margin badge.
                  </span>
                </div>

                {/* Packaging Cost */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Packaging Cost per Pack (R)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={pricingDrafts["pricing.packaging_cost"]}
                    onChange={(e) =>
                      setPricingDraft("pricing.packaging_cost", e.target.value)
                    }
                  />
                  <span className={styles.hint}>
                    Added to every Grade Pack&apos;s landed cost before margin
                    is applied.
                  </span>
                </div>

                {/* Assembly Cost */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Assembly Cost per Pack (R)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={pricingDrafts["pricing.assembly_cost"]}
                    onChange={(e) =>
                      setPricingDraft("pricing.assembly_cost", e.target.value)
                    }
                  />
                  <span className={styles.hint}>
                    Labour / assembly fee per Grade Pack included in landed
                    cost.
                  </span>
                </div>

                {/* Freight Cost */}
                <div className={styles.field}>
                  <label className={styles.label}>
                    Freight / Delivery Cost per Pack (R)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={styles.input}
                    value={pricingDrafts["pricing.freight_cost"]}
                    onChange={(e) =>
                      setPricingDraft("pricing.freight_cost", e.target.value)
                    }
                  />
                  <span className={styles.hint}>
                    Inbound logistics / freight allocated per pack in the landed
                    cost model.
                  </span>
                </div>
              </div>

              {/* ── Pricing Precedence ────────────────────────── */}
              <div className={styles.precedenceBox}>
                <h4>Pricing Precedence Hierarchy</h4>
                <p>
                  Global Target Rule &rarr; Category Rule &rarr; Brand Rule
                  &rarr; Product Rule &rarr; Manual Grade Pack Price Override
                </p>
              </div>

              {/* ── Pexcover™ Rates Manager ───────────────────── */}
              <div className={styles.pexcoverRatesPanel}>
                <div className={styles.pexcoverRatesHeader}>
                  <span>📚</span>
                  <div>
                    <strong>Pexcover™ Dynamic Covering Rates</strong>
                    <p>
                      Superuser-editable PEXCO covering rates. Each stationery
                      product classified with a PEXCO code is charged the
                      covering rate you set below, per book per unit. Enter a
                      Rand value (R0.00 or more) next to each classification and
                      press <strong>Save Changes</strong> below the side menu —
                      rates are written directly to the <code>pexco_rates</code>{" "}
                      database table and revalidated on every public school page
                      and at checkout instantly.
                    </p>
                  </div>
                </div>

                <div className={styles.pexcoverClassification}>
                  <strong className={styles.pexcoverClassificationTitle}>
                    PEXCO Classification · Editable Covering Rate
                  </strong>
                  <table className={styles.pexcoverRatesTable}>
                    <thead>
                      <tr>
                        <th>Suggested Code</th>
                        <th>Item Classification</th>
                        <th>Standard Book Dimensions</th>
                        <th>Covering Rate (R)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PEXCO_CLASSIFICATIONS.map((item) => {
                        const draft = pexcoDrafts[item.code];
                        const rate = initialPexcoRates.find(
                          (r) => r.code === item.code,
                        );
                        return (
                          <tr key={item.code}>
                            <td>
                              <code>
                                {item.code}
                                {!rate ? " (New)" : ""}
                              </code>
                            </td>
                            <td>{item.label}</td>
                            <td>{item.dimensions}</td>
                            <td>
                              <span className={styles.pexcoRatePrefix}>R</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={`${styles.input} ${styles.pexcoRateInput}`}
                                value={draft?.coveringSql ?? ""}
                                placeholder="—"
                                onChange={(e) =>
                                  updatePexcoDraft(item.code, {
                                    coveringSql: e.target.value,
                                  })
                                }
                                aria-label={`${item.code} covering rate`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Panel */}
          {activeCategory === "integrations" && (
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2>Integration Status & Health</h2>
                <p>
                  Live operational status of external infrastructure & payment
                  gateways (Secrets are 100% masked)
                </p>
              </div>
              <div className={adminStyles.settingsStatusGrid}>
                {integrations.map((item) => (
                  <div
                    key={item.name}
                    className={adminStyles.settingsStatusCard}
                  >
                    <div>
                      <strong className={adminStyles.cWhite}>
                        {item.name}
                      </strong>
                      <p className={adminStyles.settingsStatusCardPurpose}>
                        {item.purpose}
                      </p>
                      <small className={viewStyles.text11}>
                        {item.details}
                      </small>
                    </div>
                    <span
                      className={
                        item.status === "connected"
                          ? styles.badgeSuccess
                          : styles.badgeWarning
                      }
                    >
                      <CheckCircle2 className={adminStyles.settingsIconCheck} />{" "}
                      {item.status === "connected"
                        ? "Connected"
                        : "Action Required"}
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
                <p>
                  Export system data snapshots, run dry-run imports, & trigger
                  application data restores
                </p>
              </div>
              <div className={`${adminStyles.flex} ${adminStyles.gap14}`}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleExport}
                >
                  <Download className={adminStyles.settingsExportIcon} /> Export
                  Settings Data Snapshot
                </button>
                <button
                  type="button"
                  className={styles.discardButton}
                  onClick={() => setShowRestoreModal(true)}
                >
                  <Upload className={adminStyles.settingsExportIcon} /> Restore
                  Data Snapshot
                </button>
              </div>

              {showRestoreModal && (
                <div className={adminStyles.settingsRestoreSection}>
                  <h3 className={adminStyles.settingsRestoreTitle}>
                    Restore System Settings Snapshot
                  </h3>
                  <p className={adminStyles.settingsRestoreDesc}>
                    Paste the JSON exported snapshot payload to restore
                    configuration parameters.
                  </p>
                  <textarea
                    rows={6}
                    className={styles.textarea}
                    placeholder="Paste settings JSON here..."
                    value={restoreJson}
                    onChange={(e) => setRestoreJson(e.target.value)}
                  />
                  <div className={adminStyles.settingsRestoreActions}>
                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={handleRestoreSubmit}
                      disabled={!restoreJson.trim() || busyKey === "restore"}
                    >
                      Confirm Restore
                    </button>
                    <button
                      type="button"
                      className={styles.discardButton}
                      onClick={() => setShowRestoreModal(false)}
                    >
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
                <p>
                  Immutable log of configuration modifications made by Super
                  Administrators
                </p>
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
                        <td>
                          {new Date(log.created_at).toLocaleString("en-ZA")}
                        </td>
                        <td>{log.actor_email || "System"}</td>
                        <td>
                          <strong className={adminStyles.settingsLogKey}>
                            {log.setting_key}
                          </strong>
                        </td>
                        <td>
                          <code>{JSON.stringify(log.old_value)}</code>
                        </td>
                        <td>
                          <code>{JSON.stringify(log.new_value)}</code>
                        </td>
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
