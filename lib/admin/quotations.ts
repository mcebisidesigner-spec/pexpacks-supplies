import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, writeAuditLog } from "@/lib/admin/rbac";

export type QuotationStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "declined"
  | "expired"
  | "converted_to_order";

export interface QuotationItemRow {
  id: string;
  quotation_id: string;
  master_product_id: string | null;
  item_title: string;
  sku: string | null;
  unit: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  cost_price?: number;
  margin_percent?: number;
  created_at: string;
}

export interface QuotationRow {
  id: string;
  quote_number: string;
  school_id: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  status: QuotationStatus;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  discount_amount?: number;
  delivery_fee?: number;
  vat_enabled?: boolean;
  total_amount: number;
  valid_until: string;
  notes: string | null;
  pdf_storage_path: string | null;
  pdf_status?: "pending" | "generated" | "failed";
  pdf_generated_at?: string | null;
  pdf_version?: number;
  converted_order_id?: string | null;
  created_at: string;
  updated_at: string;
  school?: {
    id: string;
    name: string;
    slug?: string | null;
    city?: string | null;
    province?: string | null;
  } | null;
  items_count?: number;
  items?: QuotationItemRow[];
}

export interface QuotationEventRow {
  id: string;
  quotation_id: string;
  event_type: string;
  actor_id: string | null;
  actor_email: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface QuotationsListResult {
  quotations: QuotationRow[];
  totalCount: number;
  stats: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    declined: number;
    converted: number;
    expired: number;
    totalValue: number;
    acceptedValue: number;
    conversionRate: number;
  };
}

export const quotationItemSchema = z.object({
  master_product_id: z.string().uuid().nullable().optional(),
  item_title: z.string().trim().min(1, "Item description is required"),
  sku: z.string().trim().nullable().optional(),
  unit: z.string().trim().default("Each"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0, "Unit price must be positive"),
  cost_price: z.coerce.number().min(0).nullable().optional(),
  supplier_snapshot: z.string().trim().nullable().optional(),
  availability_snapshot: z.string().trim().nullable().optional(),
});

export const quotationInputSchema = z.object({
  school_id: z.string().uuid().nullable().optional(),
  recipient_name: z.string().trim().min(2, "Recipient name is required"),
  recipient_email: z.string().trim().email("Valid email address is required"),
  recipient_phone: z.string().trim().nullable().optional(),
  valid_until: z.string().min(1, "Validity date is required"),
  notes: z.string().trim().nullable().optional(),
  discount_amount: z.coerce.number().min(0).default(0).optional(),
  delivery_fee: z.coerce.number().min(0).default(0).optional(),
  vat_enabled: z.boolean().default(true).optional(),
  items: z.array(quotationItemSchema).min(1, "At least one line item is required"),
});

export type QuotationInput = z.infer<typeof quotationInputSchema>;

/**
 * Generate sequential Quote Number using atomic database sequence
 */
export async function generateQuoteNumber(): Promise<string> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("next_quotation_number" as never);
  if (!error && data) {
    return data as unknown as string;
  }
  const year = new Date().getFullYear();
  return `PX-Q-${year}-${Date.now().toString().slice(-4)}`;
}

/**
 * List quotations with server-side filters and aggregated KPIs via single RPC
 */
export async function listQuotations(options?: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<QuotationsListResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, options?.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const { data, error } = await admin.rpc("admin_quotations_dashboard" as never, {
    p_search: options?.search?.trim() || null,
    p_status: options?.status && options.status !== "all" ? options.status : null,
    p_limit: pageSize,
    p_offset: offset,
  } as never);

  if (error || !data) {
    console.error("[quotations] admin_quotations_dashboard failed:", error);
    return {
      quotations: [],
      totalCount: 0,
      stats: {
        total: 0,
        draft: 0,
        sent: 0,
        accepted: 0,
        declined: 0,
        converted: 0,
        expired: 0,
        totalValue: 0,
        acceptedValue: 0,
        conversionRate: 0,
      },
    };
  }

  const raw = data as any;
  const stats = raw.stats || {};
  return {
    quotations: (raw.quotations ?? []) as QuotationRow[],
    totalCount: Number(raw.total_count || 0),
    stats: {
      total: Number(stats.total || 0),
      draft: Number(stats.draft || 0),
      sent: Number(stats.sent || 0),
      accepted: Number(stats.accepted || 0),
      declined: Number(stats.declined || 0),
      converted: Number(stats.converted || 0),
      expired: Number(stats.expired || 0),
      totalValue: Number(stats.total_pipeline_value || 0),
      acceptedValue: Number(stats.accepted_value || 0),
      conversionRate: Number(stats.conversion_rate || 0),
    },
  };
}

/**
 * Get quotation by ID or Quote Number with all line items
 */
export async function getQuotation(idOrNumber: string): Promise<QuotationRow | null> {
  const admin = createSupabaseAdminClient();
  const trimmed = idOrNumber.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);

  let query = admin
    .from("quotations" as never)
    .select(
      `
      id,
      quote_number,
      school_id,
      recipient_name,
      recipient_email,
      recipient_phone,
      status,
      subtotal,
      vat_rate,
      vat_amount,
      discount_amount,
      delivery_fee,
      vat_enabled,
      total_amount,
      valid_until,
      notes,
      pdf_storage_path,
      pdf_status,
      pdf_version,
      pdf_generated_at,
      converted_order_id,
      created_at,
      updated_at,
      school:schools (id, name, slug, city, province)
    `
    );

  if (isUuid) {
    query = query.eq("id" as never, trimmed);
  } else {
    query = query.eq("quote_number" as never, trimmed);
  }

  const { data: quote, error } = await query.maybeSingle();
  if (error || !quote) return null;

  const { data: items } = await admin
    .from("quotation_items" as never)
    .select("*")
    .eq("quotation_id" as never, (quote as any).id)
    .order("created_at" as never, { ascending: true });

  const q = quote as any;
  return {
    id: q.id,
    quote_number: q.quote_number,
    school_id: q.school_id,
    recipient_name: q.recipient_name,
    recipient_email: q.recipient_email,
    recipient_phone: q.recipient_phone,
    status: q.status as QuotationStatus,
    subtotal: Number(q.subtotal || 0),
    vat_rate: Number(q.vat_rate || 15),
    vat_amount: Number(q.vat_amount || 0),
    discount_amount: Number(q.discount_amount || 0),
    delivery_fee: Number(q.delivery_fee || 0),
    vat_enabled: q.vat_enabled ?? true,
    total_amount: Number(q.total_amount || 0),
    valid_until: q.valid_until,
    notes: q.notes,
    pdf_storage_path: q.pdf_storage_path,
    pdf_status: q.pdf_status || "pending",
    pdf_version: Number(q.pdf_version || 1),
    pdf_generated_at: q.pdf_generated_at,
    converted_order_id: q.converted_order_id,
    created_at: q.created_at,
    updated_at: q.updated_at,
    school: q.school,
    items: ((items ?? []) as any[]).map((item) => ({
      id: item.id,
      quotation_id: item.quotation_id,
      master_product_id: item.master_product_id,
      item_title: item.item_title,
      sku: item.sku,
      unit: item.unit || "Each",
      quantity: Number(item.quantity || 1),
      unit_price: Number(item.unit_price || 0),
      total_price: Number(item.total_price || 0),
      created_at: item.created_at,
    })),
  };
}

/**
 * Create a new quotation and its line items atomically
 */
export async function createQuotation(
  input: QuotationInput,
  status: QuotationStatus = "draft"
): Promise<{ ok: boolean; quotation?: QuotationRow; error?: string }> {
  const actor = await requireAdmin({ permission: "orders.view" });
  const admin = createSupabaseAdminClient();

  const validated = quotationInputSchema.safeParse(input);
  if (!validated.success) {
    return { ok: false, error: validated.error.issues?.[0]?.message || "Invalid input" };
  }

  // Filter out empty rows
  const cleanItems = validated.data.items.filter((item) => item.item_title.trim().length > 0);
  if (cleanItems.length === 0) {
    return { ok: false, error: "At least one valid line item is required." };
  }

  const payload = {
    school_id: validated.data.school_id || null,
    recipient_name: validated.data.recipient_name,
    recipient_email: validated.data.recipient_email,
    recipient_phone: validated.data.recipient_phone || null,
    valid_until: validated.data.valid_until,
    notes: validated.data.notes || null,
    discount_amount: validated.data.discount_amount || 0,
    delivery_fee: validated.data.delivery_fee || 0,
    vat_enabled: validated.data.vat_enabled ?? true,
    status,
    actor_id: actor.user.id,
    actor_email: actor.user.email,
    items: cleanItems,
  };

  const { data, error } = await admin.rpc("create_quotation_with_items" as never, {
    p_payload: payload,
  } as never);

  if (error || !data) {
    console.error("[quotations] create_quotation_with_items RPC failed:", error);
    return { ok: false, error: error?.message || "Failed to create quotation." };
  }

  const quoteId = (data as any).id;

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "quotations.create" as any,
    entityType: "quotation" as any,
    entityId: quoteId,
    summary: `Created quotation ${(data as any).quote_number} for ${validated.data.recipient_name} (Total: R${(data as any).total_amount})`,
  });

  const created = await getQuotation(quoteId);
  return { ok: true, quotation: created ?? (data as any) };
}

/**
 * Update quotation status
 */
export async function updateQuotationStatus(
  id: string,
  status: QuotationStatus
): Promise<{ ok: boolean; error?: string }> {
  const actor = await requireAdmin({ permission: "orders.view" });
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("quotations" as never)
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id);

  if (error) {
    console.error("[quotations] update status failed:", error);
    return { ok: false, error: "Failed to update quotation status." };
  }

  await admin.from("quotation_events" as never).insert({
    quotation_id: id,
    event_type: `status_${status}`,
    actor_id: actor.user.id,
    actor_email: actor.user.email,
    payload: { new_status: status },
  } as never);

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "quotations.update" as any,
    entityType: "quotation" as any,
    entityId: id,
    summary: `Updated quotation status to ${status}`,
  });

  return { ok: true };
}

/**
 * Convert quotation to live canonical order atomically
 */
export async function convertQuotationToOrder(
  quotationId: string
): Promise<{ ok: boolean; orderId?: string; orderReference?: string; error?: string }> {
  const actor = await requireAdmin({ permission: "orders.view" });
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.rpc("convert_quotation_to_order" as never, {
    p_payload: {
      quotation_id: quotationId,
      actor_id: actor.user.id,
      actor_email: actor.user.email,
    },
  } as never);

  if (error || !data || !(data as any).ok) {
    console.error("[quotations] convert_quotation_to_order RPC failed:", error);
    return {
      ok: false,
      error: error?.message || (data as any)?.error || "Failed to convert quotation to order.",
    };
  }

  const raw = data as any;

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "quotations.convert" as any,
    entityType: "quotation" as any,
    entityId: quotationId,
    summary: `Converted quotation ${raw.quote_number} to canonical order ${raw.order_reference} (${raw.order_id})`,
  });

  return {
    ok: true,
    orderId: raw.order_id,
    orderReference: raw.order_reference,
  };
}

/**
 * List lifecycle events for a quotation
 */
export async function listQuotationEvents(quotationId: string): Promise<QuotationEventRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("quotation_events" as never)
    .select("*")
    .eq("quotation_id" as never, quotationId)
    .order("created_at" as never, { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as QuotationEventRow[];
}

/**
 * Delete quotation and its associated line items
 */
export async function deleteQuotation(
  quotationId: string
): Promise<{ ok: boolean; error?: string }> {
  const actor = await requireAdmin({ permission: "orders.edit" });
  const admin = createSupabaseAdminClient();

  // Delete line items first
  await admin
    .from("quotation_items" as never)
    .delete()
    .eq("quotation_id" as never, quotationId);

  const { error } = await admin
    .from("quotations" as never)
    .delete()
    .eq("id" as never, quotationId);

  if (error) {
    console.error("[quotations] delete failed:", error);
    return { ok: false, error: "Failed to delete quotation." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "quotations.delete" as any,
    entityType: "quotation" as any,
    entityId: quotationId,
    summary: `Deleted quotation ${quotationId}`,
  });

  return { ok: true };
}

/**
 * Update PDF Storage Path, status, and bump version
 */
export async function updateQuotationPdfPath(
  quotationId: string,
  pdfStoragePath: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = createSupabaseAdminClient();

  const { data: current } = await admin
    .from("quotations" as never)
    .select("pdf_version" as never)
    .eq("id" as never, quotationId)
    .single();

  const currentVersion = Number((current as any)?.pdf_version || 1);

  const { error } = await admin
    .from("quotations" as never)
    .update({
      pdf_storage_path: pdfStoragePath,
      pdf_status: "generated",
      pdf_generated_at: new Date().toISOString(),
      pdf_version: currentVersion + 1,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id" as never, quotationId);

  if (error) {
    console.error("[quotations] update PDF path failed:", error);
    return { ok: false, error: "Failed to update PDF path." };
  }

  await admin.from("quotation_events" as never).insert({
    quotation_id: quotationId,
    event_type: "pdf_generated",
    payload: { path: pdfStoragePath, version: currentVersion + 1 },
  } as never);

  return { ok: true };
}
