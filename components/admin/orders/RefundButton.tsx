"use client";

import { refundPaymentAction } from "@/app/admin/payments/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export function RefundButton({ id, amount }: { id: string; amount: string }) {
  return (
    <form action={refundPaymentAction.bind(null, id)}>
      <ConfirmButton
        label="Refund"
        confirmText={`Refund ${amount}? This marks the payment as refunded.`}
        busyLabel="Refunding…"
        className="px-3 py-1.5 text-xs font-semibold border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </form>
  );
}
