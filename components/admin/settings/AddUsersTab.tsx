"use client";

import { useState, useTransition, useMemo } from "react";
import {
  UserPlus,
  Mail,
  User,
  Building,
  Shield,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Clock,
  Check,
} from "lucide-react";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingTextarea } from "@/components/ui/FloatingTextarea";
import { inviteUserFromSettingsAction } from "@/app/admin/settings/actions";
import type { RoleInfo } from "@/lib/admin/users";
import styles from "./SettingsControlCentre.module.css";
import adminStyles from "@/app/admin/admin.module.css";

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

export function AddUsersTab({
  roles,
  currentUserEmail,
  isSuperUser = false,
}: AddUsersTabProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["viewer"]);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
      prev.includes(slug) ? prev.filter((r) => r !== slug) : [...prev, slug]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(9, 14, 23, 0.95) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "14px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ maxWidth: "640px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={18} />
            </div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Add Users &amp; Team Onboarding
            </h2>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.6, margin: 0 }}>
            Empower new administrators and team members with tailored access. Newly invited users
            receive an automated, branded onboarding email with their assigned roles, responsibilities,
            and activation link. Their full name will be prominently displayed on their dashboard welcome screen.
          </p>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(51, 65, 85, 0.6)",
            borderRadius: "10px",
            padding: "12px 16px",
            textAlign: "center",
            minWidth: "160px",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Available Roles
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981", marginTop: "2px" }}>
            {roles.length || 7}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Configured in RBAC</div>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor:
              statusMessage.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border:
              statusMessage.type === "success"
                ? "1px solid rgba(16, 185, 129, 0.35)"
                : "1px solid rgba(239, 68, 68, 0.35)",
            color: statusMessage.type === "success" ? "#34d399" : "#f87171",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Onboarding Form Card */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className={adminStyles.tableCard} style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Section 1: Core Information */}
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <User size={16} style={{ color: "#10b981" }} />
              1. Essential User Credentials
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 18px" }}>
              Mandatory contact information for system recognition, email dispatch, and dashboard greeting.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              <FloatingInput
                id="user_full_name"
                label="Full Name *"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Thandi Nkosi"
                disabled={isPending}
                bgSurface="#0c1322"
              />

              <FloatingInput
                id="user_email"
                label="Email Address *"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. thandi@pexpacks.co.za"
                disabled={isPending}
                bgSurface="#0c1322"
              />
            </div>
          </div>

          <div style={{ height: "1px", backgroundColor: "rgba(51, 65, 85, 0.4)" }} />

          {/* Section 2: Department & Assignment */}
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Building size={16} style={{ color: "#38bdf8" }} />
              2. Department &amp; Organizational Role
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 18px" }}>
              Categorizes the user within Pexpacks Supplies for operational workflows and reporting.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#94a3b8", marginBottom: "8px" }}>
                  Operational Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={isPending}
                  style={{
                    width: "100%",
                    height: "46px",
                    backgroundColor: "#090e17",
                    border: "1px solid rgba(51, 65, 85, 0.8)",
                    borderRadius: "8px",
                    color: "#ffffff",
                    padding: "0 14px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    outline: "none",
                  }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FloatingTextarea
                  id="user_notes"
                  label="Personalized Welcome Note / Special Instructions (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Welcome to the Q3 Back-to-School season team! Please complete your 2FA setup upon login."
                  disabled={isPending}
                  bgSurface="#0c1322"
                />
              </div>
            </div>
          </div>

          <div style={{ height: "1px", backgroundColor: "rgba(51, 65, 85, 0.4)" }} />

          {/* Section 3: Role & Permission Assignment */}
          <div>
            <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 4px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={16} style={{ color: "#a855f7" }} />
              3. Role &amp; Permission Access
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: "0 0 18px" }}>
              Select one or more roles that define what modules and actions this user can perform in the Back-Office.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
              {visibleRoles.map((role) => {
                const isSelected = selectedRoles.includes(role.slug);
                const isSuper = role.slug === "super_admin" || role.slug === "superuser";

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
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {isSuper && <Shield size={14} style={{ color: "#c084fc" }} />}
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

                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", lineHeight: 1.4, margin: 0 }}>
                      {isSuper
                        ? "Full unrestricted access across all DB modules & settings. Max 2 accounts permitted."
                        : role.description || "General platform access and permissions."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: "1px", backgroundColor: "rgba(51, 65, 85, 0.4)" }} />

          {/* Submit Action */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "#64748b" }}>
              <Info size={14} />
              <span>An automated invitation email with role details will be sent immediately upon submission.</span>
            </div>

            <button
              type="submit"
              disabled={isPending || !fullName.trim() || !email.trim()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                height: "44px",
                padding: "0 24px",
                backgroundColor: isPending || !fullName.trim() || !email.trim() ? "#1e293b" : "#10b981",
                color: isPending || !fullName.trim() || !email.trim() ? "#64748b" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: isPending || !fullName.trim() || !email.trim() ? "not-allowed" : "pointer",
                boxShadow: isPending || !fullName.trim() || !email.trim() ? "none" : "0 4px 14px rgba(16, 185, 129, 0.3)",
                transition: "all 0.15s ease",
              }}
            >
              {isPending ? (
                <>
                  <Clock size={16} className="animate-spin" /> Dispatching Invitation...
                </>
              ) : (
                <>
                  <Send size={16} /> Dispatch Invitation &amp; Onboard User
                </>
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
