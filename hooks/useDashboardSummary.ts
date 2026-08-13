/**
 * SWR Hook for Dashboard Pre-Aggregated Summaries
 * 
 * Fetches the pre-aggregated `dashboard_summaries` row through the
 * RBAC-gated, server-cached API route (3-layer architecture) instead of
 * reading Supabase directly from the browser with the anon key.
 * Concurrent admins share a single server-side cached read.
 */

import useSWR from "swr";

export interface DashboardSummary {
  id: string;
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  total_revenue: number | null;
  total_schools: number;
  total_packs: number;
  last_updated_at: string;
}

const fetcher = async (url: string): Promise<DashboardSummary | null> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Dashboard summary request failed (${res.status})`);
  }
  return res.json();
};

export function useDashboardSummary() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardSummary | null>(
    "/api/admin/dashboard/summary",
    fetcher,
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
