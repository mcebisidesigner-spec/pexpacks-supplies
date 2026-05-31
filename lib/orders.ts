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

  const packItems = Array.isArray(input.items) ? input.items : [];
  const hasPexcover = packItems.some(
    (item) => typeof item === "string" && item.toLowerCase().includes("pexcover")
  );
  const metaNotes = input.notes ? { notes: input.notes } : undefined;

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
      items: packItems.length > 0 ? packItems : null,
      estimated_total: input.estimatedTotal,
      fulfilment_option:
        input.deliveryMethod === "school_collection"
          ? "School collection"
          : input.deliveryMethod === "delivery"
            ? "Home delivery"
            : "Collection point",
      metadata: metaNotes || undefined,
      pexcover_requested: hasPexcover,
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

export async function createMultiPackOrder(input: {
  orderReference: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  packs: {
    learnerName: string;
    schoolSlug: string;
    schoolName: string;
    grade: string;
    gradeSlug: string;
    packName: string;
    packMode: string;
    items: { name: string; quantity: number; unitPrice?: number }[];
    totalPrice: number;
    wantsPexcover?: boolean;
    pexcoverPrice?: number;
    basePackPrice?: number;
  }[];
  estimatedTotal: number;
  deliveryMethod: string;
  primarySchoolSlug?: string;
  notes?: string;
  summaryItems: string[];
}) {
  const supabase = createSupabaseAdminClient();
  const orderId = randomUUID();

  const { error } = await supabase.from("orders").insert({
    id: orderId,
    order_reference: input.orderReference,
    buyer_name: input.buyerName,
    buyer_phone: input.buyerPhone,
    buyer_email: input.buyerEmail || null,
    school_slug: input.primarySchoolSlug || input.packs[0]?.schoolSlug || "",
    school_name: input.packs.find((p) => p.schoolSlug === input.primarySchoolSlug)?.schoolName || input.packs[0]?.schoolName || "Multiple schools",
    grade: input.packs.map((p) => p.grade).filter(Boolean).join(", ") || "Multiple grades",
    pack_type: "multi-school",
    items: input.summaryItems,
    estimated_total: input.estimatedTotal,
    fulfilment_option:
      input.deliveryMethod === "school_collection"
        ? "School collection"
        : input.deliveryMethod === "delivery"
          ? "Home delivery"
          : "Collection point",
    metadata: {
      packs: input.packs.map((p) => ({
        learner_name: p.learnerName,
        school_slug: p.schoolSlug,
        school_name: p.schoolName,
        grade: p.grade,
        pack_name: p.packName,
        pack_mode: p.packMode,
        items: p.items,
        total_price: p.totalPrice + (p.wantsPexcover ? p.pexcoverPrice || 0 : 0),
        wants_pexcover: p.wantsPexcover || false,
        pexcover_price: p.wantsPexcover ? p.pexcoverPrice || 0 : 0,
        base_pack_price: p.basePackPrice || p.totalPrice,
      })),
      pack_count: input.packs.length,
      primary_school_slug: input.primarySchoolSlug || null,
      ...(input.notes ? { notes: input.notes } : {}),
    },
    consent: true,
    status: "pending_payment",
  });

  if (error) {
    console.error("[orders] Failed to create multi-pack order:", JSON.stringify(error));
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return { id: orderId, orderReference: input.orderReference };
}
