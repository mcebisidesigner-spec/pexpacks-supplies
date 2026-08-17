import useSWR from "swr";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AdminNotifications {
  orders_today: number;
  pending_payments: number;
  failed_payments: number;
  awaiting_fulfilment: number;
  pending_schools: number;
  procurement_outstanding: number;
  open_tasks: number;
  generated_at: string;
}

const fetcher = async (url: string): Promise<AdminNotifications> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Notification request failed (${response.status})`);
  }
  return response.json();
};

export function useAdminNotifications(enabled: boolean) {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<AdminNotifications>(
      enabled ? "/api/admin/notifications" : null,
      fetcher,
      {
        refreshInterval: 60000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
      },
    );

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    const channel = supabase
      .channel("admin-operational-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => void mutate(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "operational_tasks" },
        () => void mutate(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, mutate]);

  return {
    notifications: data,
    isLoading: isLoading && !data,
    isRefreshing: isValidating,
    isError: error,
    refresh: mutate,
  };
}
