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
} from "lucide-react";
import type { RoleInfo, UserListItem } from "@/lib/admin/users";
import {
  updateUserRolesFromSettingsAction,
  deleteUserFromSettingsAction,
} from "@/app/admin/settings/actions";
import { DbNotice } from "@/components/admin/ui/DbNotice";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "@/app/admin/adminStyles";

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
    <div className="flex w-full flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-sky-400/25 bg-[linear-gradient(135deg,rgba(56,189,248,0.1)_0%,rgba(9,14,23,0.95)_100%)] p-5 sm:flex-row sm:p-6 lg:px-7">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sky-400/20 text-sky-400">
              <Users size={18} />
            </div>
            <h2 className="m-0 text-xl font-bold tracking-tight text-white">
              User Identity &amp; Role Matrix
            </h2>
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-400">
            Comprehensive directory of all system users. Click on any user to
            inspect their active identity profile, review assigned roles, and
            toggle permissions on or off directly in this interface.
          </p>
        </div>

        <div className="flex shrink-0 gap-3">
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 text-center">
            <div className="text-[11px] font-semibold uppercase text-slate-500">
              Total Users
            </div>
            <div className="mt-0.5 text-2xl font-extrabold tabular-nums text-sky-400">
              {users.length}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Notice */}
      {feedback && (
        <DbNotice
          type={feedback.type}
          message={feedback.text}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full flex-1 sm:max-w-[420px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, or ID..."
            className="h-11 w-full rounded-lg border border-slate-700/70 bg-[#090e17] py-0 pl-10 pr-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
          />
        </div>

        <div className="text-[13px] text-slate-500">
          Showing <strong className="font-semibold text-slate-300">{filteredUsers.length}</strong> of{" "}
          <strong className="font-semibold text-slate-300">{users.length}</strong> users
        </div>
      </div>

      {/* Users Directory Table Card */}
      <div className={adminStyles.tableCard}>
        <div className={adminStyles.tableWrapper}>
          <table className={adminStyles.table}>
            <thead>
              <tr>
                <th>User / Identity</th>
                <th>Email Address</th>
                <th>Assigned Roles</th>
                <th>Status</th>
                <th>Date Joined</th>
                <th className="text-right">Actions</th>
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
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-3">
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

                      <td className="text-[13px] text-slate-300">
                        {user.email || "No email"}
                      </td>

                      <td>
                        <div className="flex flex-wrap gap-1.5">
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
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 size={11} /> Active
                        </span>
                      </td>

                      <td className="text-[13px] text-slate-400">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-ZA",
                            )
                          : "—"}
                      </td>

                      <td className="text-right">
                        <div className="inline-flex items-center justify-end gap-2">
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
                            <AdminButton
                              variant="danger"
                              size="sm"
                              icon={<Trash2 size={12} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestDelete(user);
                              }}
                              data-db-tooltip={
                                isSuper
                                  ? "Delete Superuser Account"
                                  : "Delete User Account"
                              }
                            >
                              Delete
                            </AdminButton>
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
                    className="p-8 text-center text-slate-500"
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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-[680px] flex-col overflow-y-auto rounded-2xl border border-slate-700/80 bg-[#090e17] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-700/50 px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/15 text-base font-extrabold text-sky-400">
                  {getInitials(getUserName(selectedUser))}
                </div>
                <div>
                  <h3 className="mb-0.5 truncate text-lg font-extrabold text-white">
                    {getUserName(selectedUser)}
                  </h3>
                  <div className="text-[13px] text-slate-400">
                    {selectedUser.email} &bull; Joined:{" "}
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString(
                          "en-ZA",
                        )
                      : "—"}
                  </div>
                </div>
              </div>

              <AdminButton
                variant="ghost"
                size="sm"
                icon={<X size={20} />}
                onClick={() => setSelectedUser(null)}
              />
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
            <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6">
              <div>
                <div className="mb-1 text-sm font-bold text-white">
                  Role Access Matrix
                </div>
                <p className="m-0 text-[13px] text-slate-500">
                  Toggle roles ON (checked) or OFF (unchecked) to customize this
                  user's administrative capabilities.
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
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
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-slate-700/50 bg-[#060a10] px-5 py-[18px] sm:px-7">
              <div className="flex items-center gap-2.5">
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </AdminButton>

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
                    <AdminButton
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={13} />}
                      onClick={() => handleRequestDelete(selectedUser)}
                      data-db-tooltip={
                        selectedIsSuper
                          ? "Delete Superuser Account"
                          : "Delete User Account"
                      }
                    >
                      {selectedIsSuper ? "Delete Superuser" : "Delete User"}
                    </AdminButton>
                  ) : null;
                })()}
              </div>

              <AdminButton
                variant="primary"
                size="md"
                icon={isPending ? undefined : <CheckCircle2 size={14} />}
                loading={isPending}
                disabled={isPending}
                onClick={handleSaveRoles}
              >
                {isPending ? "Saving Changes..." : "Save Role Changes"}
              </AdminButton>
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
                <AdminButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </AdminButton>

                <AdminButton
                  variant="danger"
                  size="sm"
                  icon={isDeleting ? undefined : <Trash2 size={13} />}
                  loading={isDeleting}
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete User"}
                </AdminButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
