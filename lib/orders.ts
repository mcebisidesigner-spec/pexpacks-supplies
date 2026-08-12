import { randomBytes, randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "./supabase/admin";

function generateOrderReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomUUID().slice(0, 6).toUpperCase();
  return `PEX-${timestamp}-${suffix}`;
}

export function generateUniqueCustomerId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `CUST-${num}`;
}

export function generateTrackingToken(): string {
  return randomBytes(32).toString("hex");
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
  paymentGateway?: string;
  gatewayMetadata?: Record<string, string | number | boolean | null>;
  idempotencyKey?: string;
}) {
  const supabase = createSupabaseAdminClient();

  const orderId = randomUUID();
  const uniqueCustomerId = generateUniqueCustomerId();
  const trackingToken = generateTrackingToken();

  const packItems = Array.isArray(input.items) ? input.items : [];
  const hasPexcover = packItems.some(
    (item) => typeof item === "string" && item.toLowerCase().includes("pexcover")
  );
  const metaIdempotency = input.idempotencyKey
    ? { idempotency_key: input.idempotencyKey }
    : undefined;
  const metaNotes = input.notes ? { notes: input.notes } : undefined;
  const metaGateway = input.gatewayMetadata
    ? { gateway: input.gatewayMetadata }
    : undefined;
  const meta = metaNotes || metaGateway || metaIdempotency
    ? { ...metaNotes, ...metaGateway, ...metaIdempotency }
    : undefined;

  const { error } = await supabase
    .from("orders")
    .insert({
      id: orderId,
      order_reference: input.orderReference,
      unique_customer_id: uniqueCustomerId,
      tracking_token: trackingToken,
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
      metadata: meta,
      pexcover_requested: hasPexcover,
      consent: true,
      payment_gateway: input.paymentGateway ?? null,
      status: "pending_payment",
    });

  if (error) {
    console.error("[orders] Failed to create pending order:", JSON.stringify(error));
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return { id: orderId, orderReference: input.orderReference, uniqueCustomerId, trackingToken };
}

export async function getOrderByIdempotencyKey(idempotencyKey: string) {
  if (!idempotencyKey) return null;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_reference, unique_customer_id, tracking_token")
    .filter("metadata->>idempotency_key", "eq", idempotencyKey)
    .maybeSingle();

  if (error) {
    console.warn("[orders] getOrderByIdempotencyKey notice:", error.message);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id as string,
    orderReference: data.order_reference as string,
    uniqueCustomerId: data.unique_customer_id as string,
    trackingToken: data.tracking_token as string,
  };
}

export async function getOrderByReference(reference: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_reference, status, school_name, grade, estimated_total, buyer_name, unique_customer_id, tracking_token"
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
    unique_customer_id?: string;
    tracking_token?: string;
  };
}

export async function markOrderPaid(input: {
  orderReference: string;
  paymentGateway?: string;
  gatewayReference?: string;
  amount?: number | null;
  metadata?: Record<string, unknown> | null;
}) {
  const supabase = createSupabaseAdminClient();

  try {
    // 1. Fetch current order for idempotency check
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, status, estimated_total, metadata")
      .eq("order_reference", input.orderReference)
      .maybeSingle();

    if (existingOrder?.status === "paid") {
      console.log(`[orders] Order ${input.orderReference} is already marked as paid. Idempotent skip.`);
      return { success: true, alreadyPaid: true };
    }

    // 2. Update order status
    const mergedMetadata = {
      ...((existingOrder?.metadata as Record<string, unknown>) || {}),
      ...(input.metadata || {}),
    };

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_gateway: input.paymentGateway ?? "ozow",
        gateway_reference: input.gatewayReference ?? null,
        metadata: mergedMetadata as any,
      })
      .eq("order_reference", input.orderReference);

    if (updateError) {
      console.error("[orders] Failed to mark order paid:", JSON.stringify(updateError));
      return { success: false, error: updateError };
    }

    // 3. Insert record into payments ledger
    const paymentAmount = input.amount ?? existingOrder?.estimated_total ?? 0;
    const { error: paymentError } = await supabase
      .from("payments" as any)
      .insert({
        order_reference: input.orderReference,
        gateway_reference: input.gatewayReference ?? null,
        amount: paymentAmount,
        currency: "ZAR",
        payment_gateway: input.paymentGateway ?? "ozow",
        status: "Complete",
        metadata: mergedMetadata as any,
      });

    if (paymentError) {
      console.warn("[orders] Payments table insert warning:", paymentError.message);
    }

    // 4. Record audit log
    await supabase.from("audit_logs" as any).insert({
      actor_id: "system",
      actor_name: "Ozow Webhook Pipeline",
      action: "payment.completed",
      entity_type: "order",
      entity_id: input.orderReference,
      summary: `Payment confirmed for ${input.orderReference}: R${paymentAmount} via ${input.paymentGateway || "ozow"}`
    });

  } catch (err) {
    console.error("[orders] markOrderPaid caught:", err instanceof Error ? err.message : err);
    return { success: false, error: err };
  }

  return { success: true };
}


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
  paymentGateway?: string;
  gatewayMetadata?: Record<string, string | number | boolean | null>;
  idempotencyKey?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const orderId = randomUUID();
  const uniqueCustomerId = generateUniqueCustomerId();
  const trackingToken = generateTrackingToken();

  const { error } = await supabase.from("orders").insert({
      id: orderId,
      order_reference: input.orderReference,
      unique_customer_id: uniqueCustomerId,
      tracking_token: trackingToken,
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
        ...(input.idempotencyKey ? { idempotency_key: input.idempotencyKey } : {}),
        ...(input.notes ? { notes: input.notes } : {}),
        ...(input.gatewayMetadata ? { gateway: input.gatewayMetadata } : {}),
      },
      payment_gateway: input.paymentGateway ?? null,
      consent: true,
      status: "pending_payment",
    });

    if (error) {
      console.error("[orders] Failed to create multi-pack order:", JSON.stringify(error));
      throw new Error(`Failed to create order: ${error.message}`);
    }

  return { id: orderId, orderReference: input.orderReference, uniqueCustomerId, trackingToken };
}

export async function getOrderForReceipt(reference: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_reference, unique_customer_id, tracking_token, status, buyer_name, buyer_email, buyer_phone, learner_name, school_name, grade, pack_type, items, estimated_total, fulfilment_option, payment_gateway, gateway_reference, paid_at, metadata, created_at"
    )
    .eq("order_reference", reference)
    .single();

  if (error || !data) return null;

  return data as {
    order_reference: string;
    unique_customer_id?: string | null;
    tracking_token?: string | null;
    status: string;
    buyer_name: string;
    buyer_email: string | null;
    buyer_phone: string;
    learner_name: string | null;
    school_name: string;
    grade: string;
    pack_type: string;
    items: unknown;
    estimated_total: number | null;
    fulfilment_option: string | null;
    payment_gateway: string | null;
    gateway_reference: string | null;
    paid_at: string | null;
    metadata: unknown;
    created_at: string;
  };
}
