import type { PaginatedSchoolResults, SchoolSearchRecord } from "./types";

export function paginateSchools(records: SchoolSearchRecord[], limit = 12, offset = 0): PaginatedSchoolResults {
  const safeLimit = Math.min(Math.max(Number.isFinite(limit) ? limit : 12, 1), 24);
  const safeOffset = Math.max(Number.isFinite(offset) ? offset : 0, 0);
  const results = records.slice(safeOffset, safeOffset + safeLimit);

  return {
    results,
    total: records.length,
    limit: safeLimit,
    offset: safeOffset,
    hasMore: safeOffset + results.length < records.length
  };
}
