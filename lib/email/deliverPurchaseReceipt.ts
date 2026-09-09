import { getOrderForReceipt } from "@/lib/orders";
import { sendPurchaseReceipt } from "@/lib/email/receipt";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ReceiptRpc = (
  name: string,
  args: Record<string, unknown>,
) => Promise<{ data: unknown; error: { message: string } | null }>;

/**
 * Sends one receipt per paid order, even if payment and database webhooks race.
 */
export async function dispatchPurchaseReceipt(orderReference: string) {
  try {
    const order = await getOrderForReceipt(orderReference);
    if (!order || order.status !== "paid") {
      return { sent: false, claimed: false };
    }

    const admin = createSupabaseAdminClient();
    const rpc = admin.rpc.bind(admin) as unknown as ReceiptRpc;
    const { data, error } = await rpc("claim_order_receipt_delivery", {
      p_order_id: order.id,
    });

    if (error) {
      console.error("[receipt] Unable to claim delivery:", error.message);
      return { sent: false, claimed: false };
    }

    const claimToken = typeof data === "string" ? data : null;
    if (!claimToken) return { sent: false, claimed: false };

    try {
      const result = await sendPurchaseReceipt(order);
      await rpc("complete_order_receipt_delivery", {
        p_order_id: order.id,
        p_claim_token: claimToken,
        p_sent: result.success,
        p_error: result.error ?? null,
      });
      return { sent: result.success, claimed: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Receipt delivery failed.";
      await rpc("complete_order_receipt_delivery", {
        p_order_id: order.id,
        p_claim_token: claimToken,
        p_sent: false,
        p_error: message,
      });
      console.error("[receipt] Delivery exception:", message);
      return { sent: false, claimed: true };
    }
  } catch (error) {
    console.error("[receipt] Dispatch failed:", error);
    return { sent: false, claimed: false };
  }
}