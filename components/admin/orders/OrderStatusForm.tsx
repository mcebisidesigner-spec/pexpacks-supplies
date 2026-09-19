"use client";

import { useFormStatus } from "react-dom";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { ORDER_STATUSES } from "@/lib/admin/order-constants";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="px-3.5 py-2 border-0 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? "Saving…" : "Save status"}
    </button>
  );
}

export function OrderStatusForm({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  return (
    <form
      action={updateOrderStatusAction.bind(null, id)}
      className="flex gap-2.5 items-center flex-wrap"
    >
      <select
        name="status"
        defaultValue={current}
        className="px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
        aria-label="Order status"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <SaveButton />
    </form>
  );
}
