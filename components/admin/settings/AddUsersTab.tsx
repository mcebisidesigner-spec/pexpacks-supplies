"use client";

import { useState, useTransition, useMemo } from "react";
import {
  UserPlus,
  User,
  Building,
  Shield,
  Send,
  CheckCircle2,
  AlertCircle,
  Info,
  Check,
} from "lucide-react";
import { inviteUserFromSettingsAction } from "@/app/admin/settings/actions";
import type { RoleInfo } from "@/lib/admin/users";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/adminStyles";

interface AddUsersTabProps {
  roles: RoleInfo[];
  currentUserEmail?: string;
  isSuperUser?: boolean;
}

const DEPARTMENTS = [
  "Executive & Management",
  "School Relationships & Partnerships",
  "Procurement & Supply Chain",
  "Warehouse & Order Fulfilment",
  "Finance & Accounts",
  "Customer Support & Success",
  "Catalog & Content Management",
];

export function AddUsersTab({ roles, isSuperUser = false }: AddUsersTabProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["viewer"]);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
    tempPassword?: string;
  } | null>(null);
  const [copiedTemp, setCopiedTemp] = useState(false);

  // Superuser role is strictly only visible to the 2 designated superusers
  const visibleRoles = useMemo<RoleInfo[]>(() => {
    return (roles || []).filter((r: RoleInfo) => {
      const isSuperRole = r.slug === "super_admin" || r.slug === "superuser";
      if (isSuperRole) {
        return isSuperUser;
      }
      return true;
    });
  }, [roles, isSuperUser]);

  function toggleRole(slug: string) {
    setSelectedRoles((prev) =>
      prev.includes(slug) ? prev.filter((r) => r !== slug) : [...prev, slug],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    setCopiedTemp(false);

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("department", department);
    formData.append("notes", notes);
    for (const r of selectedRoles) {
      formData.append("roles", r);
    }

    startTransition(async () => {
      const res = await inviteUserFromSettingsAction(formData);
      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: res.message || "Invitation successfully dispatched!",
          tempPassword: res.tempPassword,
        });
        setFullName("");
        setEmail("");
        setNotes("");
        setSelectedRoles(["viewer"]);
      } else {
        setStatusMessage({
          type: "error",
          text: res.message || "Failed to dispatch user invitation.",
        });
      }
    });
  }

  function handleCopyTempPassword(pwd: string) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        void navigator.clipboard.writeText(pwd);
        setCopiedTemp(true);
        setTimeout(() => setCopiedTemp(false), 2000);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-emerald-400/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.1)_0%,rgba(9,14,23,0.95)_100%)] p-5 sm:flex-row sm:p-6 lg:px-7">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-400">
              <UserPlus size={18} />
            </div>
            <h2 className="m-0 text-xl font-bold tracking-tight text-white">
              Add Users &amp; Team Onboarding
            </h2>
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-400">
            Empower new administrators and team members with tailored access.
            Newly invited users receive an automated, branded onboarding email
            with their assigned roles, temporary password, and login gateway.
            Upon first sign in, they will establish their permanent password.
          </p>
        </div>

        <div className="min-w-40 shrink-0 rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Available Roles
          </div>
          <div className="mt-0.5 text-2xl font-extrabold tabular-nums text-emerald-400">
            {roles.length || 7}
          </div>
          <div className="text-[11px] text-slate-400">Configured in RBAC</div>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "16px 20px",
            borderRadius: "10px",
            backgroundColor:
              statusMessage.type === "success"
                ? "rgba(16, 185, 129, 0.12)"
                : "rgba(239, 68, 68, 0.15)",
            border:
              statusMessage.type === "success"
                ? "1px solid rgba(16, 185, 129, 0.35)"
                : "1px solid rgba(239, 68, 68, 0.35)",
            color: statusMessage.type === "success" ? "#34d399" : "#f87171",
            fontSize: "0.875rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: 600,
            }}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{statusMessage.text}</span>
          </div>

          {statusMessage.tempPassword && (
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "8px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.8125rem",
                  color: "#cbd5e1",
                }}
              >
                <span>🔐 Generated Temporary Password:</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "#38bdf8",
                    backgroundColor: "rgba(59, 130, 246, 0.15)",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {statusMessage.tempPassword}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCopyTempPassword(statusMessage.tempPassword!)
                }
                style={{
                  backgroundColor: copiedTemp
                    ? "#10b981"
                    : "rgba(59, 130, 246, 0.2)",
                  border: copiedTemp
                    ? "1px solid #10b981"
                    : "1px solid rgba(59, 130, 246, 0.4)",
                  color: "#ffffff",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {copiedTemp ? <Check size={12} strokeWidth={3} /> : null}
                <span>{copiedTemp ? "Copied!" : "Copy Password"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Onboarding Form Card */}
      <form onSubmit={handleSubmit} className={adminStyles.stack}>
        <div className={adminStyles.sidebarCard}>
          {/* Section 1: Core Information */}
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-[15px] font-bold text-slate-50">
              <User size={16} className={adminStyles.iconTeal} />
              1. Essential User Credentials
            </h3>
            <p className="mb-[18px] text-[13px] text-slate-500">
              Mandatory contact information for system recognition, email
              dispatch, and dashboard greeting.
            </p>

            <div className={adminStyles.grid2equal}>
              <div className={adminStyles.formField}>
                <label
                  className={adminStyles.formLabel}
                  htmlFor="user_full_name"
                >
                  Full Name *
                </label>
                <input
                  id="user_full_name"
                  type="text"
                  required
                  className={adminStyles.inputField}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Thandi Nkosi"
                  disabled={isPending}
                />
              </div>

              <div className={adminStyles.formField}>
                <label className={adminStyles.formLabel} htmlFor="user_email">
                  Email Address *
                </label>
                <input
                  id="user_email"
                  type="email"
                  required
                  className={adminStyles.inputField}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. thandi@pexpacks.co.za"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-700/40" />

          {/* Section 2: Department & Assignment */}
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-[15px] font-bold text-slate-50">
              <Building size={16} className={adminStyles.iconBlue} />
              2. Department &amp; Organizational Role
            </h3>
            <p className="mb-[18px] text-[13px] text-slate-500">
              Categorizes the user within Pexpacks Supplies for operational
              workflows and reporting.
            </p>

            <div className={adminStyles.grid2equal}>
              <div className={adminStyles.formField}>
                <label
                  className={adminStyles.formLabel}
                  htmlFor="user_department"
                >
                  Operational Department
                </label>
                <select
                  id="user_department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isPending}
                  className={adminStyles.selectField}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className={adminStyles.formField}>
                <label className={adminStyles.formLabel} htmlFor="user_notes">
                  Personalized Welcome Note / Special Instructions (Optional)
                </label>
                <textarea
                  id="user_notes"
                  rows={2}
                  className={adminStyles.textareaField}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Welcome to the Q3 Back-to-School season team! Please complete your 2FA setup upon login."
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-700/40" />

          {/* Section 3: Role & Permission Assignment */}
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-[15px] font-bold text-slate-50">
              <Shield size={16} className="text-violet-400" />
              3. Role &amp; Permission Access
            </h3>
            <p className="mb-[18px] text-[13px] text-slate-500">
              Select one or more roles that define what modules and actions this
              user can perform in the Back-Office.
            </p>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
              {visibleRoles.map((role) => {
                const isSelected = selectedRoles.includes(role.slug);
                const isSuper =
                  role.slug === "super_admin" || role.slug === "superuser";

                return (
                  <div
                    key={role.id}
                    onClick={() => toggleRole(role.slug)}
                    style={{
                      backgroundColor: isSelected
                        ? isSuper
                          ? "rgba(168, 85, 247, 0.15)"
                          : "rgba(16, 185, 129, 0.1)"
                        : isSuper
                          ? "rgba(168, 85, 247, 0.04)"
                          : "#090e17",
                      border: isSelected
                        ? isSuper
                          ? "1px solid #c084fc"
                          : "1px solid #10b981"
                        : isSuper
                          ? "1px solid rgba(168, 85, 247, 0.4)"
                          : "1px solid rgba(51, 65, 85, 0.6)",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "8px",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {isSuper && (
                          <Shield size={14} style={{ color: "#c084fc" }} />
                        )}
                        <span
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: isSelected
                              ? isSuper
                                ? "#e9d5ff"
                                : "#34d399"
                              : isSuper
                                ? "#c084fc"
                                : "#ffffff",
                          }}
                        >
                          {isSuper ? "Superuser" : role.name}
                        </span>
                      </div>

                      <div
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          border: isSelected
                            ? isSuper
                              ? "1px solid #a855f7"
                              : "1px solid #10b981"
                            : "1px solid #475569",
                          backgroundColor: isSelected
                            ? isSuper
                              ? "#a855f7"
                              : "#10b981"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                        }}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    {isSuper && (
                      <div style={{ display: "inline-block" }}>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(168, 85, 247, 0.25)",
                            color: "#e9d5ff",
                            letterSpacing: "0.04em",
                          }}
                        >
                          👑 Superuser Access Add-on
                        </span>
                      </div>
                    )}

                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {isSuper
                        ? "Full unrestricted access across all DB modules & settings. Max 2 accounts permitted."
                        : role.description ||
                          "General platform access and permissions."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-slate-700/40" />

          {/* Submit Action */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              <Info size={14} />
              <span>
                An automated invitation email with role details will be sent
                immediately upon submission.
              </span>
            </div>

            <AdminButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending || !fullName.trim() || !email.trim()}
              icon={isPending ? undefined : <Send size={16} />}
            >
              {isPending
                ? "Dispatching Invitation..."
                : "Dispatch Invitation & Onboard User"}
            </AdminButton>
          </div>
        </div>
      </form>
    </div>
  );
}
