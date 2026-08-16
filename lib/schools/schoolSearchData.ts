import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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
  lowest_price: number | null;
  grades: Json | null;
  custom_badge: string | null;
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

function getGradeLabels(value: Json | null): string[] {
  if (!Array.isArray(value)) return [];

  return value
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

function toSearchRecord(row: SearchSchoolRow): SchoolSearchRecord {
  const grades = getGradeLabels(row.grades);
  const city = row.city ?? "";

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
    isPartner: Boolean(row.is_partner),
    image: row.logo,
    customBadge: row.custom_badge || "2026 Packs",
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

async function searchPublicSchoolsFallback(
  filters: SchoolSearchFilters,
  limit: number,
  offset: number,
) {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("schools")
    .select(
      "id, name, slug, city, district, province, logo, is_partner, is_featured, lowest_price, grades, custom_badge",
      { count: "exact" },
    )
    .eq("status", "active")
    .eq("published", true);

  const search = filters.query?.trim();
  if (search) {
    query = query.textSearch("search_vector", search, {
      config: "english",
      type: "websearch",
    });
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
    rows: (data ?? []) as SearchSchoolRow[],
    total: count ?? 0,
  };
}

/**
 * Kept for admin action compatibility. Public reads are now bounded database
 * queries, so there is no process-local school index to invalidate.
 */
export function invalidateSchoolSearchCache() {}

export async function getFeaturedSchoolRecords(limit = 4) {
  const supabase = createSupabaseAdminClient();
  if (publicSchoolReadRpcsAvailable !== false) {
    const { data, error } = await supabase.rpc("get_featured_public_schools", {
      result_limit: limit,
    });

    if (!error && data) {
      publicSchoolReadRpcsAvailable = true;
      return data.map(toSearchRecord);
    }
    if (isMissingRpc(error)) publicSchoolReadRpcsAvailable = false;
  }

  const { rows } = await searchPublicSchoolsFallback({}, limit, 0);
  return rows.map(toSearchRecord);
}

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
