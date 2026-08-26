import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, writeAuditLog } from "@/lib/admin/rbac";
import type { Database } from "@/lib/supabase/types";

export type QuotationStatus = "draft" | "sent" | "accepted" | "declined" | "converted_to_order";

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
  total_amount: number;
  valid_until: string;
  notes: string | null;
  pdf_storage_path: string | null;
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
    totalValue: number;
  };
}

export const quotationItemSchema = z.object({
  master_product_id: z.string().uuid().nullable().optional(),
  item_title: z.string().trim().min(1, "Item description is required"),
  sku: z.string().trim().nullable().optional(),
  unit: z.string().trim().default("Each"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(0, "Unit price must be positive"),
});

export const quotationInputSchema = z.object({
  school_id: z.string().uuid().nullable().optional(),
  recipient_name: z.string().trim().min(2, "Recipient name is required"),
  recipient_email: z.string().trim().email("Valid email address is required"),
  recipient_phone: z.string().trim().nullable().optional(),
  valid_until: z.string().min(1, "Validity date is required"),
  notes: z.string().trim().nullable().optional(),
  items: z.array(quotationItemSchema).min(1, "At least one line item is required"),
});

export type QuotationInput = z.infer<typeof quotationInputSchema>;

/**
 * Generate sequential Quote Number: PX-Q-YYYY-XXXX
 */
export async function generateQuoteNumber(): Promise<string> {
  const admin = createSupabaseAdminClient();
  const year = new Date().getFullYear();
  const prefix = `PX-Q-${year}-`;

  const { data } = await admin
    .from("quotations" as never)
    .select("quote_number" as never)
    .ilike("quote_number" as never, `${prefix}%`)
    .order("created_at" as never, { ascending: false })
    .limit(1);

  const rows = (data ?? []) as unknown as Array<{ quote_number: string }>;
  if (rows.length > 0 && rows[0].quote_number) {
    const lastNum = parseInt(rows[0].quote_number.replace(prefix, ""), 10);
    if (!isNaN(lastNum)) {
      return `${prefix}${String(lastNum + 1).padStart(4, "0")}`;
    }
  }

  // Fallback start at 0101
  return `${prefix}0101`;
}

/**
 * List quotations with filters and aggregated KPIs
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
      total_amount,
      valid_until,
      notes,
      pdf_storage_path,
      created_at,
      updated_at,
      school:schools (id, name, slug, city, province),
      quotation_items (count)
    `,
      { count: "exact" }
    )
    .order("created_at" as never, { ascending: false });

  if (options?.status && options.status !== "all") {
    query = query.eq("status" as never, options.status);
  }

  if (options?.search) {
    const search = options.search.trim();
    query = query.or(
      `quote_number.ilike.%${search}%,recipient_name.ilike.%${search}%,recipient_email.ilike.%${search}%` as never
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("[quotations] listQuotations failed:", error);
    return {
      quotations: [],
      totalCount: 0,
      stats: { total: 0, draft: 0, sent: 0, accepted: 0, declined: 0, converted: 0, totalValue: 0 },
    };
  }

  // Fetch KPI statistics across all quotes
  const { data: allQuotes } = await admin
    .from("quotations" as never)
    .select("status, total_amount" as never);

  const stats = {
    total: (allQuotes ?? []).length,
    draft: 0,
    sent: 0,
    accepted: 0,
    declined: 0,
    converted: 0,
    totalValue: 0,
  };

  for (const q of (allQuotes ?? []) as unknown as Array<{ status: QuotationStatus; total_amount: number }>) {
    stats.totalValue += Number(q.total_amount || 0);
    if (q.status === "draft") stats.draft++;
    else if (q.status === "sent") stats.sent++;
    else if (q.status === "accepted") stats.accepted++;
    else if (q.status === "declined") stats.declined++;
    else if (q.status === "converted_to_order") stats.converted++;
  }

  const mapped: QuotationRow[] = ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    quote_number: row.quote_number,
    school_id: row.school_id,
    recipient_name: row.recipient_name,
    recipient_email: row.recipient_email,
    recipient_phone: row.recipient_phone,
    status: row.status as QuotationStatus,
    subtotal: Number(row.subtotal || 0),
    vat_rate: Number(row.vat_rate || 15),
    vat_amount: Number(row.vat_amount || 0),
    total_amount: Number(row.total_amount || 0),
    valid_until: row.valid_until,
    notes: row.notes,
    pdf_storage_path: row.pdf_storage_path,
    created_at: row.created_at,
    updated_at: row.updated_at,
    school: row.school,
    items_count: row.quotation_items?.[0]?.count ?? 0,
  }));

  return {
    quotations: mapped,
    totalCount: count ?? mapped.length,
    stats,
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
      total_amount,
      valid_until,
      notes,
      pdf_storage_path,
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
    total_amount: Number(q.total_amount || 0),
    valid_until: q.valid_until,
    notes: q.notes,
    pdf_storage_path: q.pdf_storage_path,
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
 * Create a new quotation and its line items
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

  const quoteNumber = await generateQuoteNumber();

  // Compute subtotal, 15% VAT, total
  let subtotal = 0;
  const computedItems = validated.data.items.map((item) => {
    const lineTotal = Number((item.quantity * item.unit_price).toFixed(2));
    subtotal += lineTotal;
    return {
      master_product_id: item.master_product_id || null,
      item_title: item.item_title,
      sku: item.sku || null,
      unit: item.unit || "Each",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: lineTotal,
    };
  });

  const vatRate = 15.0;
  const vatAmount = Number(((subtotal * vatRate) / 100).toFixed(2));
  const totalAmount = Number((subtotal + vatAmount).toFixed(2));

  // Insert quotation
  const { data: quote, error: quoteError } = await admin
    .from("quotations" as never)
    .insert({
      quote_number: quoteNumber,
      school_id: validated.data.school_id || null,
      recipient_name: validated.data.recipient_name,
      recipient_email: validated.data.recipient_email,
      recipient_phone: validated.data.recipient_phone || null,
      status,
      subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      valid_until: validated.data.valid_until,
      notes: validated.data.notes || null,
    } as never)
    .select()
    .single();

  if (quoteError || !quote) {
    console.error("[quotations] insert failed:", quoteError);
    return { ok: false, error: "Failed to create quotation record." };
  }

  const quoteId = (quote as any).id;

  // Insert line items
  const itemsToInsert = computedItems.map((item) => ({
    ...item,
    quotation_id: quoteId,
  }));

  const { error: itemsError } = await admin
    .from("quotation_items" as never)
    .insert(itemsToInsert as never);

  if (itemsError) {
    console.error("[quotations] items insert failed:", itemsError);
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "quotations.create" as any,
    entityType: "quotation" as any,
    entityId: quoteId,
    summary: `Created quotation ${quoteNumber} for ${validated.data.recipient_name} (Total: R${totalAmount})`,
  });

  const created = await getQuotation(quoteId);
  return { ok: true, quotation: created ?? (quote as any) };
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
 * Convert quotation to live order
 */
export async function convertQuotationToOrder(
  quotationId: string
): Promise<{ ok: boolean; orderId?: string; error?: string }> {
  const actor = await requireAdmin({ permission: "orders.view" });
  const admin = createSupabaseAdminClient();

  const quotation = await getQuotation(quotationId);
  if (!quotation) {
    return { ok: false, error: "Quotation not found." };
  }

  if (quotation.status === "converted_to_order") {
    return { ok: false, error: "Quotation has already been converted to an order." };
  }

  // Generate order reference e.g. PX-ORD-XXXX
  const orderRef = `PX-ORD-${Date.now().toString().slice(-6)}`;

  // Insert into orders
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_name: quotation.recipient_name,
      customer_email: quotation.recipient_email,
      customer_phone: quotation.recipient_phone || "N/A",
      school_id: quotation.school_id,
      total_amount: quotation.total_amount,
      status: "pending",
      payment_status: "pending",
      payment_method: "EFT / Direct Invoice",
      notes: `Converted from Quotation ${quotation.quote_number}. ${quotation.notes || ""}`,
    } as any)
    .select()
    .single();

  if (orderError || !order) {
    console.error("[quotations] convert to order failed:", orderError);
    return { ok: false, error: "Failed to create order from quotation." };
  }

  const orderId = (order as any).id;

  // Insert line items into order_items
  if (quotation.items && quotation.items.length > 0) {
    const orderItems = quotation.items.map((item) => ({
      order_id: orderId,
      product_id: item.master_product_id,
      item_name: item.item_title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    await admin.from("order_items" as never).insert(orderItems as never);
  }

  // Mark quotation as converted
  await admin
    .from("quotations" as never)
    .update({
      status: "converted_to_order",
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id" as never, quotationId);

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "quotations.convert" as any,
    entityType: "quotation" as any,
    entityId: quotationId,
    summary: `Converted quotation ${quotation.quote_number} to official order ${orderId}`,
  });

  return { ok: true, orderId };
}
