import type { Metadata } from "next";
import { requireAdmin, displayName } from "@/lib/admin/rbac";
import { filterNav } from "@/lib/admin/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { IdleLogout } from "@/components/admin/IdleLogout";

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

  return (
    <AdminShell
      groups={groups}
      userName={name}
      userEmail={session.user.email ?? ""}
      userRoles={session.roles}
    >
      <IdleLogout />
      {children}
    </AdminShell>
  );
}
