"use server";

import { revalidatePath } from "next/cache";
import { revalidateCatalog } from "@/lib/admin/catalog-revalidate";
// papaparse is dynamically imported inside importMasterProductsAction
// to keep it out of the base server bundle.

import { requireAdmin, writeAuditLog } from "@/lib/admin/rbac";
import {
  approveProductPrice,
  createMasterProduct,
  createOperationalTask,
  createPricingRule,
  createSeason,
  createSupplier,
  createSupplierOffer,
  createSupplierPurchaseOrder,
  createSupplierReceipt,
  createTaskComment,
  deleteTaskComment,
  importMasterProducts,
  linkOrderToCustomerAndLearner,
  setDefaultSeason,
  updateApproval,
  updateFulfilmentRecord,
  updateOperationalTaskStatus,
  updatePackingRecord,
  updateProcurementRequirement,
  updateSeason,
  updateSupplier,
  updateSupplierOffer,
  upsertCustomerAndLearner,
} from "@/lib/admin/operations";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createPricingRuleAction(formData: FormData) {
  const session = await requireAdmin({ permission: "pricing.manage" });
  const name = text(formData, "name");
  const ratePercent = number(formData, "ratePercent");
  if (!name || ratePercent < 0 || ratePercent >= 100)
    throw new Error("Provide a rule name and a rate between 0 and 99.99%.");
  const rule = await createPricingRule({
    name,
    scope: text(formData, "scope") as
      | "global"
      | "category"
      | "brand"
      | "product",
    scopeValue: text(formData, "scopeValue"),
    method: text(formData, "method") as "markup" | "margin",
    rate: ratePercent / 100,
    roundingIncrement: number(formData, "roundingIncrement") || 0.01,
    priority: number(formData, "priority") || 100,
    createdBy: session.user.id,
  });
  await writeAuditLog({
    action: "pricing.rule.created",
    entityType: "pricing_rule",
    entityId: rule.id,
    summary: `Created pricing rule ${name}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/pricing");
}

function number(formData: FormData, key: string) {
  const value = Number(formData.get(key) ?? 0);
  return Number.isFinite(value) ? value : 0;
}

export async function createMasterProductAction(formData: FormData) {
  const session = await requireAdmin({ permission: "catalogue.manage" });
  const sku = text(formData, "sku");
  const name = text(formData, "name");
  if (!sku || !name) throw new Error("SKU and item name are required.");
  const product = await createMasterProduct({
    sku,
    name,
    description: text(formData, "description"),
    category: text(formData, "category"),
    brand: text(formData, "brand"),
    unit: text(formData, "unit"),
    packaging: text(formData, "packaging"),
    sellingPrice: number(formData, "sellingPrice"),
  });
  await writeAuditLog({
    action: "catalogue.product.created",
    entityType: "master_product",
    entityId: product.id,
    summary: `Created ${sku} - ${name}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/items");
  revalidatePath("/admin/pricing");
  revalidateCatalog();
}

export async function importMasterProductsAction(formData: FormData) {
  const session = await requireAdmin({ permission: "catalogue.manage" });
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    throw new Error("Choose a CSV catalogue file.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Catalogue CSV files must be 5 MB or smaller.");
  const { default: Papa } = await import("papaparse");
  const parsed = Papa.parse<Record<string, string>>(await file.text(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) =>
      header.trim().toLowerCase().replaceAll(" ", "_"),
  });

  if (parsed.errors.length)
    throw new Error(`CSV parsing failed: ${parsed.errors[0].message}`);
  const rows = parsed.data.flatMap((row) => {
    const sku = (row.sku || row.item_code || "").trim();
    const name = (row.name || row.item_name || "").trim();
    if (!sku || !name) return [];
    const price = Number(row.selling_price || row.price || 0);
    return [
      {
        sku,
        name,
        description: row.description,
        category: row.category,
        brand: row.brand,
        unit: row.unit,
        packaging: row.packaging || row.pack,
        sellingPrice: Number.isFinite(price) ? price : 0,
      },
    ];
  });
  if (!rows.length)
    throw new Error(
      "No valid rows were found. CSV requires SKU and item name columns.",
    );
  const imported = await importMasterProducts(rows);
  await writeAuditLog({
    action: "catalogue.csv.imported",
    entityType: "master_product",
    summary: `Imported or updated ${imported} canonical products`,
    actorId: session.user.id,
    details: { file: file.name },
  });
  revalidatePath("/admin/items");
  revalidatePath("/admin/pricing");
  revalidateCatalog();
}

export async function createSupplierAction(formData: FormData) {
  const session = await requireAdmin({ permission: "suppliers.manage" });
  const code = text(formData, "code");
  const name = text(formData, "name");
  if (!code || !name) throw new Error("Supplier code and name are required.");
  const supplier = await createSupplier({
    code,
    name,
    contactName: text(formData, "contactName"),
    email: text(formData, "email"),
    telephone: text(formData, "telephone"),
    leadTimeDays: number(formData, "leadTimeDays"),
    paymentTerms: text(formData, "paymentTerms"),
  });
  await writeAuditLog({
    action: "supplier.created",
    entityType: "supplier",
    entityId: supplier.id,
    summary: `Created supplier ${code} - ${name}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/suppliers");
}

export async function createSupplierOfferAction(formData: FormData) {
  const session = await requireAdmin({ permission: "suppliers.manage" });
  const supplierId = text(formData, "supplierId");
  const productId = text(formData, "productId");
  const unitCost = number(formData, "unitCost");
  if (!supplierId || !productId || unitCost < 0)
    throw new Error("Supplier, product and a valid unit cost are required.");
  const offer = await createSupplierOffer({
    supplierId,
    productId,
    unitCost,
    minimumOrderQuantity: number(formData, "minimumOrderQuantity") || 1,
    availableQuantity: text(formData, "availableQuantity")
      ? number(formData, "availableQuantity")
      : undefined,
    leadTimeDays: text(formData, "offerLeadTimeDays")
      ? number(formData, "offerLeadTimeDays")
      : undefined,
    validUntil: text(formData, "validUntil"),
    isPreferred: formData.get("isPreferred") === "on",
    actorId: session.user.id,
  });
  await writeAuditLog({
    action: "supplier.offer.created",
    entityType: "supplier_offer",
    entityId: offer.id,
    summary: `Recorded supplier offer at R${unitCost.toFixed(2)}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/pricing");
}

export async function approveProductPriceAction(
  productId: string,
  formData: FormData,
) {
  const session = await requireAdmin({ permission: "pricing.manage" });
  const sellingPrice = number(formData, "sellingPrice");
  if (sellingPrice <= 0)
    throw new Error("The approved selling price must be greater than zero.");
  await approveProductPrice(productId, sellingPrice, session.user.id, session.isSuperAdmin);
  await writeAuditLog({
    action: "pricing.approved",
    entityType: "master_product",
    entityId: productId,
    summary: `Approved selling price R${sellingPrice.toFixed(2)}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/pricing");
  revalidatePath("/admin/items");
}

export async function updateProcurementRequirementAction(
  id: string,
  formData: FormData,
) {
  const session = await requireAdmin({ permission: "procurement.manage" });
  await updateProcurementRequirement(id, {
    requestedQuantity: number(formData, "requestedQuantity"),
    confirmedQuantity: number(formData, "confirmedQuantity"),
    securedQuantity: number(formData, "securedQuantity"),
    receivedQuantity: number(formData, "receivedQuantity"),
  });
  await writeAuditLog({
    action: "procurement.requirement.updated",
    entityType: "procurement_requirement",
    entityId: id,
    summary: "Updated requested, confirmed, secured and received quantities",
    actorId: session.user.id,
  });
  revalidatePath("/admin/procurement");
  revalidatePath("/admin");
}

export async function createSupplierPurchaseOrderAction(formData: FormData) {
  const session = await requireAdmin({ permission: "procurement.manage" });
  const orderedQuantity = number(formData, "orderedQuantity");
  const unitCost = number(formData, "purchaseUnitCost");
  if (
    !text(formData, "supplierId") ||
    !text(formData, "requirementId") ||
    orderedQuantity <= 0 ||
    unitCost < 0
  )
    throw new Error(
      "Supplier, requirement, quantity and unit cost are required.",
    );
  const purchase = await createSupplierPurchaseOrder({
    supplierId: text(formData, "supplierId"),
    requirementId: text(formData, "requirementId"),
    orderedQuantity,
    unitCost,
    expectedOn: text(formData, "expectedOn"),
    notes: text(formData, "notes"),
    actorId: session.user.id,
  });
  await writeAuditLog({
    action: "procurement.purchase.created",
    entityType: "supplier_purchase_order",
    entityId: purchase.id,
    summary: `Created ${purchase.purchaseOrderNumber}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/procurement");
}

export async function updateFulfilmentAction(id: string, formData: FormData) {
  const session = await requireAdmin({ permission: "fulfilment.manage" });
  const status = text(formData, "status");
  await updateFulfilmentRecord(
    id,
    status,
    text(formData, "courierName"),
    text(formData, "waybillNumber"),
  );
  const packingId = text(formData, "packingId");
  const packingStatus = text(formData, "packingStatus");
  if (packingId && packingStatus)
    await updatePackingRecord(packingId, packingStatus, session.user.id);
  await writeAuditLog({
    action: "fulfilment.updated",
    entityType: "fulfilment",
    entityId: id,
    summary: `Fulfilment status changed to ${status}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/fulfilment");
  revalidatePath("/admin");
}

export async function createOperationalTaskAction(formData: FormData) {
  const session = await requireAdmin({ permission: "tasks.manage" });
  const title = text(formData, "title");
  if (!title) throw new Error("Task title is required.");
  const task = await createOperationalTask({
    title,
    description: text(formData, "description"),
    priority: text(formData, "priority") || "normal",
    dueAt: text(formData, "dueAt"),
    entityType: text(formData, "entityType"),
    entityId: text(formData, "entityId"),
    createdBy: session.user.id,
  });
  await writeAuditLog({
    action: "task.created",
    entityType: "operational_task",
    entityId: task.id,
    summary: `Created task: ${title}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
}

export async function updateOperationalTaskStatusAction(
  id: string,
  formData: FormData,
) {
  const session = await requireAdmin({ permission: "tasks.manage" });
  const status = text(formData, "status");
  await updateOperationalTaskStatus(id, status);
  await writeAuditLog({
    action: "task.status.updated",
    entityType: "operational_task",
    entityId: id,
    summary: `Task status changed to ${status}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/tasks");
  revalidatePath("/admin");
}

export async function createSeasonAction(formData: FormData) {
  const session = await requireAdmin({ permission: "settings.manage" });
  const name = text(formData, "name");
  const academicYear = number(formData, "academicYear");
  if (!name || !academicYear) throw new Error("Season name and academic year are required.");
  const season = await createSeason({
    name,
    academicYear,
    startsOn: text(formData, "startsOn"),
    orderingClosesOn: text(formData, "orderingClosesOn"),
    fulfilmentStartsOn: text(formData, "fulfilmentStartsOn"),
    fulfilmentEndsOn: text(formData, "fulfilmentEndsOn"),
    status: text(formData, "status") || "planning",
    isDefault: formData.get("isDefault") === "on",
  });
  await writeAuditLog({
    action: "season.created",
    entityType: "season",
    entityId: season.id,
    summary: `Created season ${name} (${academicYear})`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/seasons");
  revalidateCatalog({ revalidateSeason: true });
}

export async function updateSeasonAction(id: string, formData: FormData) {
  const session = await requireAdmin({ permission: "settings.manage" });
  await updateSeason(id, {
    name: text(formData, "name"),
    academicYear: number(formData, "academicYear"),
    startsOn: text(formData, "startsOn"),
    orderingClosesOn: text(formData, "orderingClosesOn"),
    fulfilmentStartsOn: text(formData, "fulfilmentStartsOn"),
    fulfilmentEndsOn: text(formData, "fulfilmentEndsOn"),
    status: text(formData, "status"),
    isDefault: formData.get("isDefault") === "on",
  });
  await writeAuditLog({
    action: "season.updated",
    entityType: "season",
    entityId: id,
    summary: "Updated season",
    actorId: session.user.id,
  });
  revalidatePath("/admin/seasons");
  revalidateCatalog({ revalidateSeason: true });
}

export async function setDefaultSeasonAction(id: string) {
  const session = await requireAdmin({ permission: "settings.manage" });
  await setDefaultSeason(id);
  await writeAuditLog({
    action: "season.setDefault",
    entityType: "season",
    entityId: id,
    summary: "Set as default operational season",
    actorId: session.user.id,
  });
  revalidatePath("/admin/seasons");
  revalidateCatalog({ revalidateSeason: true });
}

export async function createTaskCommentAction(
  taskId: string,
  formData: FormData,
) {
  const session = await requireAdmin({ permission: "tasks.manage" });
  const body = text(formData, "body");
  if (!body) throw new Error("Comment body is required.");
  const comment = await createTaskComment({
    taskId,
    authorId: session.user.id,
    body,
  });
  await writeAuditLog({
    action: "task.comment.created",
    entityType: "task_comment",
    entityId: comment.id,
    summary: `Added comment to task ${taskId}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/tasks/${taskId}`);
}

export async function deleteTaskCommentAction(
  taskId: string,
  commentId: string,
) {
  const session = await requireAdmin({ permission: "tasks.manage" });
  await deleteTaskComment(commentId);
  await writeAuditLog({
    action: "task.comment.deleted",
    entityType: "task_comment",
    entityId: commentId,
    summary: `Deleted comment from task ${taskId}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/tasks/${taskId}`);
}

export async function createSupplierReceiptAction(formData: FormData) {
  const session = await requireAdmin({ permission: "procurement.manage" });
  const purchaseOrderId = text(formData, "purchaseOrderId");
  if (!purchaseOrderId) throw new Error("Purchase order ID is required.");
  
  const items: Array<{ purchaseItemId: string; receivedQuantity: number }> = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("received_")) {
      const purchaseItemId = key.replace("received_", "");
      const qty = parseInt(String(value), 10);
      if (!isNaN(qty) && qty >= 0) {
        items.push({ purchaseItemId, receivedQuantity: qty });
      }
    }
  }
  
  if (items.length === 0) throw new Error("No receipt quantities provided.");
  
  const receipt = await createSupplierReceipt({
    purchaseOrderId,
    receivedBy: session.user.id,
    reference: text(formData, "reference"),
    notes: text(formData, "notes"),
    items,
  });
  
  await writeAuditLog({
    action: "supplier.receipt.created",
    entityType: "supplier_receipt",
    entityId: receipt.id,
    summary: `Received goods for purchase order`,
    actorId: session.user.id,
  });
  
  revalidatePath("/admin/procurement");
  revalidatePath("/admin/procurement/receiving");
}

export async function updateApprovalAction(
  id: string,
  formData: FormData,
) {
  const session = await requireAdmin({ permission: "settings.manage" });
  const status = text(formData, "status") as "approved" | "rejected" | "cancelled";
  if (!["approved", "rejected", "cancelled"].includes(status)) {
    throw new Error("Invalid approval status.");
  }
  await updateApproval(id, {
    status,
    decidedBy: session.user.id,
    decisionNotes: text(formData, "decisionNotes"),
  });
  await writeAuditLog({
    action: "approval.updated",
    entityType: "approval",
    entityId: id,
    summary: `Approval ${status}`,
    actorId: session.user.id,
  });
  revalidatePath("/admin/approvals");
}

export async function updateSupplierAction(id: string, formData: FormData) {
  const session = await requireAdmin({ permission: "suppliers.manage" });
  await updateSupplier(id, {
    name: text(formData, "name"),
    contactName: text(formData, "contactName"),
    email: text(formData, "email"),
    telephone: text(formData, "telephone"),
    leadTimeDays: formData.get("leadTimeDays")
      ? parseInt(String(formData.get("leadTimeDays")), 10)
      : undefined,
    paymentTerms: text(formData, "paymentTerms"),
    active: formData.get("active") !== "off",
  });
  await writeAuditLog({
    action: "supplier.updated",
    entityType: "supplier",
    entityId: id,
    summary: "Updated supplier",
    actorId: session.user.id,
  });
  revalidatePath("/admin/suppliers");
}

export async function updateSupplierOfferAction(
  id: string,
  formData: FormData,
) {
  const session = await requireAdmin({ permission: "suppliers.manage" });
  await updateSupplierOffer(id, {
    unitCost: formData.get("unitCost")
      ? parseFloat(String(formData.get("unitCost")))
      : undefined,
    minimumOrderQuantity: formData.get("minimumOrderQuantity")
      ? parseInt(String(formData.get("minimumOrderQuantity")), 10)
      : undefined,
    availableQuantity: formData.get("availableQuantity")
      ? parseInt(String(formData.get("availableQuantity")), 10)
      : undefined,
    leadTimeDays: formData.get("leadTimeDays")
      ? parseInt(String(formData.get("leadTimeDays")), 10)
      : undefined,
    validUntil: text(formData, "validUntil"),
    isPreferred: formData.get("isPreferred") === "on",
    active: formData.get("active") !== "off",
  });
  await writeAuditLog({
    action: "supplier.offer.updated",
    entityType: "supplier_offer",
    entityId: id,
    summary: "Updated supplier offer",
    actorId: session.user.id,
  });
  revalidatePath("/admin/suppliers");
}

export async function upsertCustomerAndLearnerAction(input: {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  learnerName: string;
  schoolSlug: string;
  grade: string;
}) {
  return upsertCustomerAndLearner(input);
}

export async function linkOrderToCustomerAndLearnerAction(
  orderId: string,
  customerId: string,
  learnerId: string,
) {
  await linkOrderToCustomerAndLearner(orderId, customerId, learnerId);
}
