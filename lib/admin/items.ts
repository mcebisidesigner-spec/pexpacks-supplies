import { z } from "zod";
import { revalidateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type PermissionKey,
  type AdminSession,
} from "@/lib/admin/rbac";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";

export type ItemRow = Database["public"]["Tables"]["stationery_items"]["Row"] & {
  category?: string | null;
  slug?: string | null;
};

const optString = (max: number, label: string) =>
  z
    .union([z.literal(""), z.string().trim().max(max, `${label} is too long`)])
    .transform((v) => (v === "" ? null : v));

const countField = z.coerce
  .number()
  .int("Must be a whole number")
  .min(0, "Cannot be negative")
  .max(1_000_000, "Value is too large");

const iconField = optString(60, "icon");
const slugField = optString(100, "slug");

const priceField = z.preprocess(
  (v) => {
    if (v === "" || v == null) return null;
    if (typeof v === "number") return v;
    const n = Number(String(v).trim().replace(",", "."));
    return Number.isFinite(n) ? n : v;
  },
  z
    .number({ message: "Enter a valid price" })
    .min(0, "Cannot be negative")
    .max(99_999_999, "Value is too large")
    .nullable()
);

export const itemSchema = z.object({
  pack_id: z.string().uuid("Invalid pack id"),
  name: z.string().trim().min(1, "Enter an item description").max(200, "Item description is too long"),
  category: optString(200, "category"),
  description: optString(2000, "description"),
  specification: optString(2000, "specification"),
  quantity: countField,
  image: optString(2000, "image URL"),
  icon: iconField,
  price: priceField,
  visible: z.boolean().default(false),
  sort_order: countField,
  slug: slugField.nullable(),
});

export type ItemFormData = z.infer<typeof itemSchema>;

export type ParsedItemForm =
  | { ok: true; data: ItemFormData }
  | { ok: false; errors: Record<string, string> };

export type ItemFormResult =
  | { ok: true; item: ItemRow }
  | { ok: false; errors: Record<string, string>; message?: string };

export type ItemFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

/** ItemFormData minus the `price` key, which maps to the `unit_price` column. */
function restOf(data: ItemFormData): Omit<ItemFormData, "price"> {
  const { price, ...rest } = data;
  void price;
  return rest;
}

export function parseItemForm(formData: FormData): ParsedItemForm {
  const parsed = itemSchema.safeParse({
    pack_id: raw(formData, "pack_id"),
    name: raw(formData, "name"),
    category: raw(formData, "category"),
    description: raw(formData, "description"),
    specification: raw(formData, "specification"),
    quantity: raw(formData, "quantity") || "1",
    image: raw(formData, "image"),
    icon: raw(formData, "icon"),
    price: raw(formData, "price"),
    visible: formData.has("visible"),
    sort_order: raw(formData, "sort_order") || "0",
    slug: raw(formData, "slug"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  return { ok: true, data: parsed.data };
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

export interface ItemListFilters {
  q?: string;
  pack_id?: string;
  page?: number;
  pageSize?: number;
}

export interface ItemListItem extends ItemRow {
  pack_title: string | null;
}

export interface ItemListResult {
  items: ItemListItem[];
  total: number;
  page: number;
  pageCount: number;
}

export async function listItems(filters: ItemListFilters = {}): Promise<ItemListResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("stationery_items")
    .select(
      "*,stationery_packs(title)",
      { count: "exact" }
    );

  if (filters.q) {
    const rawQ = Array.isArray(filters.q)
      ? ((filters.q as unknown as string[]).find((x) => x && String(x).trim()) || "")
      : String(filters.q);
    const q = rawQ.replace(/%/g, "").trim();
    if (q) query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (filters.pack_id) query = query.eq("pack_id", filters.pack_id);

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("[items] list failed:", error);
    return { items: [], total: 0, page, pageCount: 0 };
  }

  const rows = (data ?? []) as unknown as (ItemRow & { stationery_packs?: { title: string | null } | null })[];

  return {
    items: rows.map((row) => ({
      ...row,
      pack_title: row.stationery_packs?.title ?? null,
    })),
    total: count ?? 0,
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export async function getItem(idOrSlug: string): Promise<ItemRow | null> {
  const admin = createSupabaseAdminClient();
  const decoded = decodeURIComponent(idOrSlug).trim();
  if (!decoded) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded);

  if (isUuid) {
    const { data } = await admin.from("stationery_items").select("*").eq("id", decoded).maybeSingle();
    if (data) return data as unknown as ItemRow;
  }

  const slugified = decoded.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  // 1. Direct query by exact slug or exact name
  const { data: directMatch } = await admin
    .from("stationery_items")
    .select("*")
    .or(`slug.ilike.${decoded},slug.ilike.${slugified},name.ilike.${decoded}`)
    .limit(1)
    .maybeSingle();

  if (directMatch) return directMatch as unknown as ItemRow;

  // 2. Fallback: match all items by slugified name or ID
  const { data: allItems } = await admin.from("stationery_items").select("*");
  if (!allItems) return null;

  const matched = allItems.find((rawItem) => {
    const item = rawItem as unknown as ItemRow;
    const itemSlug = item.slug || item.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return itemSlug === slugified || item.id === decoded;
  });

  return (matched as unknown as ItemRow) ?? null;
}

export async function createItem(formData: FormData): Promise<ItemFormResult> {
  const actor = await assertCan("items.create");
  const parsed = parseItemForm(formData);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const admin = createSupabaseAdminClient();

  try {
    let data = parsed.data;
    if (!data.sort_order || data.sort_order <= 0) {
      const { data: rows } = await admin
        .from("stationery_items")
        .select("sort_order")
        .eq("pack_id", data.pack_id)
        .order("sort_order", { ascending: false })
        .limit(1);
      const max = rows?.[0]?.sort_order ?? 0;
      data = { ...data, sort_order: max + 1 };
    }

    const { data: created, error } = await admin
      .from("stationery_items")
      .insert({ ...restOf(data), unit_price: data.price, created_by: actor.user.id } as any)
      .select()
      .single();

    if (error) throw error;

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "items.create",
      entityType: "item",
      entityId: created.id,
      summary: `Created item "${created.name}"`,
    });

    revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

    return { ok: true, item: created };
  } catch (err) {
    console.error("[items] create failed:", err);
    return { ok: false, errors: {}, message: "Failed to create item. Please try again." };
  }
}

export async function updateItem(id: string, formData: FormData): Promise<ItemFormResult> {
  const actor = await assertCan("items.edit");
  const parsed = parseItemForm(formData);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const admin = createSupabaseAdminClient();
  const existing = await admin.from("stationery_items").select("id").eq("id", id).maybeSingle();
  if (existing.error || !existing.data) {
    return { ok: false, errors: {}, message: "Item not found." };
  }

  try {
    const { data: updated, error } = await admin
      .from("stationery_items")
      .update({ ...restOf(parsed.data), unit_price: parsed.data.price } as any)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "items.edit",
      entityType: "item",
      entityId: updated.id,
      summary: `Updated item "${updated.name}"`,
    });

    revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

    return { ok: true, item: updated };
  } catch (err) {
    console.error("[items] update failed:", err);
    return { ok: false, errors: {}, message: "Failed to update item. Please try again." };
  }
}

export async function deleteItem(id: string): Promise<{ ok: boolean; message?: string; packId?: string }> {
  const actor = await assertCan("items.delete");
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin.from("stationery_items").select("id, name, pack_id").eq("id", id).single();
  if (!existing) return { ok: false, message: "Item not found." };

  const { error } = await admin.from("stationery_items").delete().eq("id", id);
  if (error) {
    console.error("[items] delete failed:", error);
    return { ok: false, message: "Failed to delete item." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "items.delete",
    entityType: "item",
    entityId: id,
    summary: `Deleted item "${existing.name}"`,
  });

  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

  return { ok: true, packId: existing.pack_id };
}

export async function reorderItems(
  packId: string,
  orderedIds: string[]
): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("items.reorder");
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin.from("stationery_items").select("id").eq("pack_id", packId);
  if (!existing) return { ok: false, message: "No items found in this pack." };

  const idSet = new Set(orderedIds);
  const valid = existing.filter((item) => idSet.has(item.id));
  if (valid.length !== existing.length) {
    return { ok: false, message: "The item list changed. Refresh and try again." };
  }

  try {
    const updates = orderedIds.map((id, index) =>
      admin.from("stationery_items").update({ sort_order: index + 1 }).eq("id", id)
    );
    await Promise.all(updates);

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "items.reorder",
      entityType: "pack",
      entityId: packId,
      summary: `Reordered ${updates.length} items in a pack`,
    });

    revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

    return { ok: true };
  } catch (err) {
    console.error("[items] reorder failed:", err);
    return { ok: false, message: "Failed to reorder items." };
  }
}

export interface ImportItemsResult {
  ok: boolean;
  created: number;
  updated: number;
  errors: string[];
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^\ufeff/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const firstLine = src.split("\n")[0] || "";
  let delimiter = ",";
  if (!firstLine.includes(",") && firstLine.includes(";")) {
    delimiter = ";";
  } else if (!firstLine.includes(",") && firstLine.includes("\t")) {
    delimiter = "\t";
  }

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

const CSV_ALIASES: Record<string, string> = {
  name: "name",
  item: "name",
  itemname: "name",
  stationeryname: "name",
  product: "name",
  title: "name",
  quantity: "quantity",
  qty: "quantity",
  qtyperlearner: "quantity",
  count: "quantity",
  description: "description",
  notes: "description",
  descr: "description",
  specification: "specification",
  spec: "specification",
  specs: "specification",
  icon: "icon",
  price: "price",
  unitprice: "price",
  totalprice: "price",
  cost: "price",
  visible: "visible",
  sortorder: "sort_order",
  order: "sort_order",
  sort: "sort_order",
};

function cleanHeader(value: string): string {
  return value.replace(/^\ufeff/, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export async function importItemsCsv(packId: string, csvText: string): Promise<ImportItemsResult> {
  const actor = await assertCan("items.import");
  const admin = createSupabaseAdminClient();

  const result: ImportItemsResult = { ok: true, created: 0, updated: 0, errors: [] };
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    result.ok = false;
    result.errors.push("The CSV file is empty.");
    return result;
  }

  const first = rows[0].map((h) => cleanHeader(h));
  const headerMap = new Map<string, number>();
  const hasHeader = first.some((h) => CSV_ALIASES[h]);
  if (hasHeader) {
    first.forEach((h, i) => {
      const key = CSV_ALIASES[h];
      if (key && !headerMap.has(key)) headerMap.set(key, i);
    });
    rows.shift();
  } else {
    headerMap.set("name", 0);
    headerMap.set("quantity", 1);
    headerMap.set("description", 2);
  }

  if (!headerMap.has("name")) {
    result.ok = false;
    result.errors.push('The CSV needs a "name" column.');
    return result;
  }

  const { data: existing } = await admin.from("stationery_items").select("id, name").eq("pack_id", packId);
  const byName = new Map((existing ?? []).map((item) => [item.name.toLowerCase(), item.id]));

  const parseRow = (row: string[], lineNumber: number): ItemFormData | null => {
    const field = (key: string): string => {
      const idx = headerMap.get(key);
      return idx === undefined ? "" : (row[idx] ?? "").trim();
    };
    const rawName = field("name");
    if (!rawName) return null;

    const rawQty = field("quantity");
    const qtyMatch = rawQty.match(/\d+/);
    const parsedQty = qtyMatch ? qtyMatch[0] : "1";

    const rawPrice = field("price");
    const cleanedPrice = rawPrice ? rawPrice.replace(/[^\d.,]/g, "").replace(",", ".") : "";

    const rawVis = field("visible").toLowerCase();
    const isVisible = rawVis === "" ? true : ["true", "1", "yes", "y"].includes(rawVis);

    const candidate: Record<string, unknown> = {
      pack_id: packId,
      name: rawName,
      description: field("description"),
      specification: field("specification"),
      quantity: parsedQty,
      image: "",
      icon: field("icon"),
      price: cleanedPrice || null,
      visible: isVisible,
      sort_order: field("sort_order") || "0",
    };
    const parsed = itemSchema.safeParse(candidate);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => `${String(issue.path[0])}: ${issue.message}`).join("; ");
      result.errors.push(`Row ${lineNumber}: ${message}`);
      return null;
    }
    return parsed.data;
  };

  for (let i = 0; i < rows.length; i++) {
    const lineNumber = i + (hasHeader ? 2 : 1);
    const data = parseRow(rows[i], lineNumber);
    if (!data) continue;

    const key = data.name.toLowerCase();
    const existingId = byName.get(key);

    try {
      if (existingId) {
        const { error } = await admin
          .from("stationery_items")
          .update({ ...restOf(data), unit_price: data.price } as any)
          .eq("id", existingId);
        if (error) throw error;
        result.updated += 1;
      } else {
        const { error } = await admin
          .from("stationery_items")
          .insert({ ...restOf(data), unit_price: data.price, created_by: actor.user.id } as any);
        if (error) throw error;
        byName.set(key, "new");
        result.created += 1;
      }
    } catch (err) {
      console.error("[items] csv row failed:", err);
      result.errors.push(`Row ${lineNumber}: failed to save item "${data.name}".`);
    }
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "items.import",
    entityType: "pack",
    entityId: packId,
    summary: `Imported items CSV: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`,
  });

  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

  return result;
}

export const packLineSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(200, "Item name is too long"),
  description: z
    .union([z.string().trim().max(2000, "Description is too long"), z.null(), z.literal("")])
    .optional(),
  unit_price: z.union([z.number().min(0).max(99_999_999), z.null()]).optional(),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(1_000_000, "Quantity is too large"),
});

export type PackLineInput = z.infer<typeof packLineSchema>;

/**
 * Creates pack item rows in one insert from selector lines. Used when a pack is
 * created together with its items (PackForm → createPack).
 */
export async function createPackItems(
  packId: string,
  lines: PackLineInput[],
  createdBy: string
): Promise<{ ok: boolean; created: number }> {
  if (lines.length === 0) return { ok: true, created: 0 };

  const parsed = z.array(packLineSchema).safeParse(lines);
  if (!parsed.success) return { ok: false, created: 0 };

  const admin = createSupabaseAdminClient();
  const rows = parsed.data.map((line, index) => ({
    pack_id: packId,
    name: line.name.trim(),
    description: line.description || null,
    unit_price: line.unit_price ?? null,
    quantity: line.quantity,
    icon: null,
    visible: true,
    sort_order: index + 1,
    created_by: createdBy,
  }));

  const { error } = await admin.from("stationery_items").insert(rows);
  if (error) {
    console.error("[items] bulk create failed:", error);
    return { ok: false, created: 0 };
  }
  return { ok: true, created: rows.length };
}

/**
 * Reconciles a pack's items to the given selector lines: lines whose name no
 * longer appears are deleted, matching items get their quantity/price/order
 * updated (specification, icon and visibility are preserved), and new lines
 * are inserted. Sort order follows the order of the lines.
 */
export async function reconcilePackItems(
  packId: string,
  lines: PackLineInput[]
): Promise<{ ok: boolean; created: number; updated: number; deleted: number; message?: string }> {
  const actor = await assertCan("items.edit");
  const parsed = z.array(packLineSchema).safeParse(lines);
  if (!parsed.success) {
    return { ok: false, created: 0, updated: 0, deleted: 0, message: "One of the items is not valid." };
  }

  const admin = createSupabaseAdminClient();
  const { data: existingRows, error: loadError } = await admin
    .from("stationery_items")
    .select("id, name, description, quantity, unit_price, sort_order")
    .eq("pack_id", packId);
  if (loadError) {
    console.error("[items] reconcile load failed:", loadError);
    return { ok: false, created: 0, updated: 0, deleted: 0, message: "Failed to load items." };
  }

  const remaining = new Map(
    (existingRows ?? []).map((row) => [row.name.trim().toLowerCase(), row])
  );

  let created = 0;
  let updated = 0;
  let deleted = 0;

  for (let index = 0; index < parsed.data.length; index++) {
    const line = parsed.data[index];
    const key = line.name.trim().toLowerCase();
    const current = remaining.get(key);
    const sortOrder = index + 1;

    if (current) {
      const patch: Partial<ItemRow> = {
        quantity: line.quantity,
        unit_price: line.unit_price ?? null,
        sort_order: sortOrder,
      };
      const nextDescription = line.description?.trim();
      if (nextDescription && nextDescription !== current.description) {
        patch.description = nextDescription;
      }
      const { error } = await admin.from("stationery_items").update(patch as any).eq("id", current.id);
      if (error) {
        console.error("[items] reconcile update failed:", error);
      } else {
        updated += 1;
      }
      remaining.delete(key);
    } else {
      const { error } = await admin.from("stationery_items").insert({
        pack_id: packId,
        name: line.name.trim(),
        description: line.description || null,
        unit_price: line.unit_price ?? null,
        quantity: line.quantity,
        icon: null,
        visible: true,
        sort_order: sortOrder,
        created_by: actor.user.id,
      });
      if (error) {
        console.error("[items] reconcile insert failed:", error);
      } else {
        created += 1;
      }
    }
  }

  for (const row of remaining.values()) {
    const { error } = await admin.from("stationery_items").delete().eq("id", row.id);
    if (error) {
      console.error("[items] reconcile delete failed:", error);
    } else {
      deleted += 1;
    }
  }

  if (created > 0 || updated > 0 || deleted > 0) {
    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "items.edit",
      entityType: "pack",
      entityId: packId,
      summary: `Synced pack items: ${created} created, ${updated} updated, ${deleted} removed`,
    });
  }

  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

  return { ok: true, created, updated, deleted };
}

export async function listDistinctStationeryItems(): Promise<string[]> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("stationery_items")
      .select("name")
      .order("name", { ascending: true });

    if (!data) return [];
    return Array.from(new Set(data.map((item) => item.name.trim()).filter(Boolean))).sort();
  } catch (err) {
    console.error("[items] listDistinctStationeryItems failed:", err);
    return [];
  }
}

export interface StationeryInventoryItem {
  id: string;
  name: string;
  description: string | null;
  unit_price: number | null;
}

/**
 * Inventory suggestions for the pack item autocomplete: the distinct
 * stationery item names already used across packs, each with a representative
 * unit price (from the most recently created row of that name). When a query
 * is given, names or descriptions containing it (case-insensitive) are
 * returned, so typing any part of an item name — not just its start — matches.
 * Backed by the pg_trgm GIN index from migration 00021.
 */
export async function listStationeryInventory(query?: string): Promise<StationeryInventoryItem[]> {
  try {
    const admin = createSupabaseAdminClient();
    const q = (query ?? "").replace(/[%_]/g, "").trim();

    let dbQuery = admin
      .from("stationery_items")
      .select("id, name, description, unit_price")
      .order("name", { ascending: true })
      .order("created_at", { ascending: false });

    if (q) dbQuery = dbQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%`);

    const { data } = await dbQuery.limit(500);
    if (!data) return [];

    const seen = new Set<string>();
    const out: StationeryInventoryItem[] = [];
    for (const row of data) {
      const name = row.name.trim();
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      out.push({ id: row.id, name, description: row.description, unit_price: row.unit_price });
      if (out.length >= 50) break;
    }
    return out;
  } catch (err) {
    console.error("[items] listStationeryInventory failed:", err);
    return [];
  }
}
