"use client";

/**
 * Optimistic Order Status Component (React 19 / Next.js 16)
 * 
 * Provides 0ms instant UI feedback when changing order statuses.
 * Uses React's `useOptimistic` + `useTransition` to update the badge locally,
 * and automatically rolls back if the server action fails or throws an error.
 */

import { useOptimistic, useTransition } from "react";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";

interface OptimisticOrderStatusProps {
  orderId: string;
  initialStatus: string;
  allowedStatuses?: string[];
}

export function OptimisticOrderStatus({
  orderId,
  initialStatus,
  allowedStatuses = ["pending", "paid", "shipped", "completed", "cancelled"],
}: OptimisticOrderStatusProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    initialStatus,
    (_currentStatus: string, newStatus: string) => newStatus
  );

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === optimisticStatus) return;

    startTransition(async () => {
      // Step A: Immediately apply optimistic state
      setOptimisticStatus(newStatus);

      try {
        // Step B: Send Server Action
        const formData = new FormData();
        formData.append("status", newStatus);
        await updateOrderStatusAction(orderId, formData);
      } catch (error) {
        // Step C: If Server Action throws, React auto-reverts setOptimisticStatus
        console.error("[OptimisticUpdate] Failed to change status:", error);
      }
    });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    paid: "bg-blue-100 text-blue-800 border-blue-300",
    shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cancelled: "bg-rose-100 text-rose-800 border-rose-300",
  };

  const badgeStyle =
    statusColors[optimisticStatus.toLowerCase()] ||
    "bg-gray-100 text-gray-800 border-gray-300";

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${badgeStyle}`}
      >
        <span className="capitalize">{optimisticStatus}</span>
        {isPending && (
          <span className="text-[10px] opacity-75 animate-pulse">
            (Saving...)
          </span>
        )}
      </span>

      <select
        disabled={isPending}
        value={optimisticStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {allowedStatuses.map((st) => (
          <option key={st} value={st}>
            {st.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
