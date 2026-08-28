"use client";

import type { DashboardStats } from "@/lib/admin/dashboard";
import { OperationsCommandCenter } from "./operations/OperationsCommandCenter";

export interface DashboardClientProps {
  stats?: DashboardStats;
  userName?: string;
}

export function DashboardClient({ stats, userName }: DashboardClientProps) {
  return <OperationsCommandCenter userName={userName} />;
}

export default DashboardClient;
