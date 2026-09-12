import { createHash, randomBytes, randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { createSupabaseAdminClient } from "./supabase/admin";
import { DASHBOARD_STATS_TAG, DASHBOARD_SUMMARY_TAG } from "./admin/dashboard";
import {
  normalisePexcoverPaperStyle,
  type PexcoverPaperStyle,
} from "./pricing/pexcover-paper-style";

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

type OrderSnapshotPack = {
  packId?: string;
  schoolName: string;
  grade: string;
  items: {
    id?: string;
    name: string;
    quantity: number;
    unitPrice?: number;
    requiresPexcover?: boolean;
  }[];
};

type OrderSnapshot = {
  product_id: string | null;
  pack_id: string | null;
  sku_snapshot: string;
  product_name_snapshot: string;
  quantity: number;
  unit_selling_price: number;
  estimated_unit_cost: number | null;
  expected_margin: number | null;
  pricing_version: string;
  school_name_snapshot: string;
  grade_snapshot: string;
  requires_pexcover: boolean;
};

async function buildOrderSnapshots(
  packs: OrderSnapshotPack[],
): Promise<OrderSnapshot[]> {
  const supabase = createSupabaseAdminClient();
  const lines = packs.flatMap((pack) =>
    pack.items.map((item) => ({ ...item, pack })),
  );
  if (!lines.length) return [];

  const names = [
    ...new Set(lines.map((line) => line.name.trim()).filter(Boolean)),
  ];
  const { data: products, error: productError } = await supabase
    .from("master_products" as never)
    .select(
      "id,sku,name,latest_verified_cost,current_selling_price,requires_pexcover",
    )
    .in("name", names);

  if (productError) {
    throw new Error(
      "Unable to resolve order products: " + productError.message,
    );
  }

  const productByName = new Map(
    (
      (products ?? []) as Array<{
        id: string;
        sku: string;
        name: string;
        latest_verified_cost: number | null;
        current_selling_price: number;
        requires_pexcover: boolean;
      }>
    ).map((product) => [product.name.trim().toLowerCase(), product]),
  );

  return lines.map((line) => {
    const product = productByName.get(line.name.trim().toLowerCase());
    const unitPrice = Number(
      line.unitPrice ?? product?.current_selling_price ?? 0,
    );
    const estimatedCost =
      product?.latest_verified_cost == null
        ? null
        : Number(product.latest_verified_cost);
    return {
      product_id: product?.id ?? null,
      pack_id: line.pack.packId ?? null,
      sku_snapshot:
        product?.sku ??
        ("UNMATCHED-" +
          createHash("sha1")
            .update(line.name.trim().toLowerCase())
            .digest("hex")
            .slice(0, 10)
            .toUpperCase()),
      product_name_snapshot: line.name,
      quantity: Math.max(1, Math.trunc(line.quantity)),
      unit_selling_price: unitPrice,
      estimated_unit_cost: estimatedCost,
      expected_margin:
        estimatedCost == null || unitPrice <= 0
          ? null
          : (unitPrice - estimatedCost) / unitPrice,
      pricing_version: "operations-v1",
      school_name_snapshot: line.pack.schoolName,
      grade_snapshot: line.pack.grade,
      requires_pexcover:
        line.requiresPexcover ?? Boolean(product?.requires_pexcover),
    };
  });
}

type PendingOrderRecord = {
  id: string;
  order_reference: string;
  unique_customer_id: string;
  tracking_token: string;
};

async function persistPendingOrder(
  order: Record<string, unknown>,
  packs: OrderSnapshotPack[],
  idempotencyKey?: string,
): Promise<{
  id: string;
  orderReference: string;
  uniqueCustomerId: string;
  trackingToken: string;
}> {
  const supabase = createSupabaseAdminClient();
  const snapshots = await buildOrderSnapshots(packs);
  const rpc = supabase.rpc.bind(supabase) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data: unknown;
    error: { message: string; code?: string } | null;
  }>;

  const { data, error } = await rpc("create_pending_order_with_snapshots", {
    p_order: order,
    p_snapshots: snapshots,
  });

  if (error) {
    if (error.code === "23505" && idempotencyKey) {
      const existing = await getOrderByIdempotencyKey(idempotencyKey);
      if (existing) return existing;
    }
    console.error("[orders] Failed to create pending order:", error.message);
    throw new Error("Failed to create order: " + error.message);
  }

  const created = data as PendingOrderRecord | null;
  if (
    !created?.id ||
    !created.order_reference ||
    !created.unique_customer_id ||
    !created.tracking_token
  ) {
    throw new Error("Failed to create order: invalid database response.");
  }

  return {
    id: created.id,
    orderReference: created.order_reference,
    uniqueCustomerId: created.unique_customer_id,
    trackingToken: created.tracking_token,
  };
}

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
  packId?: string;
  snapshotItems?: {
    name: string;
    quantity: number;
    unitPrice?: number;
    requiresPexcover?: boolean;
  }[];
}) {
  const orderId = randomUUID();
  const uniqueCustomerId = generateUniqueCustomerId();
  const trackingToken = generateTrackingToken();
  const packItems = Array.isArray(input.items) ? input.items : [];
  const hasPexcover = packItems.some(
    (item) =>
      typeof item === "string" && item.toLowerCase().includes("pexcover"),
  );
  const meta = {
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.gatewayMetadata ? { gateway: input.gatewayMetadata } : {}),
    ...(input.idempotencyKey ? { idempotency_key: input.idempotencyKey } : {}),
  };

  return persistPendingOrder(
    {
      id: orderId,
      order_reference: input.orderReference,
      unique_customer_id: uniqueCustomerId,
      tracking_token: trackingToken,
      buyer_name: input.buyerName,
      buyer_phone: input.buyerPhone,
      buyer_email: input.buyerEmail,
      learner_name: input.learnerName ?? null,
      school_slug: input.schoolSlug,
      school_name: input.schoolName,
      grade: input.grade,
      pack_type: input.packType,
      items: packItems,
      estimated_total: input.estimatedTotal,
      fulfilment_option:
        input.deliveryMethod === "school_collection"
          ? "School collection"
          : input.deliveryMethod === "delivery"
            ? "Home delivery"
            : "Collection point",
      metadata: meta,
      payment_gateway: input.paymentGateway ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      consent: true,
      pexcover_requested: hasPexcover,
    },
    [
      {
        packId: input.packId,
        schoolName: input.schoolName,
        grade: input.grade,
        items: input.snapshotItems ?? [],
      },
    ],
    input.idempotencyKey,
  );
}

export async function getOrderByIdempotencyKey(idempotencyKey: string) {
  if (!idempotencyKey) return null;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_reference, unique_customer_id, tracking_token")
    .eq("idempotency_key", idempotencyKey)
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
      "order_reference, status, school_name, grade, estimated_total, buyer_name, unique_customer_id, tracking_token",
    )
    .eq("order_reference", reference)
    .single();

  if (error || !data) return null;

  return data as {
    id: string;
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
  currency?: string | null;
  paymentMethod?: string;
  metadata?: Record<string, unknown> | null;
}) {
  const supabase = createSupabaseAdminClient();
  try {
    const rpc = supabase.rpc.bind(supabase) as unknown as (
      name: string,
      args: Record<string, unknown>,
    ) => Promise<{
      data: unknown;
      error: { message: string; code?: string } | null;
    }>;
    const { data, error } = await rpc("complete_order_payment", {
      p_order_reference: input.orderReference,
      p_gateway_reference: input.gatewayReference ?? null,
      p_amount: input.amount,
      p_currency: input.currency ?? "ZAR",
      p_provider: input.paymentGateway ?? "ozow",
      p_payment_method: input.paymentMethod ?? "Ozow",
      p_payload: input.metadata ?? {},
    });
    if (error) {
      console.error(
        "[orders] Atomic payment completion failed:",
        error.message,
      );
      return { success: false, error };
    }

    try {
      await supabase.rpc("refresh_all_dashboard_summaries");
    } catch (summaryErr) {
      console.warn(
        "[orders] dashboard summary refresh warning:",
        summaryErr instanceof Error ? summaryErr.message : summaryErr,
      );
    }

    const result =
      data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    revalidateTag(DASHBOARD_STATS_TAG, { expire: 0 });
    revalidateTag(DASHBOARD_SUMMARY_TAG, { expire: 0 });
    return { success: true, alreadyPaid: result.already_paid === true };
  } catch (err) {
    console.error(
      "[orders] markOrderPaid caught:",
      err instanceof Error ? err.message : err,
    );
    return { success: false, error: err };
  }
}

export async function recordOrderPaymentStatus(input: {
  orderReference: string;
  gatewayReference?: string | null;
  status: string;
  amount?: number | null;
  currency?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const supabase = createSupabaseAdminClient();
  const rpc = supabase.rpc.bind(supabase) as unknown as (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
  const { data, error } = await rpc("record_order_payment_status", {
    p_order_reference: input.orderReference,
    p_gateway_reference: input.gatewayReference ?? null,
    p_status: input.status,
    p_amount: input.amount ?? null,
    p_currency: input.currency ?? "ZAR",
    p_payload: input.metadata ?? {},
  });
  if (error) return { success: false, error };
  revalidateTag(DASHBOARD_STATS_TAG, { expire: 0 });
  revalidateTag(DASHBOARD_SUMMARY_TAG, { expire: 0 });
  return { success: true, data };
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
    items: {
      id?: string;
      name: string;
      quantity: number;
      unitPrice?: number;
      requiresPexcover?: boolean;
    }[];
    totalPrice: number;
    wantsPexcover?: boolean;
    pexcoverPrice?: number;
    pexcoverPaperStyle?: PexcoverPaperStyle;
    basePackPrice?: number;
    packId?: string;
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
  const orderId = randomUUID();
  const uniqueCustomerId = generateUniqueCustomerId();
  const trackingToken = generateTrackingToken();
  const primaryPack =
    input.packs.find((pack) => pack.schoolSlug === input.primarySchoolSlug) ??
    input.packs[0];

  return persistPendingOrder(
    {
      id: orderId,
      order_reference: input.orderReference,
      unique_customer_id: uniqueCustomerId,
      tracking_token: trackingToken,
      buyer_name: input.buyerName,
      buyer_phone: input.buyerPhone,
      buyer_email: input.buyerEmail,
      school_slug: input.primarySchoolSlug || input.packs[0]?.schoolSlug || "",
      school_name: primaryPack?.schoolName || "Multiple schools",
      grade:
        input.packs
          .map((pack) => pack.grade)
          .filter(Boolean)
          .join(", ") || "Multiple grades",
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
        packs: input.packs.map((pack) => ({
          learner_name: pack.learnerName,
          school_slug: pack.schoolSlug,
          school_name: pack.schoolName,
          grade: pack.grade,
          pack_name: pack.packName,
          pack_mode: pack.packMode,
          items: pack.items,
          total_price:
            pack.totalPrice +
            (pack.wantsPexcover ? pack.pexcoverPrice || 0 : 0),
          wants_pexcover: pack.wantsPexcover || false,
          pexcover_price: pack.wantsPexcover ? pack.pexcoverPrice || 0 : 0,
          pexcover_paper_style: pack.wantsPexcover
            ? normalisePexcoverPaperStyle(pack.pexcoverPaperStyle)
            : null,
          base_pack_price: pack.basePackPrice || pack.totalPrice,
        })),
        pack_count: input.packs.length,
        primary_school_slug: input.primarySchoolSlug || null,
        ...(input.idempotencyKey
          ? { idempotency_key: input.idempotencyKey }
          : {}),
        ...(input.notes ? { notes: input.notes } : {}),
        ...(input.gatewayMetadata ? { gateway: input.gatewayMetadata } : {}),
      },
      payment_gateway: input.paymentGateway ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      consent: true,
      pexcover_requested: input.packs.some((pack) => pack.wantsPexcover),
    },
    input.packs.map((pack) => ({
      packId: pack.packId,
      schoolName: pack.schoolName,
      grade: pack.grade,
      items: pack.items,
    })),
    input.idempotencyKey,
  );
}

export async function getOrderForReceipt(reference: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_reference, unique_customer_id, tracking_token, status, buyer_name, buyer_email, buyer_phone, learner_name, school_name, grade, pack_type, items, estimated_total, fulfilment_option, payment_gateway, gateway_reference, paid_at, metadata, created_at",
    )
    .eq("order_reference", reference)
    .single();

  if (error || !data) return null;

  return data as {
    id: string;
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
