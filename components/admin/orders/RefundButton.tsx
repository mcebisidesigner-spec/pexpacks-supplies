"use client";

import { refundPaymentAction } from "@/app/admin/payments/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import styles from "./RefundButton.module.css";

export function RefundButton({ id, amount }: { id: string; amount: string }) {
  return (
    <form action={refundPaymentAction.bind(null, id)}>
      <ConfirmButton
        label="Refund"
        confirmText={`Refund ${amount}? This marks the payment as refunded.`}
        busyLabel="Refunding…"
        className={styles.button}
      />
    </form>
  );
}
