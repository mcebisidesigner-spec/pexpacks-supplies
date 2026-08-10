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

const SEARCH_DATA_TTL_MS = 5 * 60 * 1000; // 5 minutes

let searchableSchoolsCache: {
  promise: Promise<SchoolSearchRecord[]>;
  expiresAt: number;
} | null = null;

let searchIndexCache: {
  promise: Promise<SchoolSearchIndex>;
  expiresAt: number;
} | null = null;

/**
 * Drops the in-memory search caches so the next call re-reads schools from the
 * database. Called by admin server actions after school/pack mutations.
 */
export function invalidateSchoolSearchCache() {
  searchableSchoolsCache = null;
  searchIndexCache = null;
}

export async function getSearchableSchools(): Promise<SchoolSearchRecord[]> {
  const now = Date.now();
  if (searchableSchoolsCache && searchableSchoolsCache.expiresAt > now) {
    return searchableSchoolsCache.promise;
  }

  const promise = loadSearchableSchools();
  searchableSchoolsCache = {
    promise,
    expiresAt: now + SEARCH_DATA_TTL_MS,
  };

  try {
    return await promise;
  } catch (error) {
    searchableSchoolsCache = null;
    throw error;
  }
}

async function loadSearchableSchools(): Promise<SchoolSearchRecord[]> {
  const started = Date.now();
  const index = await getSchoolIndex();
  let dbSchoolMap = new Map();

  try {
    const supabase = createSupabaseAdminClient();
    let dbSchools: Array<{
      id: string;
      slug: string;
      name: string;
      city: string | null;
      province: string | null;
      district: string | null;
      logo: string | null;
      is_partner: boolean | null;
      is_featured: boolean | null;
      lowest_price: number | null;
      custom_badge: string | null;
    }> = [];
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
      const { data: page, error } = await supabase
        .from("schools")
        .select("id, slug, name, city, province, district, logo, is_partner, is_featured, lowest_price, custom_badge")
        .range(from, from + PAGE_SIZE - 1);

      if (error || !page || page.length === 0) break;
      dbSchools = dbSchools.concat(page);
      if (page.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    if (dbSchools.length > 0) {
      dbSchoolMap = new Map(dbSchools.map((s) => [s.slug, s]));
    }
  } catch {
    // Ignore DB fetch failure, fallback to JSON index
  }

  const records = index.map((school): SchoolSearchRecord => {
    const dbSchool = dbSchoolMap.get(school.slug);
    const schoolName = dbSchool?.name || school.name;
    const logoUrl = dbSchool?.logo ?? school.logo ?? null;

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
      customBadge: dbSchool?.custom_badge || "2026 Packs",
      lowestPrice: dbSchool?.lowest_price ?? school.lowestPrice,
    };
  });

  console.info(
    `[performance] searchable schools loaded in ${Date.now() - started}ms`
  );
  return records;
}

export async function getSearchIndex() {
  const now = Date.now();
  if (searchIndexCache && searchIndexCache.expiresAt > now) {
    return searchIndexCache.promise;
  }

  const promise = getSearchableSchools().then(
    (schools) => new SchoolSearchIndex(schools)
  );
  searchIndexCache = {
    promise,
    expiresAt: now + SEARCH_DATA_TTL_MS,
  };

  try {
    const index = await promise;
    console.info(
      `[performance] search index ready in ${Date.now() - now}ms`
    );
    return index;
  } catch (error) {
    searchIndexCache = null;
    throw error;
  }
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
