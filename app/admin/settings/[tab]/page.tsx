import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { SettingsPageView } from "@/components/admin/views/SettingsPageView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Settings Control Centre | Admin | Pexpacks",
};

interface SettingsTabRouteProps {
  params: Promise<{ tab: string }>;
}

const VALID_TABS = ["general", "user-roles", "financial", "templates"];

export default async function SettingsTabRoutePage({ params }: SettingsTabRouteProps) {
  await requireAdmin({ permission: "settings.manage" });
  const { tab } = await params;

  if (!VALID_TABS.includes(tab)) {
    notFound();
  }

  return <SettingsPageView activeTab={tab as "general" | "user-roles" | "financial" | "templates"} />;
}
