import useSWR from "swr";

export interface AdminNotifications {
  orders_today: number;
  pending_payments: number;
  failed_payments: number;
  awaiting_fulfilment: number;
  pending_schools: number;
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
  const { data, error, isLoading, isValidating, mutate } = useSWR<AdminNotifications>(
    enabled ? "/api/admin/notifications" : null,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );

  return {
    notifications: data,
    isLoading: isLoading && !data,
    isRefreshing: isValidating,
    isError: error,
    refresh: mutate,
  };
}
