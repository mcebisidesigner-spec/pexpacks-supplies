/**
 * SWR Hook for Dashboard Pre-Aggregated Summaries
 * 
 * Provides 0ms instant cached rendering with background SWR revalidation
 * against Supabase's pre-aggregated `dashboard_summaries` table.
 */

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

export interface DashboardSummary {
  id: string;
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_schools: number;
  total_packs: number;
  last_updated_at: string;
}

const supabase = createClient();

async function fetchSummary(): Promise<DashboardSummary | null> {
  const { data, error } = await supabase
    .from("dashboard_summaries")
    .select("*")
    .eq("id", "global")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as DashboardSummary | null;
}

export function useDashboardSummary() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardSummary | null>(
    "dashboard_summary_key",
    fetchSummary,
    {
      revalidateOnFocus: true,     // Refetch when returning to tab
      revalidateOnReconnect: true, // Refetch when network recovers
      refreshInterval: 30000,      // Background polling every 30 seconds
      dedupingInterval: 5000,       // Deduplicate requests made within 5 seconds
    }
  );

  return {
    summary: data,
    isLoading: isLoading && !data, // True ONLY on first cold load with no cache
    isRefreshing: isValidating,     // True when updating silently in the background
    isError: error,
    refresh: mutate,                // Manual trigger function
  };
}
