import { normaliseSchoolQuery, normaliseFilterValue } from "./normaliseSchoolQuery";
import type { SchoolPhase } from "./schoolPhase";
import type {
  SchoolSearchRecord,
  SchoolSearchFilters,
  PaginatedSchoolResults,
} from "./types";

/**
 * Pre-built search index for fast school lookups.
 *
 * Instead of normalising school names on every request, we pre-compute
 * normalised names and grade/region indexes at module load time (once).
 * Searches then run against the pre-built data with zero per-request
 * string normalisation overhead.
 */

type IndexedSchool = SchoolSearchRecord & {
  /** Pre-normalised name for substring matching */
  normalisedName: string;
  /** Pre-lowercased grades for fast grade filtering */
  lowerGrades: string[];
  /** Pre-normalised region/city/province for region filtering */
  normalisedRegion: string;
  normalisedCity: string;
  normalisedProvince: string;
  phases: SchoolPhase[];
  /** Priority score for sorting (featured/partner schools first) */
  priority: number;
};

/** LRU cache for recent search results */
type CacheEntry = {
  results: PaginatedSchoolResults;
  timestamp: number;
};

const CACHE_MAX_SIZE = 64;
const CACHE_TTL_MS = 30_000; // 30 seconds

export class SchoolSearchIndex {
  private readonly schools: IndexedSchool[];
  private readonly gradeIndex: Map<string, Set<number>>;
  private readonly phaseIndex: Map<SchoolPhase, Set<number>>;
  private readonly cache: Map<string, CacheEntry>;

  constructor(records: SchoolSearchRecord[]) {
    // Pre-compute normalised data and sort by priority + name once
    this.schools = records
      .map((school) => ({
        ...school,
        normalisedName: normaliseSchoolQuery(school.name),
        lowerGrades: school.grades.map((g) => g.toLowerCase()),
        normalisedRegion: normaliseSchoolQuery(school.region),
        normalisedCity: normaliseSchoolQuery(school.city),
        normalisedProvince: normaliseSchoolQuery(school.province),
        priority:
          Number(Boolean(school.isFeatured)) * 2 +
          Number(Boolean(school.isPartner)),
      }))
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.name.localeCompare(b.name);
      });

    // Build a grade → school-indices lookup for O(1) grade filtering
    this.gradeIndex = new Map();
    this.phaseIndex = new Map();
    for (let i = 0; i < this.schools.length; i++) {
      for (const grade of this.schools[i].lowerGrades) {
        let set = this.gradeIndex.get(grade);
        if (!set) {
          set = new Set();
          this.gradeIndex.set(grade, set);
        }
        set.add(i);
      }

      for (const phase of this.schools[i].phases) {
        let set = this.phaseIndex.get(phase);
        if (!set) {
          set = new Set();
          this.phaseIndex.set(phase, set);
        }
        set.add(i);
      }
    }

    this.cache = new Map();
  }

  /**
   * Search schools with pre-built index.
   * Results are cached by query signature for repeat lookups.
   */
  search(
    filters: SchoolSearchFilters,
    limit = 12,
    offset = 0
  ): PaginatedSchoolResults {
    const safeLimit = Math.min(Math.max(Number.isFinite(limit) ? limit : 12, 1), 24);
    const safeOffset = Math.max(Number.isFinite(offset) ? offset : 0, 0);

    const cacheKey = this.buildCacheKey(filters, safeLimit, safeOffset);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const query = normaliseSchoolQuery(filters.query);
    const grade = normaliseFilterValue(filters.grade);
    const phase = filters.phase || "";
    const region = normaliseFilterValue(filters.region);

    // If only filtering by grade or phase, use the index
    // for a fast O(1) lookup instead of scanning all schools
    let candidates: IndexedSchool[];

    if (grade && !phase && !query && !region) {
      const indices = this.gradeIndex.get(grade.toLowerCase());
      candidates = indices
        ? Array.from(indices).map((i) => this.schools[i])
        : [];
    } else if (phase && !grade && !query && !region) {
      const indices = this.phaseIndex.get(phase);
      candidates = indices
        ? Array.from(indices).map((i) => this.schools[i])
        : [];
    } else {
      // General path: scan with pre-normalised data (no per-request normalisation)
      candidates = this.schools.filter((school) => {
        if (query) {
          const firstWord = school.normalisedName.split(" ")[0];
          if (!firstWord.startsWith(query)) return false;
        }
        if (
          grade &&
          !school.lowerGrades.includes(grade.toLowerCase())
        )
          return false;
        if (phase && !school.phases.includes(phase)) return false;
        if (region) {
          const normRegion = normaliseSchoolQuery(region);
          if (
            !school.normalisedRegion.includes(normRegion) &&
            !school.normalisedCity.includes(normRegion) &&
            !school.normalisedProvince.includes(normRegion)
          )
            return false;
        }
        return true;
      });
    }

    const paged = candidates.slice(safeOffset, safeOffset + safeLimit);
    const result: PaginatedSchoolResults = {
      results: paged.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        region: s.region,
        city: s.city,
        province: s.province,
        grades: s.grades,
        isFeatured: s.isFeatured,
        isPartner: s.isPartner,
        image: s.image,
        phases: s.phases,
        lowestPrice: s.lowestPrice,
      })),
      total: candidates.length,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: safeOffset + paged.length < candidates.length,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  private buildCacheKey(
    filters: SchoolSearchFilters,
    limit: number,
    offset: number
  ): string {
    return `${filters.query ?? ""}|${filters.grade ?? ""}|${filters.phase ?? ""}|${filters.region ?? ""}|${limit}|${offset}`;
  }

  private getFromCache(key: string): PaginatedSchoolResults | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.results;
  }

  private setCache(key: string, results: PaginatedSchoolResults) {
    // Evict oldest entries if cache is full
    if (this.cache.size >= CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, { results, timestamp: Date.now() });
  }
}
