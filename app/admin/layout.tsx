import type { Metadata } from "next";
import "@/styles/admin-dark.css";
import "@/styles/db-tokens.css";
import { requireAdmin, displayName } from "@/lib/admin/rbac";
import { filterNav } from "@/lib/admin/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SessionSecurityProvider } from "@/components/security/SessionSecurityProvider";
import { MustChangePasswordModal } from "@/components/security/MustChangePasswordModal";

export const metadata: Metadata = {
  title: "Admin | Pexpacks",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  const groups = filterNav(session.permissions, session.isSuperAdmin);
  const name = displayName(session.user);
  const metadata = session.user.user_metadata ?? {};
  const avatarUrl =
    typeof metadata["avatar_url"] === "string"
      ? metadata["avatar_url"]
      : typeof metadata["picture"] === "string"
        ? metadata["picture"]
        : null;

  const mustChangePassword = Boolean(metadata["must_change_password"]);

  return (
    <SessionSecurityProvider>
      <MustChangePasswordModal
        userEmail={session.user.email ?? ""}
        mustChangePassword={mustChangePassword}
      />
      <AdminShell
        groups={groups}
        userName={name}
        userEmail={session.user.email ?? ""}
        userRoles={session.roles}
        avatarUrl={avatarUrl}
      >
        {children}
      </AdminShell>
    </SessionSecurityProvider>
  );
}
