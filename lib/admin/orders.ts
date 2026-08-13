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

export async function getOrder(id: string): Promise<OrderRow | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(ORDER_DETAIL_FIELDS)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    console.error("[orders] get failed:", error);
    return null;
  }
  return data as unknown as OrderRow;
}

export async function updateOrderStatus(id: string, status: string): Promise<{ ok: boolean; message?: string }> {
  const session = await assertCan("orders.edit");
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from("orders")
    .select("id, order_reference, status")
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

  return { ok: true };
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

export async function exportOrders(
  filters: Omit<OrderListFilters, "page" | "pageSize"> = {}
): Promise<OrderRow[]> {
  const admin = createSupabaseAdminClient();
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

  const { data, error } = await query.order("created_at", { ascending: false });
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
