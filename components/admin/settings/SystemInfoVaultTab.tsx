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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { SystemVaultCredential } from "@/lib/admin/system-settings-shared";
import {
  saveVaultCredentialAction,
  deleteVaultCredentialAction,
} from "@/app/admin/settings/actions";
import styles from "./SettingsControlCentre.module.css";

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
  const [credentials, setCredentials] = useState<SystemVaultCredential[]>(
    initialVaultCredentials
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
        (c.additionalInfo || "").toLowerCase().includes(q)
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
      setFeedback({ type: "error", text: "Product / Service name is required." });
      return;
    }
    if (!username.trim()) {
      setFeedback({ type: "error", text: "Username / Client ID is required." });
      return;
    }
    if (!password.trim()) {
      setFeedback({ type: "error", text: "Password / Secret token is required." });
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

  function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to permanently delete the vault credential for "${name}"?`)) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Security & Shield Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(9, 14, 23, 0.95) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.35)",
          borderRadius: "14px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "rgba(168, 85, 247, 0.2)",
                color: "#c084fc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={18} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Secure System &amp; Database Vault
            </h2>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "rgba(168, 85, 247, 0.25)",
                color: "#e9d5ff",
                letterSpacing: "0.05em",
              }}
            >
              Superuser Gated
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
            Encrypted vault designated for safely storing and referencing sensitive credentials, database keys,
            and operational parameters. Records are strictly accessible to authorized Superusers and masked by default.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(51, 65, 85, 0.6)",
              borderRadius: "10px",
              padding: "12px 18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>
              Vault Records
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#c084fc", marginTop: "2px" }}>
              {credentials.length}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor:
              feedback.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border:
              feedback.type === "success"
                ? "1px solid rgba(16, 185, 129, 0.35)"
                : "1px solid rgba(239, 68, 68, 0.35)",
            color: feedback.type === "success" ? "#34d399" : "#f87171",
            fontSize: "0.875rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Input / Edit Form Card */}
      <div className={styles.panelCard}>
        <div className={styles.panelHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <KeyRound size={20} style={{ color: "#38bdf8" }} />
            <div>
              <h2 style={{ margin: 0 }}>
                {editingId ? "Edit Vault Credential Record" : "Input New System Credential"}
              </h2>
              <p style={{ margin: "2px 0 0" }}>
                {editingId
                  ? "Update the selected database or operational service credentials"
                  : "Enter the product name, username, password, and additional context to safely store in the DB"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className={styles.formGrid}>
            {/* Product Name */}
            <div className={styles.field}>
              <label className={styles.label}>
                Product / Service / Provider Name <span style={{ color: "#ef4444" }}>*</span>
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
              <span className={styles.hint}>Target system, database cluster, or external SaaS service.</span>
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
              <span className={styles.hint}>Grouping for organized referencing and filtering.</span>
            </div>

            {/* Username / Account */}
            <div className={styles.field}>
              <label className={styles.label}>
                Username / Client ID / Account Key <span style={{ color: "#ef4444" }}>*</span>
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
              <span className={styles.hint}>Authorized principal or service account login username.</span>
            </div>

            {/* Password / Secret */}
            <div className={styles.field}>
              <label className={styles.label}>
                Password / Secret Token / Private Key <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={formPasswordVisible ? "text" : "password"}
                  className={styles.input}
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
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={formPasswordVisible ? "Hide password" : "Show password"}
                >
                  {formPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span className={styles.hint}>Stored with encryption; masked on display.</span>
            </div>
          </div>

          {/* Additional Relevant Information */}
          <div className={styles.field}>
            <label className={styles.label}>Additional Relevant Information &amp; Operational Notes</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="e.g. Host URI: db.rjuvicgqwryztwytnauo.supabase.co | Port: 5432 | Region: eu-west-1 | Failover notes..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              maxLength={1000}
            />
            <span className={styles.hint}>
              Include connection URIs, port numbers, regional endpoints, or backup procedures.
            </span>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
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
              className={styles.saveButton}
              disabled={isPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 24px",
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              {isPending ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> {editingId ? "Update Vault Record" : "Save Credential Record"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Stored Records Display */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Structured Stored Credentials
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "2px 0 0" }}>
              Encrypted credentials stored in the DB. Click reveal to view passwords or copy directly.
            </p>
          </div>

          <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stored credentials..."
              style={{
                width: "100%",
                height: "38px",
                paddingLeft: "36px",
                paddingRight: "12px",
                backgroundColor: "#090e17",
                border: "1px solid rgba(51, 65, 85, 0.7)",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "0.8125rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        {filteredCredentials.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
            {filteredCredentials.map((cred) => {
              const isRevealed = revealedIds.has(cred.id);
              const isCopied = copiedId === cred.id;

              return (
                <div
                  key={cred.id}
                  style={{
                    backgroundColor: "#090e17",
                    border: "1px solid rgba(51, 65, 85, 0.7)",
                    borderRadius: "12px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                          {cred.productName}
                        </h4>
                      </div>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "6px",
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: "rgba(56, 189, 248, 0.15)",
                          border: "1px solid rgba(56, 189, 248, 0.3)",
                          color: "#38bdf8",
                        }}
                      >
                        {cred.category || "Database"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
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
                        title="Edit credential"
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
                        title="Delete credential"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#060a10", padding: "12px", borderRadius: "8px", border: "1px solid rgba(30, 41, 59, 0.8)" }}>
                    {/* Username */}
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                        Username / Account ID
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
                        <code style={{ fontSize: "12px", color: "#38bdf8", wordBreak: "break-all" }}>
                          {cred.username}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(cred.username, `${cred.id}-user`)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: copiedId === `${cred.id}-user` ? "#34d399" : "#64748b",
                            cursor: "pointer",
                            padding: "2px 6px",
                          }}
                          title="Copy username"
                        >
                          {copiedId === `${cred.id}-user` ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Password / Secret */}
                    <div style={{ borderTop: "1px solid rgba(30, 41, 59, 0.6)", paddingTop: "8px" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                        Password / Secret Token
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginTop: "2px" }}>
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

                        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
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
                            title={isRevealed ? "Hide" : "Reveal"}
                          >
                            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(cred.password, cred.id)}
                            style={{
                              background: isCopied ? "rgba(16, 185, 129, 0.2)" : "rgba(51, 65, 85, 0.5)",
                              border: "none",
                              borderRadius: "4px",
                              color: isCopied ? "#34d399" : "#94a3b8",
                              cursor: "pointer",
                              padding: "4px 6px",
                              display: "flex",
                              alignItems: "center",
                            }}
                            title="Copy password"
                          >
                            {isCopied ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    {cred.additionalInfo && (
                      <div style={{ borderTop: "1px solid rgba(30, 41, 59, 0.6)", paddingTop: "8px" }}>
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                          Additional Info &amp; Notes
                        </div>
                        <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "2px", whiteSpace: "pre-wrap" }}>
                          {cred.additionalInfo}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Updated: {new Date(cred.updatedAt).toLocaleDateString("en-ZA")}</span>
                    <span>By: {cred.updatedBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "#090e17",
              borderRadius: "12px",
              border: "1px dashed rgba(51, 65, 85, 0.8)",
              color: "#64748b",
            }}
          >
            <KeyRound size={32} style={{ margin: "0 auto 12px", color: "#475569" }} />
            <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "#94a3b8" }}>
              {searchQuery ? "No matching credentials found." : "No credentials stored in the vault yet."}
            </div>
            <p style={{ fontSize: "0.8125rem", margin: "4px 0 0" }}>
              Use the form above to add your first database or service credential.
            </p>
          </div>
        )}
      </div>

      {/* System Infrastructure Diagnostics Table */}
      <div className={styles.panelCard} style={{ marginTop: "12px" }}>
        <div className={styles.panelHeader}>
          <h2>Core System Platform &amp; Infrastructure Information</h2>
          <p>Read-only environment and platform details</p>
        </div>
        <table className={styles.table}>
          <tbody>
            <tr>
              <td><strong>Application Environment</strong></td>
              <td>Production (Live Operations)</td>
            </tr>
            <tr>
              <td><strong>Hosting Platform</strong></td>
              <td>Vercel Edge Network</td>
            </tr>
            <tr>
              <td><strong>Database Provider</strong></td>
              <td>Supabase Postgres (Region: eu-west-1 / Ireland)</td>
            </tr>
            <tr>
              <td><strong>Email Provider</strong></td>
              <td>Resend Transactional API</td>
            </tr>
            <tr>
              <td><strong>Database Security Policy</strong></td>
              <td>Row Level Security (RLS) &amp; Superuser AES Vault Activated</td>
            </tr>
            <tr>
              <td><strong>Migration Version</strong></td>
              <td>00032_system_settings_control_centre.sql</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
