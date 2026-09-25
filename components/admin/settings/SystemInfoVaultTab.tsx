"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import type { SystemVaultCredential } from "@/lib/admin/system-settings-shared";
import {
  saveVaultCredentialAction,
  deleteVaultCredentialAction,
} from "@/app/admin/settings/actions";
import { useAdminDialog } from "@/components/admin/ui/AdminDialogContext";
import { DbNotice } from "@/components/admin/ui/DbNotice";
import styles from "./settingsStyles";

interface SystemInfoVaultTabProps {
  initialVaultCredentials?: SystemVaultCredential[];
  userEmail: string;
}

const VAULT_CATEGORIES = [
  "Database",
  "API Service",
  "Authentication",
  "Payment Gateway",
  "Cloud & Hosting",
  "Other Operations",
];

export function SystemInfoVaultTab({
  initialVaultCredentials = [],
}: SystemInfoVaultTabProps) {
  const router = useRouter();
  const dialog = useAdminDialog();
  const [credentials, setCredentials] = useState<SystemVaultCredential[]>(
    initialVaultCredentials,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("Database");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [formPasswordVisible, setFormPasswordVisible] = useState(false);

  // Card Reveal States
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredCredentials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return credentials;
    return credentials.filter(
      (c) =>
        c.productName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.additionalInfo || "").toLowerCase().includes(q),
    );
  }, [credentials, searchQuery]);

  function toggleReveal(id: string) {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleStartEdit(cred: SystemVaultCredential) {
    setEditingId(cred.id);
    setProductName(cred.productName);
    setCategory(cred.category || "Database");
    setUsername(cred.username);
    setPassword(cred.password);
    setAdditionalInfo(cred.additionalInfo || "");
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setProductName("");
    setCategory("Database");
    setUsername("");
    setPassword("");
    setAdditionalInfo("");
    setFeedback(null);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!productName.trim()) {
      setFeedback({
        type: "error",
        text: "Product / Service name is required.",
      });
      return;
    }
    if (!username.trim()) {
      setFeedback({ type: "error", text: "Username / Client ID is required." });
      return;
    }
    if (!password.trim()) {
      setFeedback({
        type: "error",
        text: "Password / Secret token is required.",
      });
      return;
    }

    startTransition(async () => {
      const res = await saveVaultCredentialAction({
        id: editingId || undefined,
        productName,
        category,
        username,
        password,
        additionalInfo,
      });

      if (res.ok && res.credentials) {
        setCredentials(res.credentials);
        setFeedback({
          type: "success",
          text: `Credential record for "${productName}" securely saved to vault.`,
        });
        handleCancelEdit();
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to save credential.",
        });
      }
    });
  }

  async function handleDelete(id: string, name: string) {
    const confirmed = await dialog.confirm({
      title: "Delete Vault Credential",
      message: `Are you sure you want to permanently delete the vault credential for "${name}"?`,
      confirmLabel: "Delete Permanently",
      variant: "danger",
    });
    if (!confirmed) {
      return;
    }
    setFeedback(null);

    startTransition(async () => {
      const res = await deleteVaultCredentialAction(id);
      if (res.ok && res.credentials) {
        setCredentials(res.credentials);
        setFeedback({
          type: "success",
          text: `Credential for "${name}" removed from vault.`,
        });
        if (editingId === id) handleCancelEdit();
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to delete credential.",
        });
      }
    });
  }

  return (
    <div className="flex w-full flex-col gap-7">
      {/* Security & Shield Banner */}
      <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-violet-400/35 bg-[linear-gradient(135deg,rgba(168,85,247,0.12)_0%,rgba(9,14,23,0.95)_100%)] p-5 sm:flex-row sm:p-6 lg:px-7">
        <div className="max-w-2xl">
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-400/20 text-violet-300">
              <Lock size={18} />
            </div>
            <h2 className="m-0 text-xl font-bold tracking-tight text-white">
              Secure System &amp; Database Vault
            </h2>
            <span className="rounded-md bg-violet-400/25 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-violet-100">
              Superuser Gated
            </span>
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-400">
            Encrypted vault designated for safely storing and referencing
            sensitive credentials, database keys, and operational parameters.
            Records are strictly accessible to authorized Superusers and masked
            by default.
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-center">
            <div className="text-[11px] font-semibold uppercase text-slate-500">
              Vault Records
            </div>
            <div className="mt-0.5 text-2xl font-extrabold tabular-nums text-violet-300">
              {credentials.length}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <DbNotice
          type={feedback.type}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Input / Edit Form Card */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <div className="flex items-center gap-2.5">
            <KeyRound size={20} className="text-sky-400" />
            <div>
              <h2 className="m-0">
                {editingId
                  ? "Edit Vault Credential Record"
                  : "Input New System Credential"}
              </h2>
              <p className="mt-0.5">
                {editingId
                  ? "Update the selected database or operational service credentials"
                  : "Enter the product name, username, password, and additional context to safely store in the DB"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-[18px]">
          <div className={styles.formGrid}>
            {/* Product Name */}
            <div className={styles.field}>
              <label className={styles.label}>
                Product / Service / Provider Name{" "}
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Supabase DB Production, Resend API, Vercel Host..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                maxLength={120}
                required
              />
              <span className={styles.hint}>
                Target system, database cluster, or external SaaS service.
              </span>
            </div>

            {/* Category */}
            <div className={styles.field}>
              <label className={styles.label}>Module Category</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {VAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className={styles.hint}>
                Grouping for organized referencing and filtering.
              </span>
            </div>

            {/* Username / Account */}
            <div className={styles.field}>
              <label className={styles.label}>
                Username / Client ID / Account Key{" "}
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. postgres, admin@pexpacks.co.za, app_client_id..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={120}
                required
              />
              <span className={styles.hint}>
                Authorized principal or service account login username.
              </span>
            </div>

            {/* Password / Secret */}
            <div className={styles.field}>
              <label className={styles.label}>
                Password / Secret Token / Private Key{" "}
                <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={formPasswordVisible ? "text" : "password"}
                  className={`${styles.input} pr-11`}
                  placeholder="Enter secure password or secret..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={500}
                  style={{ paddingRight: "44px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setFormPasswordVisible((v) => !v)}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center p-1 text-slate-500 transition-colors hover:text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                  data-db-tooltip={
                    formPasswordVisible ? "Hide password" : "Show password"
                  }
                >
                  {formPasswordVisible ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              <span className={styles.hint}>
                Stored with encryption; masked on display.
              </span>
            </div>
          </div>

          {/* Additional Relevant Information */}
          <div className={styles.field}>
            <label className={styles.label}>
              Additional Relevant Information &amp; Operational Notes
            </label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="e.g. Host URI: db.rjuvicgqwryztwytnauo.supabase.co | Port: 5432 | Region: eu-west-1 | Failover notes..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              maxLength={1000}
            />
            <span className={styles.hint}>
              Include connection URIs, port numbers, regional endpoints, or
              backup procedures.
            </span>
          </div>

          {/* Form Actions */}
          <div className="mt-2 flex items-center justify-end gap-3">
            {editingId && (
              <button
                type="button"
                className={styles.discardButton}
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                Cancel Edit
              </button>
            )}

            <button
              type="submit"
              className={`${styles.saveButton} px-6 font-bold`}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />{" "}
                  {editingId ? "Update Vault Record" : "Save Credential Record"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Stored Records Display */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="m-0 text-lg font-bold text-white">
              Structured Stored Credentials
            </h3>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Encrypted credentials stored in the DB. Click reveal to view
              passwords or copy directly.
            </p>
          </div>

          <div className="relative w-full sm:max-w-[340px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stored credentials..."
              className="h-10 w-full rounded-lg border border-slate-700/70 bg-[#090e17] py-0 pl-9 pr-3 text-[13px] text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
            />
          </div>
        </div>

        {filteredCredentials.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(360px,1fr))] gap-4">
            {filteredCredentials.map((cred) => {
              const isRevealed = revealedIds.has(cred.id);
              const isCopied = copiedId === cred.id;

              return (
                <div
                  key={cred.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-700/70 bg-[#090e17] p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="m-0 text-base font-bold text-white">
                          {cred.productName}
                        </h4>
                      </div>
                      <span className="mt-1.5 inline-block rounded-md border border-sky-400/30 bg-sky-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-400">
                        {cred.category || "Database"}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(cred)}
                        style={{
                          background: "rgba(51, 65, 85, 0.4)",
                          border: "1px solid rgba(71, 85, 105, 0.6)",
                          borderRadius: "6px",
                          padding: "6px 8px",
                          color: "#94a3b8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                        }}
                        data-db-tooltip="Edit credential"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cred.id, cred.productName)}
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          borderRadius: "6px",
                          padding: "6px 8px",
                          color: "#f87171",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                        }}
                        data-db-tooltip="Delete credential"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      backgroundColor: "#060a10",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(30, 41, 59, 0.8)",
                    }}
                  >
                    {/* Username */}
                    <div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        Username / Account ID
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: "2px",
                        }}
                      >
                        <code
                          style={{
                            fontSize: "12px",
                            color: "#38bdf8",
                            wordBreak: "break-all",
                          }}
                        >
                          {cred.username}
                        </code>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(cred.username, `${cred.id}-user`)
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            color:
                              copiedId === `${cred.id}-user`
                                ? "#34d399"
                                : "#64748b",
                            cursor: "pointer",
                            padding: "2px 6px",
                          }}
                          data-db-tooltip="Copy username"
                        >
                          {copiedId === `${cred.id}-user` ? (
                            <Check size={13} />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password / Secret */}
                    <div
                      style={{
                        borderTop: "1px solid rgba(30, 41, 59, 0.6)",
                        paddingTop: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        Password / Secret Token
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          marginTop: "2px",
                        }}
                      >
                        <code
                          style={{
                            fontSize: "12px",
                            color: isRevealed ? "#f8fafc" : "#94a3b8",
                            fontFamily: "monospace",
                            wordBreak: "break-all",
                          }}
                        >
                          {isRevealed ? cred.password : "••••••••••••••••"}
                        </code>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            flexShrink: 0,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleReveal(cred.id)}
                            style={{
                              background: "rgba(51, 65, 85, 0.5)",
                              border: "none",
                              borderRadius: "4px",
                              color: isRevealed ? "#38bdf8" : "#94a3b8",
                              cursor: "pointer",
                              padding: "4px 6px",
                              display: "flex",
                              alignItems: "center",
                            }}
                            data-db-tooltip={isRevealed ? "Hide" : "Reveal"}
                          >
                            {isRevealed ? (
                              <EyeOff size={13} />
                            ) : (
                              <Eye size={13} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(cred.password, cred.id)}
                            style={{
                              background: isCopied
                                ? "rgba(16, 185, 129, 0.2)"
                                : "rgba(51, 65, 85, 0.5)",
                              border: "none",
                              borderRadius: "4px",
                              color: isCopied ? "#34d399" : "#94a3b8",
                              cursor: "pointer",
                              padding: "4px 6px",
                              display: "flex",
                              alignItems: "center",
                            }}
                            data-db-tooltip="Copy password"
                          >
                            {isCopied ? (
                              <Check size={13} />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    {cred.additionalInfo && (
                      <div
                        style={{
                          borderTop: "1px solid rgba(30, 41, 59, 0.6)",
                          paddingTop: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        >
                          Additional Info &amp; Notes
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#cbd5e1",
                            marginTop: "2px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {cred.additionalInfo}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#64748b",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      Updated:{" "}
                      {new Date(cred.updatedAt).toLocaleDateString("en-ZA")}
                    </span>
                    <span>By: {cred.updatedBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700/80 bg-[#090e17] p-10 text-center text-slate-500">
            <KeyRound size={32} className="mx-auto mb-3 text-slate-600" />
            <div className="text-[15px] font-semibold text-slate-400">
              {searchQuery
                ? "No matching credentials found."
                : "No credentials stored in the vault yet."}
            </div>
            <p className="mt-1 text-[13px]">
              Use the form above to add your first database or service
              credential.
            </p>
          </div>
        )}
      </div>

      {/* System Infrastructure Diagnostics Table */}
      <div className={`${styles.panelCard} mt-3`}>
        <div className={styles.panelHeader}>
          <h2>Core System Platform &amp; Infrastructure Information</h2>
          <p>Read-only environment and platform details</p>
        </div>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td>
                <strong>Application Environment</strong>
              </td>
              <td>Production (Live Operations)</td>
            </tr>
            <tr>
              <td>
                <strong>Hosting Platform</strong>
              </td>
              <td>Vercel Edge Network</td>
            </tr>
            <tr>
              <td>
                <strong>Database Provider</strong>
              </td>
              <td>Supabase Postgres (Region: eu-west-1 / Ireland)</td>
            </tr>
            <tr>
              <td>
                <strong>Email Provider</strong>
              </td>
              <td>Resend Transactional API</td>
            </tr>
            <tr>
              <td>
                <strong>Database Security Policy</strong>
              </td>
              <td>
                Row Level Security (RLS) &amp; Superuser AES Vault Activated
              </td>
            </tr>
            <tr>
              <td>
                <strong>Migration Version</strong>
              </td>
              <td>00032_system_settings_control_centre.sql</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
