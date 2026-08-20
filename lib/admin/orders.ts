import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type PermissionKey,
  type AdminSession,
} from "@/lib/admin/rbac";
import { ORDER_STATUSES } from "@/lib/admin/order-constants";

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

const ORDER_LIST_FIELDS =
  "id,order_reference,buyer_name,buyer_email,buyer_phone,school_name,grade,learner_name,pack_type,items,estimated_total,status,payment_gateway,gateway_reference,paid_at,created_at,updated_at,fulfilment_option,school_slug";

const ORDER_DETAIL_FIELDS = [
  ORDER_LIST_FIELDS,
  "metadata",
  "delivery_address",
  "preferred_contact_method",
  "delivery_type",
  "pexcover_requested",
  "street_address",
  "suburb",
  "city",
  "province",
  "postal_code",
  "payment_reference",
  "unique_customer_id",
  "tracking_token",
].join(",");

export interface OrderListFilters {
  q?: string;
  status?: string;
  pack_type?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderListResult {
  orders: OrderRow[];
  total: number;
  page: number;
  pageCount: number;
  statusOptions: { value: string; label: string }[];
  packTypes: string[];
}

const statusSchema = z
  .string()
  .trim()
  .min(1, "Status is required")
  .max(60, "Status is too long");

function endOfDay(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date}T23:59:59.999Z`;
  return date;
}

const DEFAULT_EXPORT_LIMIT = 5000;
const BROAD_EXPORT_LIMIT = 1000;

async function assertCan(permission: PermissionKey): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, permission)) {
    const err = new Error("You don't have permission to do that.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

export function parseOrderStatus(formData: FormData): {
  ok: true; status: string;
} | { ok: false; errors: Record<string, string> } {
  const raw = formData.get("status");
  const parsed = statusSchema.safeParse(typeof raw === "string" ? raw : "");
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  return { ok: true, status: parsed.data };
}

export async function listOrders(
  filters: OrderListFilters = {}
): Promise<OrderListResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin.from("orders").select(ORDER_LIST_FIELDS, { count: "exact" });

  if (filters.q) {
    const q = filters.q.replace(/%/g, "").trim();
    if (q) {
      query = query.or(
        `order_reference.ilike.%${q}%,buyer_name.ilike.%${q}%,buyer_email.ilike.%${q}%,buyer_phone.ilike.%${q}%`
      );
    }
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.pack_type) query = query.eq("pack_type", filters.pack_type);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", endOfDay(filters.to));

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[orders] list failed:", error);
    return { orders: [], total: 0, page, pageCount: 0, statusOptions: [], packTypes: [] };
  }

  const statusOptions = ORDER_STATUSES.map((s) => ({ value: s.value, label: s.label }));

  return {
    orders: (data ?? []) as OrderRow[],
    total: count ?? 0,
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    statusOptions,
    packTypes: await listOrderPackTypes(),
  };
}

export async function listOrderPackTypes(): Promise<string[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("get_order_pack_types");
  if (error || !data) return [];
  return data.map((r) => r.pack_type).filter(Boolean);
}

export async function getOrder(idOrRef: string): Promise<OrderRow | null> {
  const admin = createSupabaseAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrRef);

  let query = admin.from("orders").select(ORDER_DETAIL_FIELDS);

  if (isUuid) {
    query = query.eq("id", idOrRef);
  } else {
    query = query.ilike("order_reference", idOrRef);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error("[orders] get failed:", error);
    return null;
  }
  if (!data) return null;
  return data as unknown as OrderRow;
}

export async function updateOrderStatus(id: string, status: string): Promise<{ ok: boolean; message?: string }> {
  const session = await assertCan("orders.edit");
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("orders")
    .select("id, order_reference, status, buyer_email, buyer_name, tracking_token, courier_name, waybill_number, estimated_delivery")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, message: "Order not found." };

  const { error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("[orders] status update failed:", error);
    return { ok: false, message: error.message };
  }

  await writeAuditLog({
    action: "orders.update_status",
    entityType: "order",
    entityId: id,
    summary: `Order ${existing.order_reference}: status changed from ${existing.status || "none"} to ${status}`,
    details: { from: existing.status, to: status },
    actorId: session.user.id,
    actorName: session.user.email ?? null,
  });

  // Fire-and-forget status update notification
  if (existing.buyer_email) {
    sendOrderUpdateNotificationFromOrders(existing, status).catch(() => {});
  }

  return { ok: true };
}

async function sendOrderUpdateNotificationFromOrders(
  order: { order_reference: string; buyer_email: string | null; buyer_name: string | null; tracking_token: string | null; status: string; courier_name: string | null; waybill_number: string | null; estimated_delivery: string | null },
  newStatus: string,
) {
  try {
    const { sendOrderStatusUpdate } = await import("@/lib/email/orderStatusUpdate");
    await sendOrderStatusUpdate({
      order_reference: order.order_reference,
      buyer_email: order.buyer_email,
      buyer_name: order.buyer_name || "there",
      tracking_token: order.tracking_token,
      status: newStatus,
      courier_name: order.courier_name,
      waybill_number: order.waybill_number,
      estimated_delivery: order.estimated_delivery,
    });
  } catch (err) {
    console.error("[email] status update notification failed:", err);
  }
}

export async function refundOrder(
  id: string,
  reason?: string,
  permission: PermissionKey = "orders.refund"
): Promise<{ ok: boolean; message?: string }> {
  const session = await assertCan(permission);
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("orders")
    .select("id, order_reference, status, metadata")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, message: "Order not found." };

  const metadata = (existing.metadata ?? {}) as Record<string, unknown>;
  const nextMetadata: Json = {
    ...metadata,
    refund: {
      refunded_at: new Date().toISOString(),
      refunded_by: session.user.email ?? null,
      reason: reason?.trim() || null,
    },
  };

  const { error } = await admin
    .from("orders")
    .update({ status: "refunded", metadata: nextMetadata })
    .eq("id", id);

  if (error) {
    console.error("[orders] refund failed:", error);
    return { ok: false, message: error.message };
  }

  await writeAuditLog({
    action: "orders.refund",
    entityType: "order",
    entityId: id,
    summary: `Order ${existing.order_reference} refunded${reason?.trim() ? ` (${reason.trim()})` : ""}`,
    details: { reason: reason?.trim() || null },
    actorId: session.user.id,
    actorName: session.user.email ?? null,
  });

  return { ok: true };
}

import { sendOrderDeletionArchiveEmail } from "@/lib/email/orderDeletionArchive";

export async function deleteOrder(
  idOrRef: string,
  permission: PermissionKey = "orders.delete"
): Promise<{ ok: boolean; message?: string }> {
  const session = await assertCan(permission);
  const admin = createSupabaseAdminClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrRef);

  let findQuery = admin.from("orders").select(ORDER_DETAIL_FIELDS);
  if (isUuid) {
    findQuery = findQuery.eq("id", idOrRef);
  } else {
    findQuery = findQuery.ilike("order_reference", idOrRef);
  }

  const { data: rawOrder } = await findQuery.maybeSingle();
  const fullOrder = rawOrder as Record<string, unknown> | null;
  if (!fullOrder) return { ok: false, message: "Order not found." };

  const orderRef = String((fullOrder.order_reference as string) || "");

  // 1. Fetch matching payment / gateway records before purging
  let matchingPayments: Record<string, unknown>[] = [];
  if (orderRef) {
    const { data: payRows } = await admin
      .from("payments")
      .select("id,order_reference,gateway_reference,amount,currency,payment_gateway,status,metadata,created_at")
      .ilike("order_reference", orderRef);
    if (payRows && Array.isArray(payRows)) {
      matchingPayments = payRows as Record<string, unknown>[];
    }
  }

  // 2. Dispatch Order Deletion Archive Email to orders@pexpacks.co.za and mcebisi@pexpacks.co.za
  try {
    await sendOrderDeletionArchiveEmail({
      order: fullOrder as Record<string, unknown>,
      payments: matchingPayments,
      deletedBy: session.user.email ?? "Administrator",
    });
  } catch (err) {
    console.error("[orders] Archive email dispatch error:", err);
  }

  // 3. Purge associated payment records from payments table
  if (orderRef) {
    await admin
      .from("payments")
      .delete()
      .ilike("order_reference", orderRef);
  }

  // 4. Delete primary order record from orders table
  const { error } = await admin
    .from("orders")
    .delete()
    .eq("id", String(fullOrder.id));

  if (error) {
    console.error("[orders] delete failed:", error);
    return { ok: false, message: error.message };
  }

  // 5. Recalculate pre-aggregated dashboard summaries immediately
  try {
    await admin.rpc("refresh_all_dashboard_summaries");
  } catch (err) {
    console.warn("[orders] refresh_all_dashboard_summaries warning:", err);
  }

  // 6. Record audit log
  await writeAuditLog({
    action: "orders.delete",
    entityType: "order",
    entityId: String(fullOrder.id),
    summary: `Permanently deleted order ${orderRef} (${String(fullOrder.buyer_name || "Unknown")}) across all system tables and dispatched archive email`,
    details: { order_reference: orderRef },
    actorId: session.user.id,
    actorName: session.user.email ?? null,
  });

  return { ok: true };
}

export async function exportOrders(
  filters: Omit<OrderListFilters, "page" | "pageSize"> = {}
): Promise<OrderRow[]> {
  const admin = createSupabaseAdminClient();
  const hasNarrowFilter = Boolean(
    filters.q || filters.status || filters.pack_type || filters.from || filters.to
  );
  const limit = hasNarrowFilter ? DEFAULT_EXPORT_LIMIT : BROAD_EXPORT_LIMIT;
  let query = admin.from("orders").select(ORDER_LIST_FIELDS);

  if (filters.q) {
    const q = filters.q.replace(/%/g, "").trim();
    if (q) {
      query = query.or(
        `order_reference.ilike.%${q}%,buyer_name.ilike.%${q}%,buyer_email.ilike.%${q}%,buyer_phone.ilike.%${q}%`
      );
    }
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.pack_type) query = query.eq("pack_type", filters.pack_type);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", endOfDay(filters.to));

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[orders] export failed:", error);
    return [];
  }
  return (data ?? []) as OrderRow[];
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export function ordersToCsv(rows: OrderRow[]): string {
  const header = [
    "Reference",
    "Created",
    "Status",
    "Buyer name",
    "Buyer email",
    "Buyer phone",
    "School",
    "Grade",
    "Learner",
    "Pack type",
    "Items",
    "Total (ZAR)",
    "Delivery",
    "Gateway",
    "Gateway reference",
    "Paid at",
  ];
  const lines = rows.map((o) =>
    [
      o.order_reference,
      o.created_at,
      o.status,
      o.buyer_name,
      o.buyer_email,
      o.buyer_phone,
      o.school_name,
      o.grade,
      o.learner_name,
      o.pack_type,
      Array.isArray(o.items) ? o.items.map((i) => (typeof i === "string" ? i : JSON.stringify(i))).join("; ") : "",
      o.estimated_total ?? "",
      o.fulfilment_option ?? o.delivery_type ?? "",
      o.payment_gateway ?? "",
      o.gateway_reference ?? o.payment_reference ?? "",
      o.paid_at ?? "",
    ]
      .map(csvCell)
      .join(",")
  );
  return [header.map(csvCell).join(","), ...lines].join("\r\n");
}
