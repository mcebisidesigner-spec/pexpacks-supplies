import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSchoolBySlug as getSchoolRecordBySlug } from "@/data/schools";

function extractGradeName(title: string | null | undefined, slug: string | null | undefined): string {
  const safeTitle = title || "";
  const safeSlug = slug || "";
  const match = safeTitle.match(/Grade\s+([R\d]+)/i) || safeSlug.match(/grade-([r\d]+)/i);
  if (match) {
    return `Grade ${match[1].toUpperCase()}`;
  }
  const generalMatch = safeTitle.match(/(Grade\s+[\w-]+)/i);
  if (generalMatch) {
    return generalMatch[1];
  }
  return safeTitle || "Stationery Pack";
}

function extractGradeSlug(grade: string, slug: string | null | undefined): string {
  const safeSlug = slug || "";
  const slugMatch = safeSlug.match(/grade-[r\d]+/i);
  if (slugMatch) {
    return slugMatch[0].toLowerCase();
  }
  return grade.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function getSchoolBySlug(slug: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data: dbSchool } = await supabase
      .from("schools")
      .select("*")
      .eq("slug", slug)
      .single();

    if (dbSchool) {
      const staticRecord = await getSchoolRecordBySlug(slug);

      const { data: dbPacks } = await supabase
        .from("stationery_packs")
        .select("*")
        .eq("school_id", dbSchool.id)
        .eq("visible", true)
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

      let grades = staticRecord?.grades || [];

      if (dbPacks && dbPacks.length > 0) {
        const packIds = dbPacks.map((p) => p.id);
        const { data: dbItems } = await supabase
          .from("stationery_items")
          .select("*")
          .in("pack_id", packIds)
          .eq("visible", true)
          .order("sort_order", { ascending: true });

        const itemsByPack = new Map<string, Array<{ name: string; quantity: number }>>();
        for (const item of dbItems ?? []) {
          const list = itemsByPack.get(item.pack_id) ?? [];
          list.push(item);
          itemsByPack.set(item.pack_id, list);
        }

        grades = dbPacks.map((pack) => {
          const packItems = itemsByPack.get(pack.id) ?? [];
          const grade = extractGradeName(pack.title, pack.slug);
          const gradeSlug = extractGradeSlug(grade, pack.slug);
          const contents = packItems.map((i) =>
            i.quantity > 1 ? `${i.quantity}x ${i.name}` : i.name
          );

          return {
            id: pack.id,
            grade,
            gradeSlug,
            price: pack.price ?? 0,
            contents,
            deliveryNote: pack.description || "Prepared for delivery before school starts.",
            availability: (pack.stock ?? 1) > 0 ? "in-stock" : "pre-order",
          };
        });
      }

      return {
        id: dbSchool.id,
        name: dbSchool.name,
        slug: dbSchool.slug,
        city: dbSchool.city || staticRecord?.city || "",
        metro: dbSchool.district || staticRecord?.metro || "",
        province: dbSchool.province || staticRecord?.province || "",
        logo: dbSchool.logo ?? staticRecord?.logo ?? null,
        isPartnerSchool: dbSchool.is_partner ?? staticRecord?.isPartnerSchool ?? false,
        grades,
      };
    }
  } catch {
    // Fallback to static JSON if DB query fails or school is not in DB
  }

  return getSchoolRecordBySlug(slug);
}

export async function getGradeBySlug(schoolSlug: string, gradeSlug: string) {
  const school = await getSchoolBySlug(schoolSlug);

  if (!school) {
    return undefined;
  }

  return school.grades.find((grade) => grade.gradeSlug === gradeSlug);
}

/**
 * Looks up the matching admin-managed pack in the DB (pack slug follows the
 * `${schoolSlug}-${gradeSlug}` convention) and returns a map of item name to
 * description so the public grade pack can show descriptions. Falls back to an
 * empty map when no pack exists or the DB is unreachable.
 */
export async function getGradePackItemDescriptions(
  schoolSlug: string,
  gradeSlug: string
): Promise<Record<string, string>> {
  if (!schoolSlug || !gradeSlug) return {};

  try {
    const supabase = createSupabaseAdminClient();
    const { data: pack } = await supabase
      .from("stationery_packs")
      .select("id")
      .eq("slug", `${schoolSlug}-${gradeSlug}`)
      .maybeSingle();

    if (!pack) return {};

    const { data: items } = await supabase
      .from("stationery_items")
      .select("name, description")
      .eq("pack_id", pack.id)
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    const descriptions: Record<string, string> = {};
    for (const item of items ?? []) {
      const desc = (item.description ?? "").trim();
      if (desc && !descriptions[item.name]) {
        descriptions[item.name] = desc;
      }
    }
    return descriptions;
  } catch {
    return {};
  }
}

/**
 * Loads item descriptions for every grade pack of a school in one go. Returns a
 * map keyed by gradeSlug: `{ [gradeSlug]: { [itemName]: description } }`. Uses
 * the seeded `${schoolSlug}-${gradeSlug}` pack slug convention.
 */
export async function getSchoolGradeDescriptions(
  schoolSlug: string,
  gradeSlugs: string[]
): Promise<Record<string, Record<string, string>>> {
  const result: Record<string, Record<string, string>> = {};
  if (!schoolSlug || !gradeSlugs.length) return result;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: packs } = await supabase
      .from("stationery_packs")
      .select("id, slug")
      .in("slug", gradeSlugs.map((gradeSlug) => `${schoolSlug}-${gradeSlug}`));

    if (!packs || !packs.length) return result;

    const packIds = packs.map((pack) => pack.id);
    const { data: items } = await supabase
      .from("stationery_items")
      .select("pack_id, name, description")
      .in("pack_id", packIds)
      .eq("visible", true);

    const slugByPack = new Map(packs.map((pack) => [pack.id, pack.slug]));
    for (const item of items ?? []) {
      const packSlug = slugByPack.get(item.pack_id);
      if (!packSlug) continue;
      const gradeSlug = packSlug.startsWith(`${schoolSlug}-`)
        ? packSlug.slice(schoolSlug.length + 1)
        : null;
      if (!gradeSlug) continue;
      const description = (item.description ?? "").trim();
      if (!description) continue;
      const map = result[gradeSlug] ?? (result[gradeSlug] = {});
      if (!map[item.name]) map[item.name] = description;
    }
  } catch {
    // Fall back to no descriptions if the DB is unreachable.
  }

  return result;
}
