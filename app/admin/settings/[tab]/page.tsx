import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface SettingsTabRouteProps {
  params: Promise<{ tab: string }>;
}

export default async function SettingsTabRoutePage({ params }: SettingsTabRouteProps) {
  redirect("/admin/settings");
}
