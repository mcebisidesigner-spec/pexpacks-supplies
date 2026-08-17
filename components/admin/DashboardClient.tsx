"use client";

import type { DashboardStats } from "@/lib/admin/dashboard";
import { OperationsCommandCenter } from "./operations/OperationsCommandCenter";

export interface DashboardClientProps {
  stats?: DashboardStats;
}

export function DashboardClient({ stats }: DashboardClientProps) {
  return <OperationsCommandCenter />;
}

export default DashboardClient;
