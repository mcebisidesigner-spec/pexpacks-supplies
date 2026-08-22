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
import { inventoryItemNameKey } from "@/lib/admin/item-constants";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;
type MasterProductRow = Database["public"]["Tables"]["master_products"]["Row"];
type SchoolPackItemInsert =
  Database["public"]["Tables"]["school_pack_items"]["Insert"];

export type ItemRow = {
  id: string;
  pack_id: string;
  product_id?: string | null;
  legacy_item_id?: string | null;
  name: string;
  description: string | null;
  specification: string | null;
  quantity: number;
  unit_price: number | null;
  image?: string | null;
  icon: string | null;
  visible: boolean;
  sort_order: number;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  search_vector?: string | null;
  category?: string | null;
  slug?: string | null;
  sku?: string | null;
  brand?: string | null;
  source?: string | null;
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
    .nullable(),
);

export const itemSchema = z.object({
  pack_id: z.string().uuid("Invalid pack id"),
  name: z
    .string()
    .trim()
    .min(1, "Enter an item name")
    .max(200, "Item name is too long"),
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

function escapeIlikeLiteral(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function adminPackItemsTable(admin: SupabaseAdminClient) {
  return admin.from("admin_pack_items_view" as never);
}

function masterProductsTable(admin: SupabaseAdminClient) {
  return admin.from("master_products");
}

function schoolPackItemsTable(admin: SupabaseAdminClient) {
  return admin.from("school_pack_items");
}

function productSku(data: Pick<ItemFormData, "category" | "name">): string {
  const entered = data.category?.trim();
  if (entered) return entered.toUpperCase();
  return `PEX-${inventoryItemNameKey(data.name)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)}`;
}

async function ensureMasterProduct(
  admin: SupabaseAdminClient,
  data: Pick<
    ItemFormData,
    "name" | "category" | "description" | "specification" | "visible" | "price"
  >,
  actorId: string,
): Promise<MasterProductRow> {
  const sku = productSku(data);
  const productPatch = {
    sku,
    name: data.name.trim(),
    description: data.description,
    category: data.category,
    specification: data.specification,
    visibility: data.visible ? "public" : "internal",
    availability: "available",
    current_selling_price: data.price ?? 0,
    calculated_selling_price: data.price ?? 0,
    pricing_status: data.price != null ? "review" : "unpriced",
    active: true,
    updated_by: actorId,
  };

  const { data: existingBySku } = await masterProductsTable(admin)
    .select("*")
    .eq("sku", sku)
    .maybeSingle();

  if (existingBySku) {
    const { data: updated, error } = await masterProductsTable(admin)
      .update(productPatch)
      .eq("id", existingBySku.id)
      .select("*")
      .single();
    if (error) throw error;
    return updated as MasterProductRow;
  }

  const { data: existingByName } = await masterProductsTable(admin)
    .select("*")
    .ilike("name", escapeIlikeLiteral(data.name.trim()))
    .maybeSingle();

  if (existingByName) {
    const { data: updated, error } = await masterProductsTable(admin)
      .update(productPatch)
      .eq("id", existingByName.id)
      .select("*")
      .single();
    if (error) throw error;
    return updated as MasterProductRow;
  }

  const { data: created, error } = await masterProductsTable(admin)
    .insert({ ...productPatch, created_by: actorId })
    .select("*")
    .single();
  if (error) throw error;
  return created as MasterProductRow;
}

async function readCanonicalItem(
  admin: SupabaseAdminClient,
  id: string,
): Promise<ItemRow | null> {
  const { data, error } = await adminPackItemsTable(admin)
    .select(
      "id,pack_id,product_id,legacy_item_id,name,description,specification,quantity,unit_price,icon,visible,sort_order,category,sku,brand,source",
    )
    .eq("id", id as never)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as ItemRow;
}

async function nextPackItemSortOrder(
  admin: SupabaseAdminClient,
  packId: string,
): Promise<number> {
  const { data } = await schoolPackItemsTable(admin)
    .select("sort_order")
    .eq("pack_id", packId)
    .order("sort_order", { ascending: false })
    .limit(1);
  return (data?.[0]?.sort_order ?? 0) + 1;
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
  category?: string;
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

export function extractSearchTokens(input: string): string[] {
  const q = String(input).trim();
  if (!q) return [];

  const tokens = new Set<string>();

  // 1. Title before parenthesis e.g. "Extra Thick Triangular Graphite Pencils (e.g., Faber-Castell / Steadtler)" -> "Extra Thick Triangular Graphite Pencils"
  const beforeParen = q
    .split("(")[0]
    .replace(/[%/,()\\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (beforeParen.length >= 2) tokens.add(beforeParen);

  // 2. Full sanitized string without PostgREST control characters
  const fullClean = q
    .replace(/[%/,()\\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (fullClean.length >= 2) tokens.add(fullClean);

  // 3. String with PostgREST syntax delimiters stripped
  const rawSafe = q.replace(/[%/,()]/g, "").trim();
  if (rawSafe.length >= 2) tokens.add(rawSafe);

  return Array.from(tokens);
}

export async function listItems(
  filters: ItemListFilters = {},
): Promise<ItemListResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("admin_pack_items_view" as never)
    .select(
      "id,pack_id,product_id,legacy_item_id,name,description,specification,quantity,unit_price,icon,visible,sort_order,category,sku,brand,source,pack_title",
      { count: "exact" },
    );

  if (filters.q) {
    const rawQ = Array.isArray(filters.q)
      ? (filters.q as unknown as string[]).find((x) => x && String(x).trim()) ||
        ""
      : String(filters.q);
    const tokens = extractSearchTokens(rawQ);
    if (tokens.length > 0) {
      const clauses = tokens.flatMap((t) => [
        `name.ilike.%${t}%`,
        `description.ilike.%${t}%`,
        `category.ilike.%${t}%`,
      ]);
      query = query.or(clauses.join(","));
    }
  }
  if (filters.pack_id)
    query = query.eq("pack_id" as never, filters.pack_id as never);
  if (filters.category)
    query = query.filter("category" as never, "eq", filters.category as never);

  const { data, count, error } = await query
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("[items] list failed:", error);
    return { items: [], total: 0, page, pageCount: 0 };
  }

  const rows = (data ?? []) as unknown as (ItemRow & {
    pack_title?: string | null;
  })[];

  const uniqueRows = Array.from(
    rows
      .reduce((itemsByName, row) => {
        const key = inventoryItemNameKey(row.name);
        if (!itemsByName.has(key)) itemsByName.set(key, row);
        return itemsByName;
      }, new Map<string, (typeof rows)[number]>())
      .values(),
  );
  const rawTotal = count ?? 0;
  const coversAllResults = from === 0 && rows.length === rawTotal;
  const total = coversAllResults ? uniqueRows.length : rawTotal;

  return {
    items: uniqueRows.map((row) => ({
      ...row,
      pack_title: row.pack_title ?? null,
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type StationeryCatalogueSection = {
  name: string;
  count: number;
};

export async function listStationeryCatalogueSections(): Promise<
  StationeryCatalogueSection[]
> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("admin_pack_items_view" as never)
      .select("category,name")
      .order("category" as never, { ascending: true })
      .limit(5000);

    if (error || !data) {
      if (error) console.error("[items] section list failed:", error);
      return [];
    }

    const sections = new Map<string, Set<string>>();
    for (const row of data as Array<{
      category?: string | null;
      name?: string | null;
    }>) {
      const section = row.category?.trim();
      const name = row.name?.trim();
      if (!section || !name) continue;
      if (!sections.has(section)) sections.set(section, new Set<string>());
      sections.get(section)?.add(inventoryItemNameKey(name));
    }

    return Array.from(sections.entries())
      .map(([name, items]) => ({ name, count: items.size }))
      .sort((a, b) => a.name.localeCompare(b.name, "en-ZA"));
  } catch (err) {
    console.error("[items] listStationeryCatalogueSections failed:", err);
    return [];
  }
}

export async function getItem(idOrSlug: string): Promise<ItemRow | null> {
  const admin = createSupabaseAdminClient();
  const decoded = decodeURIComponent(idOrSlug).trim();
  if (!decoded) return null;

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      decoded,
    );

  if (isUuid) {
    const data = await readCanonicalItem(admin, decoded);
    if (data) return data;
  }

  const slugified = decoded
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // 1. Direct query by exact slug or exact name
  const { data: directMatch } = await admin
    .from("admin_pack_items_view" as never)
    .select(
      "id,pack_id,product_id,legacy_item_id,name,description,specification,quantity,unit_price,icon,visible,sort_order,category,sku,brand,source",
    )
    .or(
      `sku.ilike.${decoded},sku.ilike.${slugified},name.ilike.${decoded}` as never,
    )
    .limit(1)
    .maybeSingle();

  if (directMatch) return directMatch as unknown as ItemRow;

  // 2. Fallback: match all items by slugified name or ID
  const { data: allItems } = await admin
    .from("admin_pack_items_view" as never)
    .select(
      "id,pack_id,product_id,legacy_item_id,name,description,specification,quantity,unit_price,icon,visible,sort_order,category,sku,brand,source",
    );
  if (!allItems) return null;

  const matched = allItems.find((rawItem) => {
    const item = rawItem as unknown as ItemRow;
    const itemSlug =
      item.slug ||
      item.sku?.toLowerCase() ||
      item.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return itemSlug === slugified || item.id === decoded;
  });

  return (matched as unknown as ItemRow) ?? null;
}

export async function syncPackTotalPrice(packId: string): Promise<number> {
  if (!packId) return 0;
  const admin = createSupabaseAdminClient();
  const { data: items } = await admin
    .from("admin_pack_items_view" as never)
    .select("unit_price, quantity")
    .eq("pack_id" as never, packId as never);

  const totalPrice = (
    (items ?? []) as unknown as Pick<ItemRow, "unit_price" | "quantity">[]
  ).reduce(
    (sum, item) => sum + (item.unit_price ?? 0) * (item.quantity ?? 1),
    0,
  );

  const rounded = Math.round(totalPrice * 100) / 100;
  await admin
    .from("school_packs")
    .update({ price: rounded, updated_at: new Date().toISOString() })
    .eq("id", packId);

  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
  return rounded;
}

export async function createItem(formData: FormData): Promise<ItemFormResult> {
  const actor = await assertCan("items.create");
  const parsed = parseItemForm(formData);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const admin = createSupabaseAdminClient();

  try {
    let data = parsed.data;
    if (!data.sort_order || data.sort_order <= 0) {
      data = {
        ...data,
        sort_order: await nextPackItemSortOrder(admin, data.pack_id),
      };
    }

    const product = await ensureMasterProduct(admin, data, actor.user.id);
    const { data: createdLink, error } = await schoolPackItemsTable(admin)
      .insert({
        pack_id: data.pack_id,
        product_id: product.id,
        pack_quantity: data.quantity,
        school_wording:
          data.name.trim() === product.name ? null : data.name.trim(),
        school_notes: data.description,
        selling_price_override: data.price,
        sort_order: data.sort_order,
        active: data.visible,
      })
      .select("id")
      .single();

    if (error) throw error;
    const created = await readCanonicalItem(admin, createdLink.id);
    if (!created) throw new Error("Created item could not be loaded.");

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "items.create",
      entityType: "item",
      entityId: created.id,
      summary: `Created item "${created.name}"`,
    });

    if (created.pack_id) {
      await syncPackTotalPrice(created.pack_id);
    }
    revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

    return { ok: true, item: created };
  } catch (err) {
    console.error("[items] create failed:", err);
    return {
      ok: false,
      errors: {},
      message: "Failed to create item. Please try again.",
    };
  }
}

export async function updateItem(
  id: string,
  formData: FormData,
): Promise<ItemFormResult> {
  const actor = await assertCan("items.edit");
  const parsed = parseItemForm(formData);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const admin = createSupabaseAdminClient();
  const existing = await readCanonicalItem(admin, id);
  if (!existing) {
    return { ok: false, errors: {}, message: "Item not found." };
  }

  try {
    const product = await ensureMasterProduct(
      admin,
      parsed.data,
      actor.user.id,
    );
    const { data: updatedLink, error } = await schoolPackItemsTable(admin)
      .update({
        pack_id: parsed.data.pack_id,
        product_id: product.id,
        pack_quantity: parsed.data.quantity,
        school_wording:
          parsed.data.name.trim() === product.name
            ? null
            : parsed.data.name.trim(),
        school_notes: parsed.data.description,
        selling_price_override: parsed.data.price,
        sort_order: parsed.data.sort_order,
        active: parsed.data.visible,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (error) throw error;
    const updated = await readCanonicalItem(admin, updatedLink.id);
    if (!updated) throw new Error("Updated item could not be loaded.");

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "items.edit",
      entityType: "item",
      entityId: updated.id,
      summary: `Updated item "${updated.name}"`,
    });

    if (updated.pack_id) {
      await syncPackTotalPrice(updated.pack_id);
    }
    revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

    return { ok: true, item: updated };
  } catch (err) {
    console.error("[items] update failed:", err);
    return {
      ok: false,
      errors: {},
      message: "Failed to update item. Please try again.",
    };
  }
}

export async function deleteItem(
  id: string,
): Promise<{ ok: boolean; message?: string; packId?: string }> {
  const actor = await assertCan("items.delete");
  const admin = createSupabaseAdminClient();

  const existing = await readCanonicalItem(admin, id);
  if (!existing) return { ok: false, message: "Item not found." };

  const { error } = await schoolPackItemsTable(admin).delete().eq("id", id);
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

  if (existing.pack_id) {
    await syncPackTotalPrice(existing.pack_id);
  }
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

  return { ok: true, packId: existing.pack_id };
}

export async function reorderItems(
  packId: string,
  orderedIds: string[],
): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("items.reorder");
  const admin = createSupabaseAdminClient();

  const { data: existing } = await schoolPackItemsTable(admin)
    .select("id")
    .eq("pack_id", packId);
  if (!existing) return { ok: false, message: "No items found in this pack." };

  const idSet = new Set(orderedIds);
  const valid = existing.filter((item) => idSet.has(item.id));
  if (valid.length !== existing.length) {
    return {
      ok: false,
      message: "The item list changed. Refresh and try again.",
    };
  }

  try {
    const updates = orderedIds.map((id, index) =>
      schoolPackItemsTable(admin)
        .update({ sort_order: index + 1 })
        .eq("id", id),
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
  const src = text
    .replace(/^\ufeff/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

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
  return value
    .replace(/^\ufeff/, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

export async function importItemsCsv(
  packId: string,
  csvText: string,
): Promise<ImportItemsResult> {
  const actor = await assertCan("items.import");
  const admin = createSupabaseAdminClient();

  const result: ImportItemsResult = {
    ok: true,
    created: 0,
    updated: 0,
    errors: [],
  };
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

  const { data: existing } = await adminPackItemsTable(admin)
    .select("id, name")
    .eq("pack_id" as never, packId as never);
  const existingItems = (existing ?? []) as unknown as Pick<
    ItemRow,
    "id" | "name"
  >[];
  const byName = new Map(
    existingItems.map((item) => [item.name.toLowerCase(), item.id]),
  );

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
    const cleanedPrice = rawPrice
      ? rawPrice.replace(/[^\d.,]/g, "").replace(",", ".")
      : "";

    const rawVis = field("visible").toLowerCase();
    const isVisible =
      rawVis === "" ? true : ["true", "1", "yes", "y"].includes(rawVis);

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
      const message = parsed.error.issues
        .map((issue) => `${String(issue.path[0])}: ${issue.message}`)
        .join("; ");
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
        const product = await ensureMasterProduct(admin, data, actor.user.id);
        const { error } = await schoolPackItemsTable(admin)
          .update({
            product_id: product.id,
            pack_quantity: data.quantity,
            school_wording:
              data.name.trim() === product.name ? null : data.name.trim(),
            school_notes: data.description,
            selling_price_override: data.price,
            sort_order: data.sort_order || undefined,
            active: data.visible,
          })
          .eq("id", existingId);
        if (error) throw error;
        result.updated += 1;
      } else {
        const product = await ensureMasterProduct(admin, data, actor.user.id);
        const { error } = await schoolPackItemsTable(admin).insert({
          pack_id: data.pack_id,
          product_id: product.id,
          pack_quantity: data.quantity,
          school_wording:
            data.name.trim() === product.name ? null : data.name.trim(),
          school_notes: data.description,
          selling_price_override: data.price,
          sort_order:
            data.sort_order ||
            (await nextPackItemSortOrder(admin, data.pack_id)),
          active: data.visible,
        });
        if (error) throw error;
        byName.set(key, "new");
        result.created += 1;
      }
    } catch (err) {
      console.error("[items] csv row failed:", err);
      result.errors.push(
        `Row ${lineNumber}: failed to save item "${data.name}".`,
      );
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
  name: z
    .string()
    .trim()
    .min(1, "Item name is required")
    .max(200, "Item name is too long"),
  description: z
    .union([
      z.string().trim().max(2000, "Description is too long"),
      z.null(),
      z.literal(""),
    ])
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
  createdBy: string,
): Promise<{ ok: boolean; created: number }> {
  if (lines.length === 0) return { ok: true, created: 0 };

  const parsed = z.array(packLineSchema).safeParse(lines);
  if (!parsed.success) return { ok: false, created: 0 };

  const admin = createSupabaseAdminClient();
  const rows: SchoolPackItemInsert[] = [];
  for (let index = 0; index < parsed.data.length; index++) {
    const line = parsed.data[index];
    const product = await ensureMasterProduct(
      admin,
      {
        name: line.name,
        category: null,
        description: line.description || null,
        specification: null,
        visible: true,
        price: line.unit_price ?? null,
      },
      createdBy,
    );
    rows.push({
      pack_id: packId,
      product_id: product.id,
      pack_quantity: line.quantity,
      school_wording:
        line.name.trim() === product.name ? null : line.name.trim(),
      school_notes: line.description || null,
      selling_price_override: line.unit_price ?? null,
      sort_order: index + 1,
      active: true,
    });
  }
  const { error } = await schoolPackItemsTable(admin).insert(rows);
  if (error) {
    console.error("[items] bulk canonical create failed:", error);
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
  lines: PackLineInput[],
): Promise<{
  ok: boolean;
  created: number;
  updated: number;
  deleted: number;
  message?: string;
}> {
  const actor = await assertCan("items.edit");
  const parsed = z.array(packLineSchema).safeParse(lines);
  if (!parsed.success) {
    return {
      ok: false,
      created: 0,
      updated: 0,
      deleted: 0,
      message: "One of the items is not valid.",
    };
  }

  const admin = createSupabaseAdminClient();
  const { data: existingRows, error: loadError } = await admin
    .from("admin_pack_items_view" as never)
    .select("id, name, description, quantity, unit_price, sort_order")
    .eq("pack_id" as never, packId as never);
  if (loadError) {
    console.error("[items] reconcile load failed:", loadError);
    return {
      ok: false,
      created: 0,
      updated: 0,
      deleted: 0,
      message: "Failed to load items.",
    };
  }

  const existingItems = (existingRows ?? []) as unknown as Pick<
    ItemRow,
    "id" | "name" | "description" | "quantity" | "unit_price" | "sort_order"
  >[];
  const remaining = new Map(
    existingItems.map((row) => [row.name.trim().toLowerCase(), row]),
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
      const product = await ensureMasterProduct(
        admin,
        {
          name: line.name,
          category: null,
          description: nextDescription || current.description,
          specification: null,
          visible: true,
          price: line.unit_price ?? null,
        },
        actor.user.id,
      );
      const { error } = await schoolPackItemsTable(admin)
        .update({
          product_id: product.id,
          pack_quantity: patch.quantity ?? 1,
          school_notes: patch.description ?? null,
          selling_price_override: patch.unit_price ?? null,
          sort_order: patch.sort_order ?? sortOrder,
          active: true,
        })
        .eq("id", current.id);
      if (error) {
        console.error("[items] reconcile update failed:", error);
      } else {
        updated += 1;
      }
      remaining.delete(key);
    } else {
      const product = await ensureMasterProduct(
        admin,
        {
          name: line.name,
          category: null,
          description: line.description || null,
          specification: null,
          visible: true,
          price: line.unit_price ?? null,
        },
        actor.user.id,
      );
      const { error } = await schoolPackItemsTable(admin).insert({
        pack_id: packId,
        product_id: product.id,
        pack_quantity: line.quantity,
        school_wording:
          line.name.trim() === product.name ? null : line.name.trim(),
        school_notes: line.description || null,
        selling_price_override: line.unit_price ?? null,
        sort_order: sortOrder,
        active: true,
      });
      if (error) {
        console.error("[items] reconcile insert failed:", error);
      } else {
        created += 1;
      }
    }
  }

  for (const row of remaining.values()) {
    const { error } = await schoolPackItemsTable(admin)
      .delete()
      .eq("id", row.id);
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

  await syncPackTotalPrice(packId);
  revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });

  return { ok: true, created, updated, deleted };
}

export async function listDistinctStationeryItems(): Promise<string[]> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("master_products")
      .select("name")
      .eq("active", true)
      .order("name", { ascending: true });

    if (!data) return [];
    return Array.from(
      new Set(data.map((item) => item.name.trim()).filter(Boolean)),
    ).sort();
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
export async function listStationeryInventory(
  query?: string,
): Promise<StationeryInventoryItem[]> {
  try {
    const admin = createSupabaseAdminClient();

    let dbQuery = admin
      .from("master_products")
      .select("id, name, description, current_selling_price")
      .eq("active", true)
      .order("name", { ascending: true })
      .order("created_at", { ascending: false });

    if (query) {
      const tokens = extractSearchTokens(query);
      if (tokens.length > 0) {
        const clauses = tokens.flatMap((t) => [
          `name.ilike.%${t}%`,
          `description.ilike.%${t}%`,
        ]);
        dbQuery = dbQuery.or(clauses.join(","));
      }
    }

    const { data } = await dbQuery.limit(500);
    if (!data) return [];

    const seen = new Set<string>();
    const out: StationeryInventoryItem[] = [];
    for (const row of data) {
      const name = row.name.trim();
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      out.push({
        id: row.id,
        name,
        description: row.description,
        unit_price: row.current_selling_price,
      });
      if (out.length >= 50) break;
    }
    return out;
  } catch (err) {
    console.error("[items] listStationeryInventory failed:", err);
    return [];
  }
}
