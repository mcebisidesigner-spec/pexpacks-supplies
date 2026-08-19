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
import { SCHOOL_STATUSES, type SchoolStatus } from "@/lib/admin/school-constants";
import { revalidateCatalog } from "@/lib/admin/catalog-revalidate";
import { getAdminFilterOptions } from "@/lib/admin/filter-options";

export type SchoolRow = Database["public"]["Tables"]["schools"]["Row"];
export type { SchoolStatus };
export { SCHOOL_STATUSES };

const optString = (max: number, label: string) =>
  z
    .union([z.literal(""), z.string().trim().max(max, `${label} is too long`)])
    .transform((v) => (v === "" ? null : v));

const emailField = z
  .union([
    z.literal(""),
    z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
  ])
  .transform((v) => (v === "" ? null : v));

const numberField = (label: string) =>
  z
    .union([
      z.literal(""),
      z.string().trim().regex(/^-?\d+(\.\d{1,6})?$/, `Enter a valid ${label}`),
    ])
    .transform((v) => (v === "" ? null : Number(v)));

const priceField = z
  .union([
    z.literal(""),
    z.string().trim().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price"),
  ])
  .transform((v) => (v === "" ? null : Number(v)));

const dateField = z
  .union([
    z.literal(""),
    z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  ])
  .transform((v) => (v === "" ? null : v));

const gradesField = z
  .union([z.literal(""), z.string().trim().max(600)])
  .transform((v) =>
    v === ""
      ? null
      : v
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean)
  );

export const schoolSchema = z.object({
  name: z.string().trim().min(2, "Enter the school name").max(200, "Name is too long"),
  slug: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .toLowerCase()
        .max(200, "Slug is too long")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain a-z, 0-9 and dashes"),
    ])
    .transform((v) => (v === "" ? null : v)),
  city: optString(100, "city"),
  province: optString(100, "province"),
  district: optString(150, "district"),
  address: optString(300, "address"),
  email: emailField,
  telephone: optString(40, "telephone"),
  principal: optString(120, "principal"),
  parent_collection_accepted: z
    .enum(["accepted", "non_accepted"])
    .transform((value) => value === "accepted"),
  description: optString(5000, "description"),
  status: z.enum(SCHOOL_STATUSES).default("active"),
  published: z.boolean().default(true),
  is_partner: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  lowest_price: priceField,
  partner_since: dateField,
  latitude: numberField("latitude"),
  longitude: numberField("longitude"),
  grades: gradesField,
  logo: optString(2000, "logo URL"),
  custom_badge: optString(60, "custom badge"),
});

export type SchoolFormData = z.infer<typeof schoolSchema>;

export type ParsedSchoolForm =
  | { ok: true; data: SchoolFormData }
  | { ok: false; errors: Record<string, string> };

export type SchoolFormResult =
  | { ok: true; school: SchoolRow }
  | { ok: false; errors: Record<string, string>; message?: string };

export type SchoolFormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

function raw(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

export function parseSchoolForm(formData: FormData): ParsedSchoolForm {
  const parsed = schoolSchema.safeParse({
    name: raw(formData, "name"),
    slug: raw(formData, "slug"),
    city: raw(formData, "city"),
    province: raw(formData, "province"),
    district: raw(formData, "district"),
    address: raw(formData, "address"),
    email: raw(formData, "email"),
    telephone: raw(formData, "telephone"),
    principal: raw(formData, "principal"),
    parent_collection_accepted:
      raw(formData, "parent_collection_accepted") || "non_accepted",
    description: raw(formData, "description"),
    status: raw(formData, "status") || "active",
    published: formData.has("published"),
    is_partner: formData.has("is_partner"),
    is_featured: formData.has("is_featured"),
    lowest_price: raw(formData, "lowest_price"),
    partner_since: raw(formData, "partner_since"),
    latitude: raw(formData, "latitude"),
    longitude: raw(formData, "longitude"),
    grades: raw(formData, "grades"),
    logo: raw(formData, "logo"),
    custom_badge: raw(formData, "custom_badge"),
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

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 200) || "school"
  );
}

async function assertCan(
  permission: PermissionKey
): Promise<AdminSession> {
  const session = await getAdminUser();
  if (!session || !hasPermission(session, permission)) {
    const err = new Error("You don't have permission to do that.");
    (err as Error & { status?: number }).status = 403;
    throw err;
  }
  return session;
}

export interface SchoolListFilters {
  q?: string;
  city?: string;
  province?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export type SchoolListRow = SchoolRow & {
  has_orderable_grade_packs: boolean;
};

export interface SchoolListResult {
  schools: SchoolListRow[];
  total: number;
  page: number;
  pageCount: number;
  cities: string[];
  provinces: string[];
}

export async function listSchools(filters: SchoolListFilters = {}): Promise<SchoolListResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = admin
    .from("schools")
    .select("id,name,slug,city,province,logo,is_partner,is_featured,lowest_price,grades,district,address,email,telephone,principal,parent_collection_accepted,description,status,partner_since,latitude,longitude,published,search_vector,custom_badge,created_at,updated_at, stationery_packs(visible, stationery_items(id))", { count: "exact" });

  if (filters.q) {
    const q = filters.q.replace(/%/g, "").trim();
    if (q) {
      query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,province.ilike.%${q}%,slug.ilike.%${q}%`);
    }
  }
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.province) query = query.eq("province", filters.province);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, count, error } = await query
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("[schools] list failed:", error);
    return { schools: [], total: 0, page, pageCount: 0, cities: [], provinces: [] };
  }

  const [cities, provinces] = await Promise.all([
    listFilterColumn("city"),
    listFilterColumn("province"),
  ]);

  const schools = (data ?? []).map((row) => {
    const { stationery_packs: packs, ...school } = row;
    return {
      ...school,
      has_orderable_grade_packs: packs.some(
        (pack) => pack.visible && pack.stationery_items.length > 0
      ),
    };
  });

  return {
    schools,
    total: count ?? 0,
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    cities,
    provinces,
  };
}

async function listFilterColumn(column: "city" | "province"): Promise<string[]> {
  const cached = await getAdminFilterOptions();
  const key = column === "city" ? "school_cities" : "school_provinces";
  if (cached[key]?.length) return cached[key];

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("schools")
    .select(column)
    .not(column, "is", null);
  if (error || !data) return [];
  const rows = data as unknown as { [key: string]: string | null }[];
  return [...new Set(rows.map((r) => r[column]).filter((v): v is string => Boolean(v)))].sort();
}

export async function getSchool(idOrSlug: string): Promise<SchoolRow | null> {
  const admin = createSupabaseAdminClient();
  const decoded = decodeURIComponent(idOrSlug).trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded);

  let query = admin.from("schools").select("id,name,slug,city,province,logo,is_partner,is_featured,lowest_price,grades,district,address,email,telephone,principal,parent_collection_accepted,description,status,partner_since,latitude,longitude,published,search_vector,custom_badge,created_at,updated_at");

  if (isUuid) {
    query = query.eq("id", decoded);
  } else {
    const slugified = decoded.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    query = query.or(`slug.ilike.${decoded},slug.ilike.${slugified},name.ilike.${decoded}`);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    console.error("[schools] get failed:", error);
    return null;
  }
  return data;
}

async function ensureUniqueSlug(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  slug: string,
  excludeId?: string
): Promise<string> {
  let candidate = slug;
  let n = 1;
  while (true) {
    const { data } = await admin.from("schools").select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === excludeId) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

export async function createSchool(
  formData: FormData
): Promise<SchoolFormResult> {
  const actor = await assertCan("schools.create");
  const parsed = parseSchoolForm(formData);
  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors };
  }
  const admin = createSupabaseAdminClient();
  let data = parsed.data;

  try {
    const file = formData.get("logo_file");
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadSchoolLogo(file);
      data = { ...data, logo: uploaded.publicUrl };
    }

    const slug = await ensureUniqueSlug(admin, data.slug || slugify(data.name));
    const { data: created, error } = await admin
      .from("schools")
      .insert({
        ...data,
        slug,
        updated_by: actor.user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: false, errors: { slug: "A school with this slug already exists." } };
      }
      throw error;
    }

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "schools.create",
      entityType: "school",
      entityId: created.id,
      summary: `Created school "${created.name}"`,
    });

    revalidateCatalog({ schoolSlug: created.slug });

    return { ok: true, school: created };
  } catch (err) {
    console.error("[schools] create failed:", err);
    return { ok: false, errors: {}, message: "Failed to create school. Please try again." };
  }
}

export async function updateSchool(
  id: string,
  formData: FormData
): Promise<SchoolFormResult> {
  const actor = await assertCan("schools.edit");
  const parsed = parseSchoolForm(formData);
  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors };
  }
  const admin = createSupabaseAdminClient();

  const existing = await getSchool(id);
  if (!existing) return { ok: false, errors: {}, message: "School not found." };

  try {
    let data = parsed.data;

    const file = formData.get("logo_file");
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadSchoolLogo(file);
      data = { ...data, logo: uploaded.publicUrl };
    }

    let slug = data.slug;
    if (!slug) slug = existing.slug || slugify(data.name);
    slug = await ensureUniqueSlug(admin, slug, id);

    const { data: updated, error } = await admin
      .from("schools")
      .update({
        ...data,
        slug,
        updated_by: actor.user.id,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: false, errors: { slug: "A school with this slug already exists." } };
      }
      throw error;
    }

    void writeAuditLog({
      actorId: actor.user.id,
      actorName: actor.user.email,
      action: "schools.update",
      entityType: "school",
      entityId: updated.id,
      summary: `Updated school "${updated.name}"`,
    });

    revalidateCatalog({ schoolSlug: existing.slug });
    if (updated.slug && updated.slug !== existing.slug) {
      revalidateCatalog({ schoolSlug: updated.slug });
    }

    return { ok: true, school: updated };
  } catch (err) {
    console.error("[schools] update failed:", err);
    return { ok: false, errors: {}, message: "Failed to update school. Please try again." };
  }
}

export async function setSchoolStatus(
  id: string,
  status: SchoolStatus
): Promise<{ ok: boolean; message?: string }> {
  const permission: PermissionKey =
    status === "archived" ? "schools.archive" : status === "active" ? "schools.restore" : "schools.edit";
  const actor = await assertCan(permission);
  const admin = createSupabaseAdminClient();

  const { data: updated, error } = await admin
    .from("schools")
    .update({ status, updated_by: actor.user.id })
    .eq("id", id)
    .select("id, name, status, slug")
    .single();

  if (error) {
    console.error("[schools] status change failed:", error);
    return { ok: false, message: "Failed to update status." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: status === "archived" ? "schools.archive" : "schools.restore",
    entityType: "school",
    entityId: updated.id,
    summary:
      status === "archived"
        ? `Hid school "${updated.name}" from the public website`
        : `Made school "${updated.name}" visible on the public website`,
  });

  revalidateCatalog({ schoolSlug: updated.slug });

  return { ok: true };
}

export async function deleteSchool(id: string): Promise<{ ok: boolean; message?: string }> {
  const actor = await assertCan("schools.delete");
  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin.from("schools").select("id, name, slug").eq("id", id).single();
  if (!existing) return { ok: false, message: "School not found." };

  const { error } = await admin.from("schools").delete().eq("id", id);
  if (error) {
    console.error("[schools] delete failed:", error);
    if (error.code === "23503") {
      return { ok: false, message: "This school has related records and cannot be deleted. Hide it instead." };
    }
    return { ok: false, message: "Failed to delete school." };
  }

  void writeAuditLog({
    actorId: actor.user.id,
    actorName: actor.user.email,
    action: "schools.delete",
    entityType: "school",
    entityId: id,
    summary: `Deleted school "${existing.name}"`,
  });

  revalidateCatalog({ schoolSlug: existing.slug });

  return { ok: true };
}

const LOGO_MIME_TYPES = new Set([
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/jpeg",
]);
const MAX_LOGO_BYTES = 10 * 1024 * 1024;

export async function uploadSchoolLogo(file: File): Promise<{ publicUrl: string; path: string }> {
  if (!LOGO_MIME_TYPES.has(file.type)) {
    throw new Error("Logo must be a PNG, WebP, SVG or JPG image.");
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error("Logo exceeds the 10 MB limit.");
  }

  const ext = file.type === "image/svg+xml" ? "svg" : file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `logos/${crypto.randomUUID()}.${ext}`;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from("school-assets").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[schools] logo upload failed:", error);
    throw new Error("Failed to upload logo.");
  }

  const { data: urlData } = admin.storage.from("school-assets").getPublicUrl(data.path);

  // Track the asset in the media library.
  await admin.from("assets").upsert(
    {
      name: file.name,
      bucket: "school-assets",
      folder: "logos",
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

