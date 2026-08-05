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
