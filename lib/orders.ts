import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "./supabase/admin";

function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomUUID().slice(0, 6).toUpperCase();
  return `PEX-${timestamp}-${suffix}`;
}

export { generateOrderReference };

export async function createPendingOrder(input: {
  orderReference: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  learnerName?: string;
  schoolSlug: string;
  schoolName: string;
  grade: string;
  packType: string;
  items: string[];
  estimatedTotal: number;
  deliveryMethod: string;
  notes?: string;
}) {
  const supabase = createSupabaseAdminClient();

  const orderId = randomUUID();

  const { error } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      order_reference: input.orderReference,
      buyer_name: input.buyerName,
      buyer_phone: input.buyerPhone,
      buyer_email: input.buyerEmail || null,
      learner_name: input.learnerName || null,
      school_slug: input.schoolSlug,
      school_name: input.schoolName,
      grade: input.grade,
      pack_type: input.packType,
      items: input.items.length > 0 ? input.items : null,
      estimated_total: input.estimatedTotal,
      fulfilment_option:
        input.deliveryMethod === "school_collection"
          ? "School collection"
          : input.deliveryMethod === "delivery"
            ? "Home delivery"
            : "Collection point",
      consent: true,
      status: "pending_payment",
    });

  if (error) {
    console.error("[orders] Failed to create pending order:", JSON.stringify(error));
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return { id: orderId, orderReference: input.orderReference };
}

export async function markOrderPaid(
  reference: string,
  gatewayData: {
    gatewayReference: string;
    paidAt: string;
    amount: number;
  }
): Promise<{ updated: boolean; message: string }> {
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("orders")
    .select("id, status, estimated_total")
    .eq("order_reference", reference)
    .single();

  if (!existing) {
    return { updated: false, message: "Order not found" };
  }

  if (existing.status === "paid") {
    return { updated: true, message: "Order already marked as paid" };
  }

  const expectedAmount = Number(existing.estimated_total) * 100;
  if (Math.abs(expectedAmount - gatewayData.amount) > 1) {
    console.error(
      `[orders] Amount mismatch for ${reference}: expected ${expectedAmount}, got ${gatewayData.amount}`
    );
    return { updated: false, message: "Amount mismatch" };
  }

  const { error } = await admin
    .from("orders")
    .update({
      status: "paid",
      paid_at: gatewayData.paidAt,
      gateway_reference: gatewayData.gatewayReference,
      payment_gateway: "paystack",
    })
    .eq("order_reference", reference);

  if (error) {
    console.error("[orders] Failed to update order to paid:", error);
    return { updated: false, message: "Database update failed" };
  }

  return { updated: true, message: "Order updated to paid" };
}

export async function getOrderByReference(reference: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_reference, status, school_name, grade, estimated_total, buyer_name"
    )
    .eq("order_reference", reference)
    .single();

  if (error || !data) return null;

  return data as {
    order_reference: string;
    status: string;
    school_name: string;
    grade: string;
    estimated_total: number;
    buyer_name: string;
  };
}

export type OrderStatusInfo = Awaited<ReturnType<typeof getOrderByReference>>;
