/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { randomUUID } from "node:crypto";
import {
  calculateSellingPrice,
  grossMargin,
  selectPricingRule,
  type PricingRule,
} from "@/lib/operations/pricing";

function db() {
  return createSupabaseAdminClient() as any;
}

function asNumber(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

type DatabaseError = { code?: string; message?: string } | null;

function isOperationsSchemaUnavailable(error: DatabaseError) {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error?.code === "PGRST205" ||
    message.includes("could not find the table") ||
    message.includes("does not exist")
  );
}

function assertNoError(error: DatabaseError, context: string) {
  if (!error) return;
  if (isOperationsSchemaUnavailable(error)) {
    throw new Error(
      `${context}: operations database setup is pending. Apply Supabase migration 00030_operations_foundation.sql.`,
    );
  }
  throw new Error(`${context}: ${error.message || "Unknown database error"}`);
}

export async function isOperationsSchemaReady() {
  const { error } = await db()
    .from("suppliers")
    .select("id", { count: "exact", head: true });
  if (isOperationsSchemaUnavailable(error)) return false;
  assertNoError(error, "Unable to verify operations database setup");
  return true;
}

export type MasterProductRow = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  unit: string | null;
  packaging: string | null;
  availability: string;
  current_selling_price: number;
  latest_verified_cost: number | null;
  pricing_status: string;
  last_verified_at: string | null;
  active: boolean;
};

export async function listMasterProducts(query = "", limit = 100) {
  let request = db()
    .from("master_products")
    .select(
      "id,sku,name,description,category,brand,unit,packaging,availability,current_selling_price,latest_verified_cost,pricing_status,last_verified_at,active",
      { count: "exact" },
    )
    .order("name")
    .limit(limit);
  if (query.trim()) {
    const safe = query.trim().replace(/[,%()]/g, " ");
    request = request.or(
      `sku.ilike.%${safe}%,name.ilike.%${safe}%,category.ilike.%${safe}%,brand.ilike.%${safe}%`,
    );
  }
  const { data, error, count } = await request;
  if (isOperationsSchemaUnavailable(error)) {
    return { products: [] as MasterProductRow[], total: 0 };
  }
  assertNoError(error, "Unable to load the master catalogue");
  return {
    products: (data ?? []) as MasterProductRow[],
    total: count ?? data?.length ?? 0,
  };
}

export async function createMasterProduct(input: {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  unit?: string;
  packaging?: string;
  sellingPrice?: number;
}) {
  const { data, error } = await db()
    .from("master_products")
    .insert({
      sku: input.sku.trim().toUpperCase(),
      name: input.name.trim(),
      description: input.description?.trim() || null,
      category: input.category?.trim() || null,
      brand: input.brand?.trim() || null,
      unit: input.unit?.trim() || null,
      packaging: input.packaging?.trim() || null,
      current_selling_price: input.sellingPrice ?? 0,
      calculated_selling_price: input.sellingPrice ?? 0,
      pricing_status: input.sellingPrice ? "review" : "unpriced",
      visibility: "internal",
    })
    .select("id")
    .single();
  assertNoError(error, "Unable to create the product");
  return data as { id: string };
}

export async function importMasterProducts(
  rows: Array<{
    sku: string;
    name: string;
    description?: string;
    category?: string;
    brand?: string;
    unit?: string;
    packaging?: string;
    sellingPrice?: number;
  }>,
) {
  const payload = rows.map((row) => ({
    sku: row.sku.trim().toUpperCase(),
    name: row.name.trim(),
    description: row.description?.trim() || null,
    category: row.category?.trim() || null,
    brand: row.brand?.trim() || null,
    unit: row.unit?.trim() || null,
    packaging: row.packaging?.trim() || null,
    current_selling_price: row.sellingPrice ?? 0,
    calculated_selling_price: row.sellingPrice ?? 0,
    pricing_status: row.sellingPrice ? "review" : "unpriced",
    visibility: "internal",
  }));
  const { error } = await db()
    .from("master_products")
    .upsert(payload, { onConflict: "sku", ignoreDuplicates: false });
  assertNoError(error, "Unable to import master products");
  return payload.length;
}

export type SupplierRow = {
  id: string;
  code: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  telephone: string | null;
  lead_time_days: number | null;
  payment_terms: string | null;
  active: boolean;
  offer_count?: number;
};

export async function listSuppliers() {
  const { data, error } = await db()
    .from("suppliers")
    .select(
      "id,code,name,contact_name,email,telephone,lead_time_days,payment_terms,active,supplier_offers(count)",
    )
    .order("name");
  if (isOperationsSchemaUnavailable(error)) return [] as SupplierRow[];
  assertNoError(error, "Unable to load suppliers");
  return (data ?? []).map((row: any) => ({
    ...row,
    offer_count: row.supplier_offers?.[0]?.count ?? 0,
  })) as SupplierRow[];
}

export async function createSupplier(input: {
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  telephone?: string;
  leadTimeDays?: number;
  paymentTerms?: string;
}) {
  const { data, error } = await db()
    .from("suppliers")
    .insert({
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      contact_name: input.contactName?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      telephone: input.telephone?.trim() || null,
      lead_time_days: input.leadTimeDays ?? null,
      payment_terms: input.paymentTerms?.trim() || null,
    })
    .select("id")
    .single();
  assertNoError(error, "Unable to create the supplier");
  return data as { id: string };
}

export type SupplierOfferRow = {
  id: string;
  unit_cost: number;
  minimum_order_quantity: number;
  available_quantity: number | null;
  lead_time_days: number | null;
  valid_until: string | null;
  is_preferred: boolean;
  active: boolean;
  suppliers: { id: string; name: string; code: string };
  master_products: { id: string; sku: string; name: string };
};

export async function listSupplierOffers() {
  const { data, error } = await db()
    .from("supplier_offers")
    .select(
      "id,unit_cost,minimum_order_quantity,available_quantity,lead_time_days,valid_until,is_preferred,active,suppliers(id,name,code),master_products(id,sku,name)",
    )
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(250);
  if (isOperationsSchemaUnavailable(error)) return [] as SupplierOfferRow[];
  assertNoError(error, "Unable to load supplier offers");
  return (data ?? []) as SupplierOfferRow[];
}

export async function createSupplierOffer(input: {
  supplierId: string;
  productId: string;
  unitCost: number;
  minimumOrderQuantity: number;
  availableQuantity?: number;
  leadTimeDays?: number;
  validUntil?: string;
  isPreferred: boolean;
  actorId: string;
}) {
  const client = db();
  if (input.isPreferred) {
    const { error: clearError } = await client
      .from("supplier_offers")
      .update({ is_preferred: false })
      .eq("product_id", input.productId)
      .eq("active", true);
    assertNoError(clearError, "Unable to update the preferred supplier");
  }
  const { data, error } = await client
    .from("supplier_offers")
    .insert({
      supplier_id: input.supplierId,
      product_id: input.productId,
      unit_cost: input.unitCost,
      minimum_order_quantity: Math.max(1, input.minimumOrderQuantity),
      available_quantity: input.availableQuantity ?? null,
      lead_time_days: input.leadTimeDays ?? null,
      valid_until: input.validUntil || null,
      verified_at: new Date().toISOString(),
      is_preferred: input.isPreferred,
    })
    .select("id")
    .single();
  assertNoError(error, "Unable to create the supplier offer");
  if (input.isPreferred) {
    const { error: productError } = await client
      .from("master_products")
      .update({
        preferred_supplier_id: input.supplierId,
        latest_verified_cost: input.unitCost,
        pricing_status: "review",
        last_verified_at: new Date().toISOString(),
        updated_by: input.actorId,
      })
      .eq("id", input.productId);
    assertNoError(productError, "Unable to update the product cost");
  }
  return data as { id: string };
}

export type PricingReviewRow = MasterProductRow & {
  suggested_price: number;
  current_margin: number | null;
  preferred_supplier: string | null;
  offer_valid_until: string | null;
  pricing_rule: string | null;
};

export async function listPricingReview() {
  const client = db();
  const [{ data, error }, { data: rulesData, error: rulesError }] =
    await Promise.all([
      client
        .from("master_products")
        .select(
          "id,sku,name,description,category,brand,unit,packaging,availability,current_selling_price,latest_verified_cost,pricing_status,last_verified_at,active,supplier_offers(unit_cost,valid_until,is_preferred,suppliers(name))",
        )
        .eq("active", true)
        .order("pricing_status")
        .order("name")
        .limit(250),
      client
        .from("pricing_rules")
        .select(
          "id,name,scope,scope_value,method,rate,rounding_increment,priority,active",
        )
        .eq("active", true),
    ]);
  if (
    isOperationsSchemaUnavailable(error) ||
    isOperationsSchemaUnavailable(rulesError)
  ) {
    return [] as PricingReviewRow[];
  }
  assertNoError(error, "Unable to load pricing review");
  assertNoError(rulesError, "Unable to load pricing rules");
  const rules = (rulesData ?? []) as PricingRule[];
  return (data ?? []).map((row: any) => {
    const offer =
      row.supplier_offers?.find((item: any) => item.is_preferred) ??
      row.supplier_offers?.[0];
    const cost = row.latest_verified_cost ?? offer?.unit_cost ?? null;
    const price = asNumber(row.current_selling_price);
    const rule = selectPricingRule(rules, row);
    const suggested =
      cost == null || !rule
        ? price
        : calculateSellingPrice(
            asNumber(cost),
            rule.method,
            asNumber(rule.rate),
            asNumber(rule.rounding_increment),
          );
    return {
      ...row,
      latest_verified_cost: cost,
      suggested_price: suggested,
      current_margin: cost == null ? null : grossMargin(price, asNumber(cost)),
      preferred_supplier: offer?.suppliers?.name ?? null,
      offer_valid_until: offer?.valid_until ?? null,
      pricing_rule: rule?.name ?? null,
    };
  }) as PricingReviewRow[];
}

export async function listPricingRules() {
  const { data, error } = await db()
    .from("pricing_rules")
    .select("*")
    .order("priority");
  if (isOperationsSchemaUnavailable(error)) return [] as PricingRule[];
  assertNoError(error, "Unable to load pricing rules");
  return (data ?? []) as PricingRule[];
}

export async function createPricingRule(input: {
  name: string;
  scope: PricingRule["scope"];
  scopeValue?: string;
  method: PricingRule["method"];
  rate: number;
  roundingIncrement: number;
  priority: number;
  createdBy: string;
}) {
  const { data, error } = await db()
    .from("pricing_rules")
    .insert({
      name: input.name.trim(),
      scope: input.scope,
      scope_value: input.scopeValue?.trim() || null,
      method: input.method,
      rate: input.rate,
      rounding_increment: input.roundingIncrement,
      priority: input.priority,
      created_by: input.createdBy,
    })
    .select("id")
    .single();
  assertNoError(error, "Unable to create the pricing rule");
  return data as { id: string };
}

export async function approveProductPrice(
  productId: string,
  sellingPrice: number,
  actorId: string,
) {
  const client = db();
  const { data: current, error: currentError } = await client
    .from("master_products")
    .select("current_selling_price,latest_verified_cost")
    .eq("id", productId)
    .single();
  assertNoError(currentError, "Unable to load the current price");
  const oldPrice = asNumber(current.current_selling_price);
  const cost =
    current.latest_verified_cost == null
      ? null
      : asNumber(current.latest_verified_cost);
  const { error } = await client
    .from("master_products")
    .update({
      current_selling_price: sellingPrice,
      selling_price_override: sellingPrice,
      pricing_status: "approved",
      last_verified_at: new Date().toISOString(),
      updated_by: actorId,
    })
    .eq("id", productId);
  assertNoError(error, "Unable to approve the price");
  const { error: historyError } = await client.from("price_history").insert({
    product_id: productId,
    previous_cost: cost,
    new_cost: cost,
    previous_selling_price: oldPrice,
    new_selling_price: sellingPrice,
    previous_margin:
      cost == null || oldPrice <= 0 ? null : (oldPrice - cost) / oldPrice,
    new_margin:
      cost == null || sellingPrice <= 0
        ? null
        : (sellingPrice - cost) / sellingPrice,
    reason: "Approved in price review centre",
    source: "admin",
    changed_by: actorId,
    approved_by: actorId,
  });
  assertNoError(historyError, "Unable to record price history");
}

export type ProcurementRow = {
  id: string;
  season_id: string;
  product_id: string;
  sku: string;
  product_name: string;
  category: string | null;
  required_quantity: number;
  requested_quantity: number;
  supplier_confirmed_quantity: number;
  secured_quantity: number;
  received_quantity: number;
  allocated_quantity: number;
  outstanding_quantity: number;
  procurement_coverage_percent: number;
  status: string;
  updated_at: string;
};

export async function listProcurementRequirements() {
  const { data, error } = await db()
    .from("procurement_command_view")
    .select("*")
    .order("outstanding_quantity", { ascending: false })
    .order("product_name");
  if (isOperationsSchemaUnavailable(error)) return [] as ProcurementRow[];
  assertNoError(error, "Unable to load procurement requirements");
  return (data ?? []) as ProcurementRow[];
}

export async function updateProcurementRequirement(
  id: string,
  values: {
    requestedQuantity: number;
    confirmedQuantity: number;
    securedQuantity: number;
    receivedQuantity: number;
  },
) {
  const secured = Math.max(0, values.securedQuantity);
  const { data: current, error: currentError } = await db()
    .from("procurement_requirements")
    .select("required_quantity")
    .eq("id", id)
    .single();
  assertNoError(currentError, "Unable to load the requirement");
  const required = asNumber(current.required_quantity);
  const status =
    secured >= required
      ? "secured"
      : secured > 0
        ? "partially_secured"
        : values.requestedQuantity > 0
          ? "requested"
          : "open";
  const { error } = await db()
    .from("procurement_requirements")
    .update({
      requested_quantity: Math.max(0, values.requestedQuantity),
      supplier_confirmed_quantity: Math.max(0, values.confirmedQuantity),
      secured_quantity: secured,
      received_quantity: Math.max(0, values.receivedQuantity),
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  assertNoError(error, "Unable to update the requirement");
  const { error: allocationError } = await db().rpc("allocate_secured_demand", {
    p_requirement_id: id,
  });
  assertNoError(allocationError, "Unable to allocate secured demand");
}

export type PurchaseOrderRow = {
  id: string;
  purchase_order_number: string;
  status: string;
  expected_on: string | null;
  currency: string;
  created_at: string;
  suppliers: { name: string; code: string };
  supplier_purchase_items: Array<{
    ordered_quantity: number;
    confirmed_quantity: number;
    received_quantity: number;
    unit_cost: number;
    master_products: { sku: string; name: string };
  }>;
};

export async function listSupplierPurchaseOrders() {
  const { data, error } = await db()
    .from("supplier_purchase_orders")
    .select(
      "id,purchase_order_number,status,expected_on,currency,created_at,suppliers(name,code),supplier_purchase_items(ordered_quantity,confirmed_quantity,received_quantity,unit_cost,master_products(sku,name))",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (isOperationsSchemaUnavailable(error)) return [] as PurchaseOrderRow[];
  assertNoError(error, "Unable to load supplier purchase orders");
  return (data ?? []) as PurchaseOrderRow[];
}

export async function createSupplierPurchaseOrder(input: {
  supplierId: string;
  requirementId: string;
  orderedQuantity: number;
  unitCost: number;
  expectedOn?: string;
  notes?: string;
  actorId: string;
}) {
  const client = db();
  const { data: requirement, error: requirementError } = await client
    .from("procurement_requirements")
    .select("product_id,season_id,requested_quantity")
    .eq("id", input.requirementId)
    .single();
  assertNoError(requirementError, "Unable to load the procurement requirement");
  const purchaseOrderNumber = `PO-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const { data: purchase, error: purchaseError } = await client
    .from("supplier_purchase_orders")
    .insert({
      purchase_order_number: purchaseOrderNumber,
      supplier_id: input.supplierId,
      season_id: requirement.season_id,
      status: "draft",
      expected_on: input.expectedOn || null,
      notes: input.notes?.trim() || null,
      created_by: input.actorId,
    })
    .select("id")
    .single();
  assertNoError(purchaseError, "Unable to create the purchase order");
  const { error: itemError } = await client
    .from("supplier_purchase_items")
    .insert({
      purchase_order_id: purchase.id,
      requirement_id: input.requirementId,
      product_id: requirement.product_id,
      ordered_quantity: Math.max(1, input.orderedQuantity),
      unit_cost: input.unitCost,
    });
  if (itemError) {
    await client
      .from("supplier_purchase_orders")
      .delete()
      .eq("id", purchase.id);
    assertNoError(itemError, "Unable to create the purchase item");
  }
  const { error: updateError } = await client
    .from("procurement_requirements")
    .update({
      requested_quantity:
        asNumber(requirement.requested_quantity) +
        Math.max(1, input.orderedQuantity),
      status: "requested",
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.requirementId);
  assertNoError(updateError, "Unable to update requested demand");
  return { id: purchase.id as string, purchaseOrderNumber };
}

export type FulfilmentRow = {
  id: string;
  order_id: string;
  method: string;
  status: string;
  target_date: string | null;
  courier_name: string | null;
  waybill_number: string | null;
  orders: {
    order_reference: string;
    buyer_name: string;
    school_name: string;
    grade: string;
    status: string;
  };
  packing_records: Array<{ id: string; status: string }>;
  readiness: number;
};

export async function listFulfilmentRecords() {
  const client = db();
  const [
    { data, error },
    { data: readiness, error: readinessError },
    { data: packing, error: packingError },
  ] = await Promise.all([
    client
      .from("fulfilment_records")
      .select(
        "id,order_id,method,status,target_date,courier_name,waybill_number,orders(order_reference,buyer_name,school_name,grade,status)",
      )
      .order("target_date", { ascending: true, nullsFirst: false }),
    client.from("order_readiness_view").select("order_id,readiness_percent"),
    client.from("packing_records").select("id,order_id,status"),
  ]);
  if (
    isOperationsSchemaUnavailable(error) ||
    isOperationsSchemaUnavailable(readinessError) ||
    isOperationsSchemaUnavailable(packingError)
  ) {
    return [] as FulfilmentRow[];
  }
  assertNoError(error, "Unable to load fulfilment records");
  assertNoError(readinessError, "Unable to load order readiness");
  assertNoError(packingError, "Unable to load packing records");
  const readinessByOrder = new Map(
    (readiness ?? []).map((row: any) => [
      row.order_id,
      asNumber(row.readiness_percent),
    ]),
  );
  const packingByOrder = new Map(
    (packing ?? []).map((row: any) => [
      row.order_id,
      [{ id: row.id, status: row.status }],
    ]),
  );
  return (data ?? []).map((row: any) => ({
    ...row,
    packing_records: packingByOrder.get(row.order_id) ?? [],
    readiness: readinessByOrder.get(row.order_id) ?? 0,
  })) as FulfilmentRow[];
}

export async function updatePackingRecord(
  id: string,
  status: string,
  actorId: string,
) {
  const now = new Date().toISOString();
  const values: Record<string, unknown> = { status, updated_at: now };
  if (status === "packing")
    Object.assign(values, { started_by: actorId, started_at: now });
  if (status === "quality_check")
    Object.assign(values, { checked_by: actorId, checked_at: now });
  if (status === "packed") Object.assign(values, { packed_at: now });
  
  const { data: record } = await db()
    .from("packing_records")
    .select("order_id")
    .eq("id", id)
    .single();
  
  const { error } = await db()
    .from("packing_records")
    .update(values)
    .eq("id", id);
  assertNoError(error, "Unable to update packing");
  
  if (record?.order_id) {
    await advanceOrderStatus(record.order_id);
  }
}

export async function updateFulfilmentRecord(
  id: string,
  status: string,
  courierName?: string,
  waybillNumber?: string,
) {
  const completed = ["collected", "delivered"].includes(status);
  
  const { data: record } = await db()
    .from("fulfilment_records")
    .select("order_id")
    .eq("id", id)
    .single();
  
  const { error } = await db()
    .from("fulfilment_records")
    .update({
      status,
      courier_name: courierName?.trim() || null,
      waybill_number: waybillNumber?.trim() || null,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  assertNoError(error, "Unable to update fulfilment");
  
  if (record?.order_id) {
    await advanceOrderStatus(record.order_id);
  }
}

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_at: string | null;
  created_at: string;
};

export async function listOperationalTasks() {
  const { data, error } = await db()
    .from("operational_tasks")
    .select("*")
    .order("status")
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(250);
  if (isOperationsSchemaUnavailable(error)) return [] as TaskRow[];
  assertNoError(error, "Unable to load operational tasks");
  return (data ?? []) as TaskRow[];
}

export async function createOperationalTask(input: {
  title: string;
  description?: string;
  priority?: string;
  dueAt?: string;
  entityType?: string;
  entityId?: string;
  createdBy: string;
}) {
  const { data, error } = await db()
    .from("operational_tasks")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      priority: input.priority || "normal",
      due_at: input.dueAt || null,
      entity_type: input.entityType?.trim() || null,
      entity_id: input.entityId?.trim() || null,
      created_by: input.createdBy,
    })
    .select("id")
    .single();
  assertNoError(error, "Unable to create the task");
  return data as { id: string };
}

export async function updateOperationalTaskStatus(id: string, status: string) {
  const { error } = await db()
    .from("operational_tasks")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  assertNoError(error, "Unable to update the task");
}

export async function getTask(id: string) {
  const { data, error } = await db()
    .from("operational_tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (isOperationsSchemaUnavailable(error)) return null;
  assertNoError(error, "Unable to load the task");
  return data as TaskRow | null;
}

export type SupplierReceiptRow = {
  id: string;
  purchase_order_id: string;
  reference: string | null;
  received_by: string | null;
  received_at: string;
  notes: string | null;
};

export type PurchaseOrderWithItems = {
  id: string;
  purchase_order_number: string;
  supplier_id: string;
  status: string;
  expected_on: string | null;
  notes: string | null;
  created_at: string;
  suppliers: { name: string; code: string } | null;
  supplier_purchase_items: Array<{
    id: string;
    product_id: string;
    ordered_quantity: number;
    confirmed_quantity: number;
    received_quantity: number;
    unit_cost: number;
    master_products: { name: string; sku: string } | null;
  }>;
};

export async function listPurchaseOrdersForReceiving() {
  const { data, error } = await db()
    .from("supplier_purchase_orders")
    .select(`
      *,
      suppliers(name, code),
      supplier_purchase_items(
        id,
        product_id,
        ordered_quantity,
        confirmed_quantity,
        received_quantity,
        unit_cost,
        master_products(name, sku)
      )
    `)
    .in("status", ["sent", "confirmed", "partially_received"])
    .order("created_at", { ascending: false });
  if (isOperationsSchemaUnavailable(error))
    return [] as PurchaseOrderWithItems[];
  assertNoError(error, "Unable to load purchase orders");
  return (data ?? []) as PurchaseOrderWithItems[];
}

export async function listSupplierReceipts(purchaseOrderId: string) {
  const { data, error } = await db()
    .from("supplier_receipts")
    .select("*")
    .eq("purchase_order_id", purchaseOrderId)
    .order("received_at", { ascending: false });
  if (isOperationsSchemaUnavailable(error))
    return [] as SupplierReceiptRow[];
  assertNoError(error, "Unable to load supplier receipts");
  return (data ?? []) as SupplierReceiptRow[];
}

export async function createSupplierReceipt(input: {
  purchaseOrderId: string;
  receivedBy: string;
  reference?: string;
  notes?: string;
  items: Array<{
    purchaseItemId: string;
    receivedQuantity: number;
  }>;
}) {
  const client = db();
  
  const { data: receipt, error: receiptError } = await client
    .from("supplier_receipts")
    .insert({
      purchase_order_id: input.purchaseOrderId,
      received_by: input.receivedBy,
      reference: input.reference?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();
  assertNoError(receiptError, "Unable to create supplier receipt");
  
  for (const item of input.items) {
    if (item.receivedQuantity <= 0) continue;
    
    const { error: itemError } = await client
      .from("supplier_purchase_items")
      .update({
        received_quantity: item.receivedQuantity,
      })
      .eq("id", item.purchaseItemId);
    assertNoError(itemError, "Unable to update purchase item received quantity");
  }
  
  const { data: po } = await client
    .from("supplier_purchase_orders")
    .select(`
      id,
      supplier_purchase_items(ordered_quantity, received_quantity)
    `)
    .eq("id", input.purchaseOrderId)
    .single();
  
  if (po) {
    const items = po.supplier_purchase_items || [];
    const allFullyReceived = items.every(
      (i: any) => i.received_quantity >= i.ordered_quantity,
    );
    const anyReceived = items.some(
      (i: any) => i.received_quantity > 0,
    );
    
    let newStatus = "confirmed";
    if (allFullyReceived) newStatus = "received";
    else if (anyReceived) newStatus = "partially_received";
    
    const { error: statusError } = await client
      .from("supplier_purchase_orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", input.purchaseOrderId);
    assertNoError(statusError, "Unable to update purchase order status");
  }
  
  return receipt as { id: string };
}

export type ApprovalRow = {
  id: string;
  entity_type: string;
  entity_id: string;
  approval_type: string;
  status: string;
  requested_by: string | null;
  decided_by: string | null;
  reason: string | null;
  decision_notes: string | null;
  created_at: string;
  decided_at: string | null;
};

export async function listApprovals(status?: string) {
  let query = db()
    .from("approvals")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (status) {
    query = query.eq("status", status);
  }
  
  const { data, error } = await query.limit(250);
  if (isOperationsSchemaUnavailable(error)) return [] as ApprovalRow[];
  assertNoError(error, "Unable to load approvals");
  return (data ?? []) as ApprovalRow[];
}

export async function updateApproval(
  id: string,
  input: {
    status: "approved" | "rejected" | "cancelled";
    decidedBy: string;
    decisionNotes?: string;
  },
) {
  const { error } = await db()
    .from("approvals")
    .update({
      status: input.status,
      decided_by: input.decidedBy,
      decision_notes: input.decisionNotes?.trim() || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);
  assertNoError(error, "Unable to update approval");
}

export async function updateSupplier(
  id: string,
  input: {
    name?: string;
    contactName?: string;
    email?: string;
    telephone?: string;
    leadTimeDays?: number;
    paymentTerms?: string;
    active?: boolean;
  },
) {
  const { error } = await db()
    .from("suppliers")
    .update({
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.contactName !== undefined && {
        contact_name: input.contactName.trim() || null,
      }),
      ...(input.email !== undefined && { email: input.email.trim() || null }),
      ...(input.telephone !== undefined && {
        telephone: input.telephone.trim() || null,
      }),
      ...(input.leadTimeDays !== undefined && {
        lead_time_days: input.leadTimeDays,
      }),
      ...(input.paymentTerms !== undefined && {
        payment_terms: input.paymentTerms.trim() || null,
      }),
      ...(input.active !== undefined && { active: input.active }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  assertNoError(error, "Unable to update supplier");
}

export async function updateSupplierOffer(
  id: string,
  input: {
    unitCost?: number;
    minimumOrderQuantity?: number;
    availableQuantity?: number;
    leadTimeDays?: number;
    validUntil?: string;
    isPreferred?: boolean;
    active?: boolean;
  },
) {
  const client = db();
  
  if (input.isPreferred) {
    const { data: offer } = await client
      .from("supplier_offers")
      .select("supplier_id, product_id")
      .eq("id", id)
      .single();
    
    if (offer) {
      await client
        .from("supplier_offers")
        .update({ is_preferred: false })
        .eq("supplier_id", offer.supplier_id)
        .eq("product_id", offer.product_id)
        .neq("id", id);
    }
  }
  
  const { error } = await client
    .from("supplier_offers")
    .update({
      ...(input.unitCost !== undefined && { unit_cost: input.unitCost }),
      ...(input.minimumOrderQuantity !== undefined && {
        minimum_order_quantity: input.minimumOrderQuantity,
      }),
      ...(input.availableQuantity !== undefined && {
        available_quantity: input.availableQuantity,
      }),
      ...(input.leadTimeDays !== undefined && {
        lead_time_days: input.leadTimeDays,
      }),
      ...(input.validUntil !== undefined && {
        valid_until: input.validUntil || null,
      }),
      ...(input.isPreferred !== undefined && {
        is_preferred: input.isPreferred,
      }),
      ...(input.active !== undefined && { active: input.active }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  assertNoError(error, "Unable to update supplier offer");
}

export async function advanceOrderStatus(orderId: string) {
  const client = db();
  
  const { data: order } = await client
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .single();
  
  if (!order || order.status === "cancelled" || order.status === "refunded" || order.status === "delivered") {
    return;
  }
  
  const { data: packingRecords } = await client
    .from("packing_records")
    .select("status, updated_at")
    .eq("order_id", orderId);
  
  const { data: fulfilmentRecords } = await client
    .from("fulfilment_records")
    .select("status, target_date, updated_at")
    .eq("order_id", orderId);
  
  const packingStatuses = (packingRecords || []).map((r: any) => r.status);
  const fulfilmentStatuses = (fulfilmentRecords || []).map((r: any) => r.status);
  const fulfilment = (fulfilmentRecords || [])[0] as any;
  
  let newStatus: string | null = null;
  
  // Status advancement: paid → scheduled → not_ready → packing → dispatched → delivered
  if (fulfilmentStatuses.includes("delivered")) {
    newStatus = "delivered";
  } else if (fulfilmentStatuses.includes("dispatched")) {
    newStatus = "dispatched";
  } else if (fulfilmentStatuses.includes("in_transit")) {
    newStatus = "dispatched";
  } else if (packingStatuses.includes("packed")) {
    newStatus = "packing";
  } else if (fulfilment?.target_date && order.status === "paid") {
    newStatus = "scheduled";
  } else if (packingStatuses.includes("quality_check") || packingStatuses.includes("packing")) {
    newStatus = "packing";
  } else if (packingStatuses.includes("ready") && order.status === "not_ready") {
    newStatus = "packing";
  } else if (packingStatuses.includes("ready") && order.status === "paid") {
    newStatus = "not_ready";
  }
  
  if (newStatus && newStatus !== order.status) {
    const { error } = await client
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    assertNoError(error, "Unable to advance order status");
  }
}

export async function upsertCustomerAndLearner(input: {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  learnerName: string;
  schoolSlug: string;
  grade: string;
}): Promise<{ customerId: string; learnerId: string }> {
  const client = db();

  // Upsert customer by email
  let customerId: string | null = null;
  if (input.buyerEmail) {
    const { data: existing } = await client
      .from("customers")
      .select("id")
      .eq("email", input.buyerEmail)
      .maybeSingle();
    
    if (existing) {
      customerId = existing.id;
    } else {
      const { data: created, error: customerError } = await client
        .from("customers")
        .insert({
          email: input.buyerEmail,
          phone: input.buyerPhone,
          full_name: input.buyerName,
        })
        .select("id")
        .single();
      assertNoError(customerError, "Failed to create customer");
      customerId = created.id;
    }
  }

  if (!customerId) {
    throw new Error("Cannot create learner without a customer ID");
  }

  // Look up school_id from slug
  let schoolId: string | null = null;
  if (input.schoolSlug) {
    const { data: school } = await client
      .from("schools")
      .select("id")
      .eq("slug", input.schoolSlug)
      .maybeSingle();
    schoolId = school?.id ?? null;
  }

  // Upsert learner by customer_id + full_name
  const { data: existingLearner } = await client
    .from("learners")
    .select("id")
    .eq("customer_id", customerId)
    .eq("full_name", input.learnerName)
    .maybeSingle();

  let learnerId: string;
  if (existingLearner) {
    learnerId = existingLearner.id;
  } else {
    const { data: created, error: learnerError } = await client
      .from("learners")
      .insert({
        customer_id: customerId,
        school_id: schoolId,
        full_name: input.learnerName,
        grade: input.grade,
      })
      .select("id")
      .single();
    assertNoError(learnerError, "Failed to create learner");
    learnerId = created.id;
  }

  return { customerId, learnerId };
}

export async function linkOrderToCustomerAndLearner(
  orderId: string,
  customerId: string,
  learnerId: string,
) {
  const client = db();
  const { error } = await client
    .from("orders")
    .update({
      customer_id: customerId,
      learner_id: learnerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  assertNoError(error, "Failed to link order to customer/learner");
}

export type TaskCommentRow = {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

export async function listTaskComments(taskId: string) {
  const { data, error } = await db()
    .from("task_comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });
  if (isOperationsSchemaUnavailable(error)) return [] as TaskCommentRow[];
  assertNoError(error, "Unable to load task comments");
  return (data ?? []) as TaskCommentRow[];
}

export async function createTaskComment(input: {
  taskId: string;
  authorId: string;
  body: string;
}) {
  const { data, error } = await db()
    .from("task_comments")
    .insert({
      task_id: input.taskId,
      author_id: input.authorId,
      body: input.body.trim(),
    })
    .select("id")
    .single();
  assertNoError(error, "Unable to create the comment");
  return data as { id: string };
}

export async function deleteTaskComment(commentId: string) {
  const { error } = await db()
    .from("task_comments")
    .delete()
    .eq("id", commentId);
  assertNoError(error, "Unable to delete the comment");
}

export async function getOperationsSummary() {
  const client = db();
  const [paid, revenue, outstanding, ready, risks, lowMargin, tasks] =
    await Promise.all([
      client
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "paid"),
      client.from("orders").select("estimated_total").eq("status", "paid"),
      client.from("procurement_command_view").select("outstanding_quantity"),
      client
        .from("order_readiness_view")
        .select("order_id", { count: "exact", head: true })
        .gte("readiness_percent", 100)
        .eq("order_status", "paid"),
      client
        .from("fulfilment_records")
        .select("id", { count: "exact", head: true })
        .lt(
          "target_date",
          new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        )
        .not("status", "in", "(delivered,collected,cancelled)"),
      client
        .from("master_products")
        .select("id", { count: "exact", head: true })
        .in("pricing_status", ["unpriced", "stale", "review"]),
      client
        .from("operational_tasks")
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress", "blocked"]),
    ]);
  const errors = [
    paid.error,
    revenue.error,
    outstanding.error,
    ready.error,
    risks.error,
    lowMargin.error,
    tasks.error,
  ].filter(Boolean);
  if (errors.length)
    throw new Error(`Unable to load operations summary: ${errors[0].message}`);
  return {
    paidOrders: paid.count ?? 0,
    revenueReceived: (revenue.data ?? []).reduce(
      (sum: number, row: any) => sum + asNumber(row.estimated_total),
      0,
    ),
    procurementOutstanding: (outstanding.data ?? []).reduce(
      (sum: number, row: any) => sum + asNumber(row.outstanding_quantity),
      0,
    ),
    readyToPack: ready.count ?? 0,
    deadlineRisks: risks.count ?? 0,
    pricingExceptions: lowMargin.count ?? 0,
    openTasks: tasks.count ?? 0,
  };
}

/* ---------------------------------------------------
   Seasons
   --------------------------------------------------- */

export async function listSeasons() {
  const { data, error } = await db()
    .from("seasons")
    .select("id,name,academic_year,starts_on,ordering_closes_on,fulfilment_starts_on,fulfilment_ends_on,status,is_default,created_at,updated_at")
    .order("academic_year", { ascending: false });
  assertNoError(error, "Unable to load seasons");
  return (data ?? []) as {
    id: string;
    name: string;
    academic_year: number;
    starts_on: string | null;
    ordering_closes_on: string | null;
    fulfilment_starts_on: string | null;
    fulfilment_ends_on: string | null;
    status: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
  }[];
}

export async function createSeason(input: {
  name: string;
  academicYear: number;
  startsOn?: string;
  orderingClosesOn?: string;
  fulfilmentStartsOn?: string;
  fulfilmentEndsOn?: string;
  status?: string;
  isDefault?: boolean;
}) {
  if (input.isDefault) {
    await db().from("seasons").update({ is_default: false }).eq("is_default", true);
  }
  
  const { data, error } = await db()
    .from("seasons")
    .insert({
      name: input.name,
      academic_year: input.academicYear,
      starts_on: input.startsOn || null,
      ordering_closes_on: input.orderingClosesOn || null,
      fulfilment_starts_on: input.fulfilmentStartsOn || null,
      fulfilment_ends_on: input.fulfilmentEndsOn || null,
      status: input.status || "planning",
      is_default: input.isDefault ?? false,
    })
    .select("id")
    .single();
  assertNoError(error, "Unable to create season");
  return data as { id: string };
}

export async function updateSeason(
  id: string,
  input: {
    name?: string;
    academicYear?: number;
    startsOn?: string;
    orderingClosesOn?: string;
    fulfilmentStartsOn?: string;
    fulfilmentEndsOn?: string;
    status?: string;
    isDefault?: boolean;
  },
) {
  if (input.isDefault) {
    await db().from("seasons").update({ is_default: false }).eq("is_default", true).neq("id", id);
  }
  
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) patch.name = input.name;
  if (input.academicYear !== undefined) patch.academic_year = input.academicYear;
  if (input.startsOn !== undefined) patch.starts_on = input.startsOn || null;
  if (input.orderingClosesOn !== undefined) patch.ordering_closes_on = input.orderingClosesOn || null;
  if (input.fulfilmentStartsOn !== undefined) patch.fulfilment_starts_on = input.fulfilmentStartsOn || null;
  if (input.fulfilmentEndsOn !== undefined) patch.fulfilment_ends_on = input.fulfilmentEndsOn || null;
  if (input.status !== undefined) patch.status = input.status;
  if (input.isDefault !== undefined) patch.is_default = input.isDefault;

  if (input.isDefault) {
    await db().from("seasons").update({ is_default: false }).neq("id", id);
  }

  const { error } = await db().from("seasons").update(patch).eq("id", id);
  assertNoError(error, "Unable to update season");
}

export async function setDefaultSeason(id: string) {
  await db().from("seasons").update({ is_default: false }).neq("id", id);
  const { error } = await db()
    .from("seasons")
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  assertNoError(error, "Unable to set default season");
}

/* ---------------------------------------------------
   Order items
   --------------------------------------------------- */

export async function listOrderItems(orderId: string) {
  const { data, error } = await db()
    .from("order_items")
    .select("id,order_id,product_id,pack_id,sku_snapshot,product_name_snapshot,description_snapshot,quantity,unit_selling_price,line_total,estimated_unit_cost,expected_margin,pricing_version,school_name_snapshot,grade_snapshot,created_at")
    .eq("order_id", orderId)
    .order("created_at");
  if (isOperationsSchemaUnavailable(error)) return [];
  assertNoError(error, "Unable to load order items");
  return (data ?? []) as {
    id: string;
    order_id: string;
    product_id: string | null;
    pack_id: string | null;
    sku_snapshot: string;
    product_name_snapshot: string;
    description_snapshot: string | null;
    quantity: number;
    unit_selling_price: number;
    line_total: number;
    estimated_unit_cost: number | null;
    expected_margin: number | null;
    pricing_version: string | null;
    school_name_snapshot: string | null;
    grade_snapshot: string | null;
    created_at: string;
  }[];
}

/* ---------------------------------------------------
   Price history
   --------------------------------------------------- */

export async function listPriceHistory(limit = 100) {
  const { data, error } = await db()
    .from("price_history")
    .select("id,product_id,supplier_id,previous_cost,new_cost,previous_selling_price,new_selling_price,previous_margin,new_margin,reason,source,changed_by,approved_by,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (isOperationsSchemaUnavailable(error)) return [];
  assertNoError(error, "Unable to load price history");
  return (data ?? []) as {
    id: string;
    product_id: string;
    supplier_id: string | null;
    previous_cost: number | null;
    new_cost: number | null;
    previous_selling_price: number | null;
    new_selling_price: number | null;
    previous_margin: number | null;
    new_margin: number | null;
    reason: string | null;
    source: string | null;
    changed_by: string | null;
    approved_by: string | null;
    created_at: string;
  }[];
}
