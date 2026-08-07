import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import {
  getAdminUser,
  hasPermission,
  writeAuditLog,
  type PermissionKey,
  type AdminSession,
} from "@/lib/admin/rbac";
import { slugify } from "@/lib/slugify";
import { PACK_DELIVERY_TYPES } from "@/lib/admin/pack-constants";

export type PackRow = Database["public"]["Tables"]["stationery_packs"]["Row"];
export type ItemRow = Database["public"]["Tables"]["stationery_items"]["Row"];

export { PACK_DELIVERY_TYPES };

const optString = (max: number, label: string) =>
  z
    .union([z.literal(""), z.string().trim().max(max, `${label} is too long`)])
    .transform((v) => (v === "" ? null : v));

const moneyField = z.coerce
  .number()
  .min(0, "Price cannot be negative")
  .max(1_000_000, "Price is too large")
  .transform((v) => Math.round(v * 100) / 100);

const countField = z.coerce
  .number()
  .int("Must be a whole number")
  .min(0, "Cannot be negative")
  .max(1_000_000, "Value is too large");

const slugField = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .toLowerCase()
      .max(200, "Slug is too long")
      .regex(/^[a-z0-9-]+$/, "Slug can only contain a-z, 0-9 and dashes"),
  ])
  .transform((v) => (v === "" ? null : v));

export const packSchema = z.object({
  school_id: optString(64, "school"),
  title: z.string().trim().min(1, "Enter a pack title").max(200, "Title is too long"),
  slug: slugField,
  description: optString(4000, "description"),
  price: moneyField,
  stock: countField,
  featured: z.boolean().default(false),
  visible: z.boolean().default(false),
  academic_year: optString(20, "academic year"),
  delivery_type: z.string().trim().min(1, "Delivery type is required").max(60),
  pack_image: optString(2000, "image URL"),
  sort_order: countField,
});

export type PackFormData = z.infer<typeof packSchema>;

export type ParsedPackForm =
  | { ok: true; data: PackFormData }
  | { ok: false; errors: Record<string, string> };

export type PackFormResult =
  | { ok: true; pack: PackRow }
  | { ok: false; errors: Record<string, string>; message?: string };

export type PackFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export function parsePackForm(formData: FormData): ParsedPackForm {
  const parsed = packSchema.safeParse({
    school_id: raw(formData, "school_id"),
    title: raw(formData, "title"),
    slug: raw(formData, "slug"),
    description: raw(formData, "description"),
    price: raw(formData, "price") || "0",
    stock: raw(formData, "stock") || "0",
    featured: formData.has("featured"),
    visible: formData.has("visible"),
    academic_year: raw(formData, "academic_year"),
    delivery_type: raw(formData, "delivery_type") || "School collection",
    pack_image: raw(formData, "pack_image"),
    sort_order: raw(formData, "sort_order") || "0",
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

export interface PackListFilters {
  q?: string;
  school_id?: string;
  delivery_type?: string;
  featured?: string;
  visible?: string;
  page?: number;
  pageSize?: number;
}

export interface PackListItem extends PackRow {
  school_name: string | null;
  item_count: number;
}

export interface PackListResult {
  packs: PackListItem[];
  total: number;
  page: number;
  pageCount: number;
  schools: { id: string; name: string }[];
  deliveryTypes: string[];
}

export async function listPacks(filters: PackListFilters = {}): Promise<PackListResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("stationery_packs")
    .select(
      "id,title,slug,description,price,stock,featured,visible,academic_year,delivery_type,pack_image,sort_order,school_id,created_by,updated_by,created_at,updated_at,schools(name),stationery_items(count)",
      { count: "exact" }
    );

  if (filters.q) {
    const q = filters.q.replace(/%/g, "").trim();
    if (q) {
      query = query.or(`title.ilike.%${q}%,slug.ilike.%${q}%,description.ilike.%${q}%,academic_year.ilike.%${q}%`);
    }
  }
  if (filters.school_id) query = query.eq("school_id", filters.school_id);
  if (filters.delivery_type) query = query.eq("delivery_type", filters.delivery_type);
  if (filters.featured === "true") query = query.eq("featured", true);
  if (filters.featured === "false") query = query.eq("featured", false);
  if (filters.visible === "true") query = query.eq("visible", true);
  if (filters.visible === "false") query = query.eq("visible", false);

  const { data, count, error } = await query
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("[packs] list failed:", error);
    return { packs: [], total: 0, page, pageCount: 0, schools: [], deliveryTypes: [] };
  }

  const rows = (data ?? []) as (PackRow & {
    schools?: { name: string | null } | null;
    stationery_items?: { count: number }[] | null;
  })[];

  const [schools, deliveryTypes] = await Promise.all([
    listPackSchools(),
    listDeliveryTypes(),
  ]);

  return {
    packs: rows.map((row) => ({
      ...row,
      school_name: row.schools?.name ?? null,
      item_count: row.stationery_items?.[0]?.count ?? 0,
    })),
    total: count ?? 0,
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    schools,
    deliveryTypes,
  };
}

export interface SchoolGroupedSummary {
  school_id: string;
  school_name: string;
  school_slug: string;
  grade_packs_count: number;
  last_edited: string;
  visible: boolean;
}

export interface SchoolGroupedResult {
  schoolsSummary: SchoolGroupedSummary[];
  totalGradePacks: number;
  totalSchools: number;
  page: number;
  pageCount: number;
  schools: { id: string; name: string }[];
  deliveryTypes: string[];
}

export async function listSchoolGroupedSummary(
  filters: PackListFilters = {}
): Promise<SchoolGroupedResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));

  const [{ data: dbSchools }, { data: dbPacks, count: totalGradePacks }] = await Promise.all([
    admin.from("schools").select("id, name, slug, updated_at").order("name", { ascending: true }),
    admin.from("stationery_packs").select("id, school_id, visible, updated_at", { count: "exact" }),
  ]);

  const [allSchools, deliveryTypes] = await Promise.all([
    listPackSchools(),
    listDeliveryTypes(),
  ]);

  if (!dbSchools || !dbPacks) {
    return {
      schoolsSummary: [],
      totalGradePacks: 0,
      totalSchools: 0,
      page: 1,
      pageCount: 0,
      schools: allSchools,
      deliveryTypes,
    };
  }

  const qLower = (filters.q || "").toLowerCase().trim();

  let groupedList: SchoolGroupedSummary[] = dbSchools
    .map((s) => {
      const sPacks = dbPacks.filter((p) => p.school_id === s.id);
      if (sPacks.length === 0) return null;

      const isVisible = sPacks.some((p) => p.visible);
      const latestUpdate = sPacks.reduce(
        (max, p) => (p.updated_at && p.updated_at > max ? p.updated_at : max),
        s.updated_at || ""
      );

      return {
        school_id: s.id,
        school_name: s.name,
        school_slug: s.slug,
        grade_packs_count: sPacks.length,
        last_edited: latestUpdate,
        visible: isVisible,
      };
    })
    .filter(Boolean) as SchoolGroupedSummary[];

  if (qLower) {
    groupedList = groupedList.filter((s) =>
      s.school_name.toLowerCase().includes(qLower) || s.school_slug.toLowerCase().includes(qLower)
    );
  }

  if (filters.visible === "true") {
    groupedList = groupedList.filter((s) => s.visible);
  } else if (filters.visible === "false") {
    groupedList = groupedList.filter((s) => !s.visible);
  }

  const totalSchools = groupedList.length;
  const pageCount = Math.max(1, Math.ceil(totalSchools / pageSize));
  const from = (page - 1) * pageSize;
  const paginatedList = groupedList.slice(from, from + pageSize);

  return {
    schoolsSummary: paginatedList,
    totalGradePacks: totalGradePacks ?? dbPacks.length,
    totalSchools,
    page,
    pageCount,
    schools: allSchools,
    deliveryTypes,
  };
}

export interface PackSchool {
  id: string;
  name: string;
  slug: string;
}

export async function listPackSchools(): Promise<PackSchool[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("schools")
    .select("id, name, slug")
    .order("name", { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function listPacksForFilter(): Promise<{ id: string; title: string }[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("stationery_packs")
    .select("id, title")
    .order("title", { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function nextSortOrder(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  schoolId: string | null
): Promise<number> {
  if (!schoolId) return 0;
  const { data } = await admin
    .from("stationery_packs")
    .select("sort_order")
    .eq("school_id", schoolId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const max = data?.[0]?.sort_order ?? 0;
  return max + 1;
}

async function listDeliveryTypes(): Promise<string[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("stationery_packs").select("delivery_type");
  if (error || !data) return [];
  const values = [...new Set(data.map((r) => r.delivery_type).filter(Boolean))].sort();
  for (const preset of PACK_DELIVERY_TYPES) {
    if (!values.includes(preset)) values.push(preset);
  }
  return values;
}

export async function getPack(id: string): Promise<{ pack: PackRow | null; items: ItemRow[] }> {
  const admin = createSupabaseAdminClient();
  const { data: pack, error } = await admin.from("stationery_packs").select("*").eq("id", id).maybeSingle();
  if (error || !pack) return { pack: null, items: [] };

  const { data: items, error: itemsError } = await admin
    .from("stationery_items")
    .select("*")
    .eq("pack_id", id)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (itemsError) console.error("[packs] items load failed:", itemsError);

  return { pack, items: items ?? [] };
}

async function ensureUniqueSlug(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  slug: string,
  excludeId?: string
): Promise<string> {
  let candidate = slug;
  let n = 1;
  while (true) {
    const { data } = await admin
      .from("stationery_packs")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

const createPackSchema = z.object({
  school_id: z.string().min(1, "Choose a school"),
  grade: z
    .string()
    .trim()
    .min(1, "Enter a grade, e.g. Grade 10 or R")
    .max(30, "Grade is too long"),
  featured: z.boolean().default(false),
  visible: z.boolean().default(false),
});

type CreatePackFormData = z.infer<typeof createPackSchema>;

/**
 * Turns a user-entered grade ("Grade 10", "10", "GRADE R", "R") into the
 * `${schoolSlug}-grade-<r|n>` slug segment used by the public grade pages.
 */
function gradeToSlug(grade: string): string {
  const cleaned = grade.trim().toLowerCase();
  const match = cleaned.match(/grade\s*([r\d]+)/);
  if (match) return `grade-${match[1]}`;
  const bare = cleaned.match(/^([r\d]+)$/);
  if (bare) return `grade-${bare[1]}`;
  return "grade";
}

export async function createPack(formData: FormData): Promise<PackFormResult> {
  const actor = await assertCan("packs.create");

  const parsed = createPackSchema.safeParse({
    school_id: raw(formData, "school_id"),
    grade: raw(formData, "grade"),
    featured: formData.has("featured"),
    visible: formData.has("visible"),
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  const admin = createSupabaseAdminClient();
  const { data: school } = await admin
    .from("schools")
    .select("id, name, slug")
    .eq("id", parsed.data.school_id)
    .maybeSingle();
  if (!school) {
    return { ok: false, errors: { school_id: "Choose a school." } };
  }

  try {
    const data: CreatePackFormData = parsed.data;
    const grade = data.grade.trim();
    const title = `${school.name} ${grade} Pack`;
    const slug = await ensureUniqueSlug(admin, `${school.slug}-${gradeToSlug(grade)}`);
    const sort_order = await nextSortOrder(admin, school.id);

    const { data: created, error } = await admin
      .from("stationery_packs")
      .insert({
        school_id: school.id,
        title,
        slug,
        description: null,
        price: 0,
        stock: 1,
        featured: data.featured,
        visible: data.visible,
        academic_year: null,
        delivery_type: PACK_DELIVERY_TYPES[0],
        pack_image: null,
        sort_order,
        created_by: actor.user.id,
        updated_by: actor.user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return {
          ok: false,
          errors: { school_id: "A pack for this school and grade already exists." },
        };
      }
      throw error;
    }

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "packs.create",
      entityType: "pack",
      entityId: created.id,
      summary: `Created pack "${created.title}"`,
    });

    return { ok: true, pack: created };
  } catch (err) {
    console.error("[packs] create failed:", err);
    return { ok: false, errors: {}, message: "Failed to create pack. Please try again." };
  }
}

export async function updatePack(id: string, formData: FormData): Promise<PackFormResult> {
  const actor = await assertCan("packs.edit");
  const parsed = parsePackForm(formData);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const admin = createSupabaseAdminClient();
  const existing = await admin.from("stationery_packs").select("id, slug").eq("id", id).maybeSingle();
  if (existing.error || !existing.data) {
    return { ok: false, errors: {}, message: "Pack not found." };
  }

  try {
    let data = parsed.data;

    const file = formData.get("pack_image_file");
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadPackImage(file);
      data = { ...data, pack_image: uploaded.publicUrl };
    }

    let slug = data.slug;
    if (!slug) slug = existing.data.slug || slugify(data.title) || "pack";
    slug = await ensureUniqueSlug(admin, slug, id);

    const { data: updated, error } = await admin
      .from("stationery_packs")
      .update({ ...data, slug, updated_by: actor.user.id })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: false, errors: { slug: "A pack with this slug already exists." } };
      }
      throw error;
    }

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "packs.edit",
      entityType: "pack",
      entityId: updated.id,
      summary: `Updated pack "${updated.title}"`,
    });

    return { ok: true, pack: updated };
  } catch (err) {
    console.error("[packs] update failed:", err);
    return { ok: false, errors: {}, message: "Failed to update pack. Please try again." };
  }
}

export async function updatePackPrice(
  id: string,
  price: number
): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("packs.edit");
  const admin = createSupabaseAdminClient();

  const parsed = moneyField.safeParse(price);
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid price." };
  }

  const { data: existing } = await admin
    .from("stationery_packs")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, message: "Pack not found." };

  const { error } = await admin
    .from("stationery_packs")
    .update({ price: parsed.data, updated_by: actor.user.id })
    .eq("id", id);
  if (error) {
    console.error("[packs] price update failed:", error);
    return { ok: false, message: "Failed to update price." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "packs.edit",
    entityType: "pack",
    entityId: id,
    summary: `Updated price for pack "${existing.title}"`,
  });

  return { ok: true };
}

export async function setPackVisible(
  id: string,
  visible: boolean
): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("packs.edit");
  const admin = createSupabaseAdminClient();

  const { data: updated, error } = await admin
    .from("stationery_packs")
    .update({ visible, updated_by: actor.user.id })
    .eq("id", id)
    .select("id, title, visible")
    .single();

  if (error) {
    console.error("[packs] visibility change failed:", error);
    return { ok: false, message: "Failed to update visibility." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "packs.edit",
    entityType: "pack",
    entityId: updated.id,
    summary: `Set pack "${updated.title}" visibility to ${updated.visible ? "visible" : "hidden"}`,
  });

  return { ok: true };
}

export async function duplicatePack(id: string): Promise<{ ok: boolean; message?: string; packId?: string }> {
  const actor = await assertCan("packs.duplicate");
  const admin = createSupabaseAdminClient();

  const { data: source, error } = await admin.from("stationery_packs").select("*").eq("id", id).maybeSingle();
  if (error || !source) return { ok: false, message: "Pack not found." };

  const { data: sourceItems } = await admin.from("stationery_items").select("*").eq("pack_id", id);

  try {
    const baseSlug = slugify(source.title) || "pack";
    const slug = await ensureUniqueSlug(admin, baseSlug);
    const { data: copy, error: copyError } = await admin
      .from("stationery_packs")
      .insert({
        school_id: source.school_id,
        title: `${source.title} (Copy)`,
        slug,
        description: source.description,
        price: source.price,
        stock: source.stock,
        featured: false,
        visible: false,
        academic_year: source.academic_year,
        delivery_type: source.delivery_type,
        pack_image: source.pack_image,
        sort_order: source.sort_order + 1,
        created_by: actor.user.id,
        updated_by: actor.user.id,
      })
      .select()
      .single();
    if (copyError) throw copyError;

    if (sourceItems && sourceItems.length > 0) {
      const { error: itemsError } = await admin.from("stationery_items").insert(
        sourceItems.map((item) => ({
          pack_id: copy.id,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          image: item.image,
          icon: item.icon,
          visible: item.visible,
          sort_order: item.sort_order,
          created_by: actor.user.id,
        }))
      );
      if (itemsError) throw itemsError;
    }

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "packs.duplicate",
      entityType: "pack",
      entityId: copy.id,
      summary: `Duplicated pack "${source.title}"`,
    });

    return { ok: true, packId: copy.id };
  } catch (err) {
    console.error("[packs] duplicate failed:", err);
    return { ok: false, message: "Failed to duplicate pack." };
  }
}

export async function deletePack(id: string): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("packs.delete");
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin.from("stationery_packs").select("id, title").eq("id", id).single();
  if (!existing) return { ok: false, message: "Pack not found." };

  const { error } = await admin.from("stationery_packs").delete().eq("id", id);
  if (error) {
    console.error("[packs] delete failed:", error);
    if (error.code === "23503") {
      return { ok: false, message: "This pack has related records and cannot be deleted." };
    }
    return { ok: false, message: "Failed to delete pack." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "packs.delete",
    entityType: "pack",
    entityId: id,
    summary: `Deleted pack "${existing.title}"`,
  });

  return { ok: true };
}

/**
 * Maps a pack to its public grade pack page path (`/schools/<schoolSlug>/<gradeSlug>`)
 * using the seeded `${schoolSlug}-${gradeSlug}` pack slug convention. Returns null
 * when the pack or its school can't be resolved, or the slug doesn't follow the
 * convention (e.g. a duplicated/custom pack).
 */
export async function getPublicGradePackPath(packId: string): Promise<string | null> {
  try {
    const admin = createSupabaseAdminClient();
    const { data: pack } = await admin
      .from("stationery_packs")
      .select("slug, school_id")
      .eq("id", packId)
      .maybeSingle();
    if (!pack || !pack.slug || !pack.school_id) return null;

    const { data: school } = await admin
      .from("schools")
      .select("slug")
      .eq("id", pack.school_id)
      .maybeSingle();
    if (!school?.slug) return null;

    const gradeSlug = pack.slug.startsWith(`${school.slug}-grade-`)
      ? pack.slug.slice(school.slug.length + 1)
      : null;
    if (!gradeSlug || !/^grade-(r|[0-9]{1,2})$/i.test(gradeSlug)) return null;

    return `/schools/${school.slug}/${gradeSlug}`;
  } catch {
    return null;
  }
}

const IMAGE_MIME_TYPES = new Set(["image/png", "image/webp", "image/svg+xml", "image/jpeg"]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function uploadPackImage(file: File): Promise<{ publicUrl: string; path: string }> {
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    throw new Error("Image must be a PNG, WebP, SVG or JPG image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image exceeds the 10 MB limit.");
  }

  const ext =
    file.type === "image/svg+xml" ? "svg" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `packs/${crypto.randomUUID()}.${ext}`;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("school-assets").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[packs] image upload failed:", error);
    throw new Error("Failed to upload image.");
  }

  const { data: urlData } = admin.storage.from("school-assets").getPublicUrl(data.path);

  await admin.from("assets").upsert(
    {
      name: file.name,
      bucket: "school-assets",
      folder: "packs",
      path: data.path,
      public_url: urlData.publicUrl,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: (await getAdminUser())?.user.id ?? null,
    },
    { onConflict: "path" }
  );

  return { publicUrl: urlData.publicUrl, path: data.path };
}
