"use client";

import { useFormStatus } from "react-dom";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { ORDER_STATUSES } from "@/lib/admin/order-constants";
import styles from "./order-badge.module.css";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.saveButton} disabled={pending}>
      {pending ? "Saving…" : "Save status"}
    </button>
  );
}

export function OrderStatusForm({ id, current }: { id: string; current: string }) {
  return (
    <form action={updateOrderStatusAction.bind(null, id)} className={styles.statusForm}>
      <select
        name="status"
        defaultValue={current}
        className={styles.statusSelect}
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
