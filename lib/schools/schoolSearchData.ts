import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";
import type { Json } from "@/lib/supabase/types";
import { getSchoolPhasesFromGrades } from "./schoolPhase";
import type { SchoolSearchFilters, SchoolSearchRecord } from "./types";
import { getSchoolIndex } from "@/data/schools";

type SearchSchoolRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  district: string | null;
  province: string | null;
  logo: string | null;
  is_partner: boolean | null;
  is_featured: boolean | null;
  partnership?: string | null;
  lowest_price: number | null;
  grades: Json | null;
  custom_badge: string | null;
  latitude?: number | null;
  longitude?: number | null;
  canonical_pack_item_count?: number | string | null;
  total_count?: number | string | null;
};

function gradeRank(grade: string) {
  if (/grade\s*r/i.test(grade)) return 0;
  const number = Number(grade.match(/\d+/)?.[0]);
  return Number.isFinite(number) ? number : 99;
}

function getGradeLabels(value: Json | null, schoolName?: string): string[] {
  let labels: string[] = [];
  if (Array.isArray(value)) {
    labels = value
      .map((grade) => {
        if (typeof grade === "string") return grade;
        if (grade && typeof grade === "object" && !Array.isArray(grade)) {
          const label = grade.grade;
          return typeof label === "string" ? label : "";
        }
        return "";
      })
      .filter(Boolean)
      .sort((a, b) => gradeRank(a) - gradeRank(b));
  }

  if (labels.length > 0) return labels;

  if (schoolName) {
    const isHigh =
      /high|hoerskool|secondary|college|academy/i.test(schoolName) &&
      !/primary/i.test(schoolName);
    const isPrimary =
      /primary|laerskool|preparatory|pre-primary/i.test(schoolName) &&
      !/high|hoerskool/i.test(schoolName);

    if (isHigh)
      return ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    if (isPrimary)
      return [
        "Grade R",
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
      ];
  }

  return [
    "Grade R",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ];
}

function toSearchRecord(row: SearchSchoolRow): SchoolSearchRecord {
  const grades = getGradeLabels(row.grades, row.name);
  const city = row.city ?? "";
  const itemCount = Number(row.canonical_pack_item_count ?? 0);
  const hasPacks =
    itemCount > 0 || (row.lowest_price != null && row.lowest_price > 0);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    region: city,
    city,
    metro: row.district ?? "",
    province: row.province ?? "",
    grades,
    phases: getSchoolPhasesFromGrades(grades, row.name),
    isFeatured: Boolean(row.is_featured),
    isPartner:
      row.partnership != null
        ? row.partnership === "partner"
        : Boolean(row.is_partner),
    hasOrderablePacks: hasPacks,
    image: row.logo,
    customBadge: row.custom_badge || null,
    lowestPrice: row.lowest_price ?? undefined,
  };
}

export async function getNearbySchoolRecords(
  userLat: number,
  userLng: number,
  limit = 8,
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc(
    "get_public_nearby_schools" as never,
    {
      user_lat: userLat,
      user_lng: userLng,
      result_limit: Math.min(Math.max(limit, 1), 24),
    } as never,
  );

  if (error) {
    console.error("[schoolSearchData] nearby school RPC failed:", error);
    return getFeaturedSchoolRecords(limit);
  }

  const rows = ((data as unknown as SearchSchoolRow[] | null) ?? []).filter(
    (school) => school.latitude != null && school.longitude != null,
  );
  if (rows.length === 0) return getFeaturedSchoolRecords(limit);
  return rows.map(toSearchRecord);
}

async function loadFeaturedSchoolRecords(limit = 4) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc(
    "get_public_featured_schools" as never,
    {
      limit_count: Math.min(Math.max(limit * 2, 1), 24),
    } as never,
  );

  if (error) {
    console.error("[schoolSearchData] featured school RPC failed:", error);
    return [];
  }

  let schools = ((data as unknown as SearchSchoolRow[] | null) ?? []).map(
    toSearchRecord,
  );

  if (schools.length > limit) {
    const daySeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const offset = (daySeed * limit) % schools.length;
    schools = [...schools.slice(offset), ...schools.slice(0, offset)].slice(
      0,
      limit,
    );
  }

  return schools.slice(0, limit);
}

export const getFeaturedSchoolRecords = unstable_cache(
  async (limit = 4) => loadFeaturedSchoolRecords(limit),
  ["public-featured-schools-v2"],
  { revalidate: 300, tags: [SCHOOL_DATA_TAG, "featured-schools"] },
);

/**
 * Retrieves every visible public school (lightweight search records) for the
 * "browse all schools" directory. Loads all 3,342 indexed schools, enriched with
 * any active database projection.
 */
export const getAllPublicSchoolRecords = unstable_cache(
  async (): Promise<SchoolSearchRecord[]> => {
    const allIndexSchools = await getSchoolIndex();

    const supabase = createSupabaseAdminClient();
    const dbMap = new Map<string, SearchSchoolRow>();
    try {
      const { data } = await supabase.rpc("search_public_schools", {
        search_query: "",
        grade_filter: "",
        phase_filter: "",
        region_filter: "",
        result_limit: 1000,
        result_offset: 0,
      } as never);

      if (data && Array.isArray(data)) {
        for (const row of data as SearchSchoolRow[]) {
          if (row.slug) dbMap.set(row.slug, row);
        }
      }
    } catch {
      // Fallback directly to static index
    }

    return allIndexSchools
      .map((item) => {
        const dbRow = dbMap.get(item.slug);
        const grades = (item.grades || []).map((g) => g.grade);
        const city = item.city || "";
        const isPartner =
          dbRow?.is_partner != null
            ? Boolean(dbRow.is_partner)
            : item.isPartnerSchool;
        const isFeatured =
          dbRow?.is_featured != null
            ? Boolean(dbRow.is_featured)
            : Boolean(item.isFeatured);
        const lowestPrice =
          dbRow?.lowest_price != null ? dbRow.lowest_price : item.lowestPrice;

        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          region: city,
          city,
          metro: item.metro || "",
          province: item.province || "",
          grades,
          phases: getSchoolPhasesFromGrades(grades, item.name),
          isFeatured,
          isPartner,
          hasOrderablePacks:
            isPartner || (lowestPrice != null && lowestPrice > 0),
          image: dbRow?.logo || item.logo || null,
          customBadge: dbRow?.custom_badge || item.customBadge || null,
          lowestPrice: lowestPrice ?? undefined,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  ["public-all-schools-full-3342-v1"],
  { revalidate: 300, tags: [SCHOOL_DATA_TAG, "all-schools"] },
);

export async function searchSchoolRecords(
  filters: SchoolSearchFilters,
  limit = 12,
  offset = 0,
) {
  const safeLimit = Math.min(Math.max(limit, 1), 24);
  const safeOffset = Math.max(offset, 0);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("search_public_schools", {
    search_query: filters.query?.trim() ?? "",
    grade_filter: filters.grade?.trim() ?? "",
    phase_filter: filters.phase ?? "",
    region_filter: filters.region?.trim() ?? "",
    result_limit: safeLimit,
    result_offset: safeOffset,
  });

  const rows = (data as unknown as SearchSchoolRow[] | null) ?? [];

  if (error || rows.length === 0) {
    const all = await getSchoolIndex();
    const q = (filters.query || "").trim().toLowerCase();
    const region = (filters.region || "").trim().toLowerCase();
    let matches = all;
    if (q) {
      matches = matches.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.city || "").toLowerCase().includes(q) ||
          (s.metro || "").toLowerCase().includes(q) ||
          (s.province || "").toLowerCase().includes(q),
      );
    }
    if (region) {
      matches = matches.filter(
        (s) => (s.city || "").toLowerCase() === region,
      );
    }
    const totalCount = matches.length;
    const paged = matches.slice(safeOffset, safeOffset + safeLimit);
    return {
      results: paged.map((item) => {
        const grades = (item.grades || []).map((g) => g.grade);
        const city = item.city || "";
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          region: city,
          city,
          metro: item.metro || "",
          province: item.province || "",
          grades,
          phases: getSchoolPhasesFromGrades(grades, item.name),
          isFeatured: Boolean(item.isFeatured),
          isPartner: Boolean(item.isPartnerSchool),
          hasOrderablePacks:
            Boolean(item.isPartnerSchool) ||
            (item.lowestPrice != null && item.lowestPrice > 0),
          image: item.logo || null,
          customBadge: item.customBadge || null,
          lowestPrice: item.lowestPrice ?? undefined,
        };
      }),
      total: totalCount,
      hasMore: safeOffset + safeLimit < totalCount,
    };
  }

  const total = Number(rows[0]?.total_count ?? rows.length);

  return {
    results: rows.map(toSearchRecord),
    total,
    hasMore: safeOffset + rows.length < total,
  };
}
