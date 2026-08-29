import { unstable_cache } from "next/cache";
import type { GradePack, School, SchoolPackItem } from "@/data/schools";
import { getSchoolBySlug as getStaticSchoolBySlug } from "@/data/schools";
import { getGradeOrder } from "@/lib/grade-utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const SCHOOL_DATA_TAG = "school-data";
export const SCHOOL_DATA_REVALIDATE_SECONDS = 300;

type DbSchool = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  district: string | null;
  province: string | null;
  logo: string | null;
  is_partner: boolean | null;
  refused_partnership: boolean | null;
  partnership?: string | null;
  parent_collection_accepted?: boolean | null;
  principal?: string | null;
  website?: string | null;
};

type DbPackItem = {
  pack_id: string;
  name: string;
  quantity: number;
  unit_price: number | null;
  icon: string | null;
  description: string | null;
  specification: string | null;
};

type DbPack = {
  id: string;
  title: string;
  slug: string | null;
  price: number | null;
  description: string | null;
  stock: number | null;
  sort_order: number | null;
  items: DbPackItem[];
};

let aggregateRpcAvailable: boolean | undefined;

function isMissingRpc(error: { code?: string; message?: string } | null) {
  return Boolean(
    error &&
    (error.code === "PGRST202" ||
      error.message?.toLowerCase().includes("could not find the function")),
  );
}

function extractGradeName(title: string | null, slug: string | null): string {
  const match =
    (title ?? "").match(/Grade\s+([R\d]+)/i) ||
    (slug ?? "").match(/grade-([r\d]+)/i);
  if (match) return `Grade ${match[1].toUpperCase()}`;

  const generalMatch = (title ?? "").match(/(Grade\s+[\w-]+)/i);
  return generalMatch?.[1] || title || "Stationery Pack";
}

function extractGradeSlug(grade: string, slug: string | null): string {
  const slugMatch = (slug ?? "").match(/grade-[r\d]+/i);
  if (slugMatch) return slugMatch[0].toLowerCase();
  return grade
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toGradePacks(packs: DbPack[]): GradePack[] {
  return [...packs]
    .sort((a, b) => {
      const gradeOrder =
        getGradeOrder(`${a.title} ${a.slug ?? ""}`) -
        getGradeOrder(`${b.title} ${b.slug ?? ""}`);
      return gradeOrder || (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .map((pack) => {
      const grade = extractGradeName(pack.title, pack.slug);
      const packItems: SchoolPackItem[] = pack.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        icon: item.icon,
        description: item.description,
        specification: item.specification,
      }));

      return {
        id: pack.id,
        grade,
        gradeSlug: extractGradeSlug(grade, pack.slug),
        price: packItems.length === 0 ? 0 : (pack.price ?? 0),
        contents: packItems.map((item) =>
          item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name,
        ),
        packItems,
        deliveryNote:
          pack.description || "Prepared for delivery before school starts.",
        availability: (pack.stock ?? 1) > 0 ? "in-stock" : "pre-order",
      };
    });
}

function toSchool(school: DbSchool, packs: DbPack[]): School {
  return {
    id: school.id,
    name: school.name,
    slug: school.slug,
    city: school.city ?? "",
    district: school.district ?? "",
    metro: school.district ?? "",
    province: school.province ?? "",
    logo: school.logo,
    website: school.website || school.principal || null,
    isPartnerSchool: Boolean(school.is_partner) || school.partnership === "partner",
    refusedPartnership:
      Boolean(school.refused_partnership) ||
      school.partnership === "refused_partner",
    parentCollectionAccepted: school.parent_collection_accepted !== false,
    grades: toGradePacks(packs),
  };
}

function parseAggregatePayload(value: unknown): School | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as { school?: DbSchool; packs?: DbPack[] };
  if (!payload.school || !Array.isArray(payload.packs)) return null;
  return toSchool(payload.school, payload.packs);
}

async function getSchoolWithBoundedQueries(
  slug: string,
): Promise<School | undefined> {
  const supabase = createSupabaseAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = supabase
    .from("public_school_directory_view")
    .select(
      "id, name, slug, city, district, province, logo, is_partner, refused_partnership, partnership, parent_collection_accepted, principal",
    );

  if (isUuid) {
    query = query.eq("id", slug);
  } else {
    query = query.ilike("slug", slug);
  }

  const { data: dbSchool, error: schoolError } = await query.maybeSingle();

  if (schoolError) throw schoolError;
  if (!dbSchool) return getStaticSchoolBySlug(slug);

  const { data: dbPacks, error: packsError } = await supabase
    .from("school_packs")
    .select("id, title, slug, price, description, stock, sort_order")
    .or(`school_id.eq.${dbSchool.id},slug.ilike.${dbSchool.slug}-%`)
    .eq("visible", true)
    .or("publication_status.eq.published,and(publication_status.is.null,visible.eq.true)")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (packsError) throw packsError;
  if (!dbPacks?.length) {
    const staticSchool = await getStaticSchoolBySlug(slug);
    return staticSchool
      ? {
          ...staticSchool,
          ...toSchool(dbSchool, []),
          grades: staticSchool.grades,
        }
      : toSchool(dbSchool, []);
  }

  const packIds = dbPacks.map((pack) => pack.id);
  const { data: dbItems, error: itemsError } = await supabase
    .from("public_pack_items_view" as never)
    .select(
      "pack_id, name, quantity, unit_price, icon, description, specification",
    )
    .in("pack_id", packIds)
    .order("sort_order", { ascending: true });

  if (itemsError) throw itemsError;
  const itemsByPack = new Map<string, DbPackItem[]>();
  for (const item of (dbItems ?? []) as unknown as DbPackItem[]) {
    const items = itemsByPack.get(item.pack_id) ?? [];
    items.push(item);
    itemsByPack.set(item.pack_id, items);
  }

  return toSchool(
    dbSchool,
    dbPacks.map((pack) => ({ ...pack, items: itemsByPack.get(pack.id) ?? [] })),
  );
}

export async function getSchoolBySlug(
  slug: string,
): Promise<School | undefined> {
  try {
    const supabase = createSupabaseAdminClient();
    if (aggregateRpcAvailable !== false) {
      const { data, error } = await supabase.rpc("get_public_school_pack", {
        school_slug: slug,
      });

      if (!error) {
        aggregateRpcAvailable = true;
        const school = parseAggregatePayload(data);
        if (school) return school;
        if (data === null) return undefined;
      }
      if (isMissingRpc(error)) aggregateRpcAvailable = false;
    }

    return await getSchoolWithBoundedQueries(slug);
  } catch (error) {
    console.error("[school-utils] public school lookup failed:", error);
    return undefined;
  }
}

export async function getGradeBySlug(schoolSlug: string, gradeSlug: string) {
  const school = await getSchoolBySlug(schoolSlug);
  return school?.grades.find((grade) => grade.gradeSlug === gradeSlug);
}

export const getCachedSchoolBySlug = unstable_cache(
  async (slug: string) => getSchoolBySlug(slug) ?? null,
  ["public-school-by-slug-v2"],
  { revalidate: SCHOOL_DATA_REVALIDATE_SECONDS, tags: [SCHOOL_DATA_TAG] },
);
