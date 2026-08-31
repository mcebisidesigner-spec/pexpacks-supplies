import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";
import type { Json } from "@/lib/supabase/types";
import { getSchoolPhasesFromGrades } from "./schoolPhase";
import type { SchoolSearchFilters, SchoolSearchRecord } from "./types";

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
  canonical_pack_item_count?: number;
  total_count?: number;
};

let publicSchoolReadRpcsAvailable: boolean | undefined;

function isMissingRpc(error: { code?: string; message?: string } | null) {
  return Boolean(
    error &&
      (error.code === "PGRST202" ||
        error.message?.toLowerCase().includes("could not find the function")),
  );
}

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
    const isHigh = /high|hoërskool|secondary|college|academy/i.test(schoolName) && !/primary/i.test(schoolName);
    const isPrimary = /primary|laerskool|preparatory|pre-primary/i.test(schoolName) && !/high|hoërskool/i.test(schoolName);

    if (isHigh) {
      return ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
    }
    if (isPrimary) {
      return ["Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
    }
  }

  return [
    "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7",
    "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ];
}

function toSearchRecord(row: SearchSchoolRow): SchoolSearchRecord {
  const grades = getGradeLabels(row.grades, row.name);
  const city = row.city ?? "";

  const hasPacks =
    Number(row.canonical_pack_item_count ?? 0) > 0 ||
    (row.lowest_price != null && row.lowest_price > 0);

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
    hasOrderablePacks: Boolean(hasPacks),
    image: row.logo,
    customBadge: row.custom_badge || null,
    lowestPrice: row.lowest_price ?? undefined,
  };
}

function safeFilterValue(value: string) {
  return value.replace(/[(),]/g, " ").trim();
}

const PHASE_GRADE_FILTERS: Record<string, string[]> = {
  "primary-schools": [
    "Grade R",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
  ],
  "high-schools": ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
};

async function withCanonicalPackCounts(rows: SearchSchoolRow[]): Promise<SearchSchoolRow[]> {
  if (rows.length === 0) return rows;
  const schoolIds = rows.map((row) => row.id);
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("pack_subtotals" as never)
    .select("school_id,item_count")
    .in("school_id" as never, schoolIds as never);

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as unknown as { school_id: string; item_count: number | null }[]) {
    counts.set(row.school_id, (counts.get(row.school_id) ?? 0) + Number(row.item_count ?? 0));
  }
  return rows.map((row) => ({
    ...row,
    canonical_pack_item_count: counts.get(row.id) ?? 0,
  }));
}

async function searchPublicSchoolsFallback(
  filters: SchoolSearchFilters,
  limit: number,
  offset: number,
) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("public_school_directory_view")
    .select(
      "id, name, slug, city, district, province, logo, is_partner, is_featured, lowest_price, grades, custom_badge, partnership",
      { count: "exact" },
    );

  const search = filters.query?.trim();
  if (search) {
    const q = safeFilterValue(search);
    query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%,district.ilike.%${q}%,province.ilike.%${q}%`);
  }

  if (filters.grade?.trim()) {
    query = query.contains("grades", [{ grade: filters.grade.trim() }]);
  }

  if (filters.region?.trim()) {
    const region = safeFilterValue(filters.region);
    query = query.or(
      `city.ilike.${region},district.ilike.${region},province.ilike.${region}`,
    );
  }

  const phaseGrades = filters.phase ? PHASE_GRADE_FILTERS[filters.phase] : undefined;
  if (phaseGrades) {
    query = query.or(
      phaseGrades
        .map((grade) => `grades.cs.[{"grade":"${grade}"}]`)
        .join(","),
    );
  } else if (filters.phase === "pre-schools") {
    query = query.or(
      "name.ilike.%creche%,name.ilike.%pre-school%,name.ilike.%preschool%,name.ilike.%nursery%,name.ilike.%early childhood%,name.ilike.%kindergarten%",
    );
  }

  const { data, error, count } = await query
    .order("is_featured", { ascending: false })
    .order("is_partner", { ascending: false })
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    rows: await withCanonicalPackCounts((data ?? []) as SearchSchoolRow[]),
    total: count ?? 0,
  };
}


export async function getNearbySchoolRecords(userLat: number, userLng: number, limit = 8) {
  const supabase = createSupabaseAdminClient();
  const { data: schools } = await supabase
    .from("public_school_directory_view")
    .select(
      "id, name, slug, city, district, province, logo, is_partner, is_featured, lowest_price, grades, custom_badge, latitude, longitude, partnership"
    )
    .in("partnership", ["partner", "non_partner"])
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  if (!schools || schools.length === 0) {
    return getFeaturedSchoolRecords(limit);
  }

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const scored = schools
    .map((school) => {
      const lat = Number(school.latitude);
      const lng = Number(school.longitude);
      if (isNaN(lat) || isNaN(lng)) return null;
      const distance = calculateDistanceKm(userLat, userLng, lat, lng);
      return { school, distance };
    })
    .filter((item): item is { school: typeof schools[0]; distance: number } => item !== null)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  if (scored.length === 0) {
    return getFeaturedSchoolRecords(limit);
  }

  const counted = await withCanonicalPackCounts(scored.map((item) => item.school as unknown as SearchSchoolRow));
  return counted.map(toSearchRecord);
}

async function loadFeaturedSchoolRecords(limit = 4) {
  const supabase = createSupabaseAdminClient();

  const { data: featuredData } = await supabase
    .from("public_school_directory_view")
    .select(
      "id, name, slug, city, district, province, logo, is_partner, is_featured, lowest_price, grades, custom_badge, partnership"
    )
    .eq("feature_status", "featured")
    .in("partnership", ["partner", "non_partner"])
    .order("name", { ascending: true });

  let schools = (featuredData ?? []) as SearchSchoolRow[];

  if (schools.length < limit) {
    const { data: fallbackData } = await supabase
      .from("public_school_directory_view")
      .select(
        "id, name, slug, city, district, province, logo, is_partner, is_featured, lowest_price, grades, custom_badge, partnership"
      )
      .in("partnership", ["partner", "non_partner"])
      .order("is_featured", { ascending: false })
      .order("is_partner", { ascending: false })
      .order("name", { ascending: true })
      .limit(limit * 2);

    const existingIds = new Set(schools.map((s) => s.id));
    for (const f of (fallbackData ?? []) as SearchSchoolRow[]) {
      if (!existingIds.has(f.id)) {
        schools.push(f);
        existingIds.add(f.id);
      }
    }
  }

  // 24-hour daily rotation if more than 4 matching schools exist
  if (schools.length > limit) {
    const daySeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const offset = (daySeed * limit) % schools.length;
    schools = [...schools.slice(offset), ...schools.slice(0, offset)].slice(0, limit);
  } else {
    schools = schools.slice(0, limit);
  }

  return (await withCanonicalPackCounts(schools)).map(toSearchRecord);
}

export const getFeaturedSchoolRecords = unstable_cache(
  async (limit = 4) => loadFeaturedSchoolRecords(limit),
  ["public-featured-schools-v1"],
  { revalidate: 300, tags: [SCHOOL_DATA_TAG, "featured-schools"] },
);

export async function searchSchoolRecords(
  filters: SchoolSearchFilters,
  limit = 12,
  offset = 0,
) {
  const safeLimit = Math.min(Math.max(limit, 1), 24);
  const safeOffset = Math.max(offset, 0);
  const supabase = createSupabaseAdminClient();
  let rows: SearchSchoolRow[];
  let total: number;

  if (publicSchoolReadRpcsAvailable !== false) {
    const { data, error } = await supabase.rpc("search_public_schools", {
      search_query: filters.query?.trim() ?? "",
      grade_filter: filters.grade?.trim() ?? "",
      phase_filter: filters.phase ?? "",
      region_filter: filters.region?.trim() ?? "",
      result_limit: safeLimit,
      result_offset: safeOffset,
    });

    if (!error && data) {
      publicSchoolReadRpcsAvailable = true;
      rows = data;
      total = data[0]?.total_count ?? 0;
      return {
        results: rows.map(toSearchRecord),
        total,
        hasMore: safeOffset + rows.length < total,
      };
    }
    if (isMissingRpc(error)) publicSchoolReadRpcsAvailable = false;
  }

  const fallback = await searchPublicSchoolsFallback(filters, safeLimit, safeOffset);
  rows = fallback.rows;
  total = fallback.total;

  return {
    results: rows.map(toSearchRecord),
    total,
    hasMore: safeOffset + rows.length < total,
  };
}
