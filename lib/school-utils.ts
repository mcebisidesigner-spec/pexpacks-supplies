import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSchoolBySlug as getSchoolRecordBySlug } from "@/data/schools";

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
      return {
        id: dbSchool.id,
        name: dbSchool.name,
        slug: dbSchool.slug,
        city: dbSchool.city || staticRecord?.city || "",
        metro: dbSchool.district || staticRecord?.metro || "",
        province: dbSchool.province || staticRecord?.province || "",
        logo: dbSchool.logo || staticRecord?.logo || "/images/school-logo-placeholder.svg",
        isPartnerSchool: dbSchool.is_partner ?? staticRecord?.isPartnerSchool ?? false,
        grades: staticRecord?.grades || [],
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
