"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Shield,
  Check,
  X,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import type { RoleInfo, UserListItem } from "@/lib/admin/users";
import {
  updateUserRolesFromSettingsAction,
  deleteUserFromSettingsAction,
} from "@/app/admin/settings/actions";
import styles from "./SettingsControlCentre.module.css";
import adminStyles from "@/app/admin/admin.module.css";

interface UserIdentityTabProps {
  users: UserListItem[];
  roles: RoleInfo[];
  currentUserEmail?: string;
  isSuperUser?: boolean;
}

export function UserIdentityTab({
  users,
  roles,
  currentUserEmail,
  isSuperUser = false,
}: UserIdentityTabProps) {
  const router = useRouter();
  const [userList, setUserList] = useState<UserListItem[]>(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null);
  const [activeRoleSlugs, setActiveRoleSlugs] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Superuser role is strictly only visible to the 2 designated superusers
  const visibleRoles = useMemo(() => {
    return roles.filter((r) => {
      const isSuperRole = r.slug === "super_admin" || r.slug === "superuser";
      if (isSuperRole) {
        return isSuperUser;
      }
      return true;
    });
  }, [roles, isSuperUser]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return userList;
    return userList.filter((u) => {
      const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
      const name = String(meta.full_name || meta.name || "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || u.id.includes(q);
    });
  }, [userList, searchQuery]);

  function handleOpenInspect(user: UserListItem) {
    setSelectedUser(user);
    setActiveRoleSlugs([...user.roleSlugs]);
    setFeedback(null);
  }

  function toggleRole(roleSlug: string) {
    if (
      selectedUser?.email?.toLowerCase() === "mcebisimhayise@gmail.com" &&
      (roleSlug === "super_admin" || roleSlug === "superuser")
    ) {
      // Permanent primary superuser role is locked and cannot be revoked
      return;
    }
    setActiveRoleSlugs((prev) =>
      prev.includes(roleSlug)
        ? prev.filter((s) => s !== roleSlug)
        : [...prev, roleSlug],
    );
  }

  function handleSaveRoles() {
    if (!selectedUser) return;
    setFeedback(null);

    startTransition(async () => {
      const res = await updateUserRolesFromSettingsAction(
        selectedUser.id,
        activeRoleSlugs,
      );
      if (res.ok) {
        setFeedback({
          type: "success",
          text: `Roles successfully updated for ${getUserName(selectedUser)}.`,
        });
        // Update local user object
        selectedUser.roleSlugs = [...activeRoleSlugs];
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.message || "Failed to update user roles.",
        });
      }
    });
  }

  function handleRequestDelete(user: UserListItem) {
    setUserToDelete(user);
    setDeleteError(null);
  }

  function handleConfirmDelete() {
    if (!userToDelete) return;
    setDeleteError(null);

    startDeleteTransition(async () => {
      const res = await deleteUserFromSettingsAction(userToDelete.id);
      if (res.ok) {
        // Remove from local list
        setUserList((prev) => prev.filter((u) => u.id !== userToDelete.id));
        if (selectedUser?.id === userToDelete.id) {
          setSelectedUser(null);
        }
        setUserToDelete(null);
        router.refresh();
      } else {
        setDeleteError(res.message || "Failed to delete user account.");
      }
    });
  }

  function getUserName(user: UserListItem): string {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    if (user.email === "mcebisimhayise@gmail.com") return "Mcebisi Hlatshwayo";
    return (
      (meta.full_name as string) ||
      (meta.name as string) ||
      user.email?.split("@")[0] ||
      "Staff Member"
    );
  }

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(9, 14, 23, 0.95) 100%)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          borderRadius: "14px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ maxWidth: "640px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "rgba(56, 189, 248, 0.2)",
                color: "#38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={18} />
            </div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
              }}
            >
              User Identity &amp; Role Matrix
            </h2>
          </div>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#94a3b8",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Comprehensive directory of all system users. Click on any user to
            inspect their active identity profile, review assigned roles, and
            toggle permissions on or off directly in this interface.
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
            <div
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
              }}
            >
              Total Users
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#38bdf8",
                marginTop: "2px",
              }}
            >
              {users.length}
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: "420px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, or ID..."
            style={{
              width: "100%",
              height: "42px",
              paddingLeft: "40px",
              paddingRight: "14px",
              backgroundColor: "#090e17",
              border: "1px solid rgba(51, 65, 85, 0.7)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>

        <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>
          Showing <strong>{filteredUsers.length}</strong> of{" "}
          <strong>{users.length}</strong> users
        </div>
      </div>

      {/* Users Directory Table Card */}
      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User / Identity</th>
                <th>Email Address</th>
                <th>Assigned Roles</th>
                <th>Status</th>
                <th>Date Joined</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const name = getUserName(user);
                  const initials = getInitials(name);
                  const isPrimarySuper =
                    user.email?.toLowerCase() === "mcebisimhayise@gmail.com";
                  const isSuper =
                    isPrimarySuper ||
                    user.roleSlugs.includes("super_admin") ||
                    user.email === "pexpacks@gmail.com";
                  const isSelf =
                    Boolean(currentUserEmail) &&
                    user.email?.toLowerCase() ===
                      currentUserEmail?.toLowerCase();
                  const canDelete =
                    !isPrimarySuper && !isSelf && (!isSuper || isSuperUser);

                  return (
                    <tr
                      key={user.id}
                      onClick={() => handleOpenInspect(user)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: isSuper
                                ? "rgba(168, 85, 247, 0.2)"
                                : "rgba(16, 185, 129, 0.2)",
                              color: isSuper ? "#c084fc" : "#34d399",
                              border: isSuper
                                ? "1px solid rgba(168, 85, 247, 0.4)"
                                : "1px solid rgba(16, 185, 129, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "13px",
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: "#ffffff",
                                fontSize: "0.875rem",
                              }}
                            >
                              {name}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ color: "#cbd5e1", fontSize: "0.8125rem" }}>
                        {user.email || "No email"}
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                          }}
                        >
                          {user.roleSlugs.length > 0 ? (
                            user.roleSlugs.map((slug) => {
                              const roleObj = roles.find(
                                (r) => r.slug === slug,
                              );
                              const isSuperRole = slug === "super_admin";
                              return (
                                <span
                                  key={slug}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    backgroundColor: isSuperRole
                                      ? "rgba(168, 85, 247, 0.15)"
                                      : "rgba(16, 185, 129, 0.15)",
                                    border: isSuperRole
                                      ? "1px solid rgba(168, 85, 247, 0.3)"
                                      : "1px solid rgba(16, 185, 129, 0.3)",
                                    color: isSuperRole ? "#c084fc" : "#34d399",
                                  }}
                                >
                                  {isSuperRole && <Shield size={10} />}
                                  {roleObj?.name || slug}
                                </span>
                              );
                            })
                          ) : (
                            <span
                              style={{ fontSize: "11px", color: "#64748b" }}
                            >
                              No roles assigned
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: "rgba(16, 185, 129, 0.12)",
                            color: "#34d399",
                          }}
                        >
                          <CheckCircle2 size={11} /> Active
                        </span>
                      </td>

                      <td style={{ color: "#94a3b8", fontSize: "0.8125rem" }}>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-ZA",
                            )
                          : "—"}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "8px",
                          }}
                        >
                          {isPrimarySuper ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                backgroundColor: "rgba(168, 85, 247, 0.15)",
                                border: "1px solid rgba(168, 85, 247, 0.4)",
                                color: "#e9d5ff",
                              }}
                              data-db-tooltip="Permanent Primary Superuser Account (Locked)"
                            >
                              🔒 Permanent
                            </span>
                          ) : canDelete ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestDelete(user);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                backgroundColor: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "6px",
                                color: "#f87171",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                              data-db-tooltip={
                                isSuper
                                  ? "Delete Superuser Account"
                                  : "Delete User Account"
                              }
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "#64748b",
                    }}
                  >
                    No users matching your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Matrix & Detailed User Inspector Modal */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            style={{
              backgroundColor: "#090e17",
              border: "1px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    border: "1px solid rgba(56, 189, 248, 0.4)",
                    color: "#38bdf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "16px",
                  }}
                >
                  {getInitials(getUserName(selectedUser))}
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 800,
                      color: "#ffffff",
                      margin: "0 0 2px",
                    }}
                  >
                    {getUserName(selectedUser)}
                  </h3>
                  <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {selectedUser.email} &bull; Joined:{" "}
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString(
                          "en-ZA",
                        )
                      : "—"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Feedback Alert */}
            {feedback && (
              <div
                style={{
                  margin: "16px 28px 0",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  backgroundColor:
                    feedback.type === "success"
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  border:
                    feedback.type === "success"
                      ? "1px solid rgba(16, 185, 129, 0.35)"
                      : "1px solid rgba(239, 68, 68, 0.35)",
                  color: feedback.type === "success" ? "#34d399" : "#f87171",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            {/* Modal Body: Role Matrix */}
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    marginBottom: "4px",
                  }}
                >
                  Role Access Matrix
                </div>
                <p
                  style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}
                >
                  Toggle roles ON (checked) or OFF (unchecked) to customize this
                  user's administrative capabilities.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {visibleRoles.map((role) => {
                  const isChecked = activeRoleSlugs.includes(role.slug);
                  const isSuperRole =
                    role.slug === "super_admin" || role.slug === "superuser";

                  return (
                    <div
                      key={role.id}
                      onClick={() => toggleRole(role.slug)}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "10px",
                        backgroundColor: isChecked
                          ? isSuperRole
                            ? "rgba(168, 85, 247, 0.12)"
                            : "rgba(16, 185, 129, 0.08)"
                          : isSuperRole
                            ? "rgba(168, 85, 247, 0.04)"
                            : "#0c1322",
                        border: isChecked
                          ? isSuperRole
                            ? "1px solid rgba(168, 85, 247, 0.6)"
                            : "1px solid rgba(16, 185, 129, 0.4)"
                          : isSuperRole
                            ? "1px solid rgba(168, 85, 247, 0.3)"
                            : "1px solid rgba(51, 65, 85, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          maxWidth: "480px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isSuperRole && (
                            <Shield size={14} style={{ color: "#c084fc" }} />
                          )}
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              color: isChecked
                                ? isSuperRole
                                  ? "#e9d5ff"
                                  : "#ffffff"
                                : "#cbd5e1",
                            }}
                          >
                            {isSuperRole
                              ? "Superuser (Full DB Governance)"
                              : role.name}
                          </span>
                          {isSuperRole && (
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
                              👑 Superuser
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: isChecked
                                ? isSuperRole
                                  ? "rgba(168, 85, 247, 0.25)"
                                  : "rgba(16, 185, 129, 0.2)"
                                : "rgba(100, 116, 139, 0.2)",
                              color: isChecked
                                ? isSuperRole
                                  ? "#c084fc"
                                  : "#34d399"
                                : "#64748b",
                            }}
                          >
                            {isChecked ? "Toggled ON" : "Toggled OFF"}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#94a3b8",
                            lineHeight: 1.4,
                          }}
                        >
                          {isSuperRole
                            ? "Full unrestricted access across all modules in the DB. Max 2 accounts permitted."
                            : role.description ||
                              "Grants specific module and action privileges in the DB."}
                        </span>
                      </div>

                      {/* Visual Switch Control */}
                      <div
                        style={{
                          width: "44px",
                          height: "24px",
                          borderRadius: "12px",
                          backgroundColor: isChecked ? "#10b981" : "#1e293b",
                          border: isChecked
                            ? "1px solid #10b981"
                            : "1px solid #475569",
                          position: "relative",
                          transition: "all 0.2s ease",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#ffffff",
                            position: "absolute",
                            top: "2px",
                            left: isChecked ? "22px" : "2px",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isChecked ? (
                            <Check
                              size={10}
                              style={{ color: "#10b981" }}
                              strokeWidth={3}
                            />
                          ) : (
                            <X
                              size={10}
                              style={{ color: "#94a3b8" }}
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: "18px 28px",
                borderTop: "1px solid rgba(51, 65, 85, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#060a10",
                borderRadius: "0 0 16px 16px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(51, 65, 85, 0.8)",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    color: "#cbd5e1",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Close
                </button>

                {(() => {
                  const selectedIsSuper =
                    selectedUser.roleSlugs.includes("super_admin") ||
                    selectedUser.email === "mcebisimhayise@gmail.com" ||
                    selectedUser.email === "pexpacks@gmail.com";
                  const selectedIsSelf =
                    Boolean(currentUserEmail) &&
                    selectedUser.email?.toLowerCase() ===
                      currentUserEmail?.toLowerCase();
                  const canDeleteSelected =
                    !selectedIsSelf && (!selectedIsSuper || isSuperUser);

                  return canDeleteSelected ? (
                    <button
                      type="button"
                      onClick={() => handleRequestDelete(selectedUser)}
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        borderRadius: "8px",
                        padding: "8px 14px",
                        color: "#f87171",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      data-db-tooltip={
                        selectedIsSuper
                          ? "Delete Superuser Account"
                          : "Delete User Account"
                      }
                    >
                      <Trash2 size={13} />{" "}
                      {selectedIsSuper ? "Delete Superuser" : "Delete User"}
                    </button>
                  ) : null;
                })()}
              </div>

              <button
                type="button"
                onClick={handleSaveRoles}
                disabled={isPending}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: isPending ? "#1e293b" : "#10b981",
                  color: isPending ? "#64748b" : "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 20px",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: isPending ? "not-allowed" : "pointer",
                  boxShadow: isPending
                    ? "none"
                    : "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                {isPending ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Saving
                    Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} /> Save Role Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(3, 7, 18, 0.85)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setUserToDelete(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#090e17",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                background:
                  "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(9, 14, 23, 0.95) 100%)",
                borderBottom: "1px solid rgba(51, 65, 85, 0.5)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#f87171",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: "0 0 2px",
                  }}
                >
                  Delete User Account
                </h3>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
                  Permanent database action
                </p>
              </div>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {deleteError && (
                <div
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#fca5a5",
                    fontSize: "0.8125rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{deleteError}</span>
                </div>
              )}

              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#cbd5e1",
                  lineHeight: 1.5,
                  margin: "0 0 12px",
                }}
              >
                Are you sure you want to permanently delete{" "}
                <strong style={{ color: "#ffffff" }}>
                  {getUserName(userToDelete)}
                </strong>{" "}
                (<span style={{ color: "#38bdf8" }}>{userToDelete.email}</span>
                )?
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "#94a3b8",
                  lineHeight: 1.4,
                  margin: "0 0 20px",
                }}
              >
                This will immediately remove their account from Supabase Auth
                and revoke all role permissions. This action cannot be undone.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(51, 65, 85, 0.8)",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    color: "#cbd5e1",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 18px",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.35)",
                  }}
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />{" "}
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} /> Yes, Delete User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
