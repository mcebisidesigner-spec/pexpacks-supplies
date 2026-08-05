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
  paymentGateway?: string;
  gatewayMetadata?: Record<string, string | number | boolean | null>;
}) {
  const supabase = createSupabaseAdminClient();

  const orderId = randomUUID();

  const packItems = Array.isArray(input.items) ? input.items : [];
  const hasPexcover = packItems.some(
    (item) => typeof item === "string" && item.toLowerCase().includes("pexcover")
  );
  const metaNotes = input.notes ? { notes: input.notes } : undefined;
  const metaGateway = input.gatewayMetadata
    ? { gateway: input.gatewayMetadata }
    : undefined;
  const meta = metaNotes || metaGateway
    ? { ...metaNotes, ...metaGateway }
    : undefined;

  try {
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
        metadata: meta,
        pexcover_requested: hasPexcover,
        consent: true,
        payment_gateway: input.paymentGateway ?? null,
        status: "pending_payment",
      });

    if (error) {
      console.error("[orders] Failed to create pending order:", JSON.stringify(error));
    }
  } catch (err) {
    console.error("[orders] createPendingOrder caught:", err instanceof Error ? err.message : err);
  }

  return { id: orderId, orderReference: input.orderReference };
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

export async function markOrderPaid(input: {
  orderReference: string;
  paymentGateway?: string;
  gatewayReference?: string;
}) {
  const supabase = createSupabaseAdminClient();

  try {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_gateway: input.paymentGateway ?? null,
        gateway_reference: input.gatewayReference ?? null,
      })
      .eq("order_reference", input.orderReference);

    if (error) {
      console.error("[orders] Failed to mark order paid:", JSON.stringify(error));
      return { success: false, error };
    }
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
}) {
  const supabase = createSupabaseAdminClient();
  const orderId = randomUUID();

  try {
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
        ...(input.gatewayMetadata ? { gateway: input.gatewayMetadata } : {}),
      },
      payment_gateway: input.paymentGateway ?? null,
      consent: true,
      status: "pending_payment",
    });

    if (error) {
      console.error("[orders] Failed to create multi-pack order:", JSON.stringify(error));
    }
  } catch (err) {
    console.error("[orders] createMultiPackOrder caught:", err instanceof Error ? err.message : err);
  }

  return { id: orderId, orderReference: input.orderReference };
}

export async function getOrderForReceipt(reference: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_reference, status, buyer_name, buyer_email, buyer_phone, learner_name, school_name, grade, pack_type, items, estimated_total, fulfilment_option, payment_gateway, gateway_reference, paid_at, metadata, created_at"
    )
    .eq("order_reference", reference)
    .single();

  if (error || !data) return null;

  return data as {
    order_reference: string;
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
