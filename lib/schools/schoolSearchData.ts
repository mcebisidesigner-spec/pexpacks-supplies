import { getSchoolIndex } from "@/data/schools";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SchoolSearchIndex } from "./SearchIndex";
import { getFeaturedSchools } from "./getFeaturedSchools";
import { getGrades } from "./getGrades";
import { getRegions } from "./getRegions";
import { getSchoolPhasesFromGrades } from "./schoolPhase";
import type { SchoolSearchFilters, SchoolSearchRecord } from "./types";

function gradeRank(grade: string) {
  if (/grade\s*r/i.test(grade)) {
    return 0;
  }

  const number = Number(grade.match(/\d+/)?.[0]);
  return Number.isFinite(number) ? number : 99;
}

export async function getSearchableSchools(): Promise<SchoolSearchRecord[]> {
  const index = await getSchoolIndex();
  let dbSchoolMap = new Map();

  try {
    const supabase = createSupabaseAdminClient();
    const { data: dbSchools } = await supabase
      .from("schools")
      .select("id, slug, name, city, province, district, logo, is_partner, is_featured, lowest_price");

    if (dbSchools) {
      dbSchoolMap = new Map(dbSchools.map((s) => [s.slug, s]));
    }
  } catch {
    // Ignore DB fetch failure, fallback to JSON index
  }

  return index.map((school): SchoolSearchRecord => {
    const dbSchool = dbSchoolMap.get(school.slug);
    const schoolName = dbSchool?.name || school.name;
    const logoUrl = dbSchool?.logo || school.logo || "/images/school-logo-placeholder.svg";

    return {
      id: dbSchool?.id || school.id,
      name: schoolName,
      slug: dbSchool?.slug || school.slug,
      region: dbSchool?.city || school.city,
      city: dbSchool?.city || school.city,
      metro: dbSchool?.district || school.metro,
      province: dbSchool?.province || school.province,
      grades: school.grades
        .map((g) => g.grade)
        .sort((a, b) => gradeRank(a) - gradeRank(b)),
      phases: getSchoolPhasesFromGrades(
        school.grades.map((g) => g.grade),
        schoolName
      ),
      isFeatured: dbSchool ? Boolean(dbSchool.is_featured) : Boolean("isFeatured" in school && school.isFeatured),
      isPartner: dbSchool ? Boolean(dbSchool.is_partner) : school.isPartnerSchool,
      image: logoUrl,
      lowestPrice: dbSchool?.lowest_price ?? school.lowestPrice,
    };
  });
}

export async function getSearchIndex() {
  return new SchoolSearchIndex(await getSearchableSchools());
}

export async function getSchoolSearchOptions() {
  const schools = await getSearchableSchools();
  return {
    grades: getGrades(schools),
    regions: getRegions(schools),
  };
}

export async function getFeaturedSchoolRecords() {
  const schools = await getSearchableSchools();
  return getFeaturedSchools(schools, 4);
}

export async function searchSchoolRecords(
  filters: SchoolSearchFilters,
  limit = 12,
  offset = 0
) {
  const index = await getSearchIndex();
  return index.search(filters, limit, offset);
}
