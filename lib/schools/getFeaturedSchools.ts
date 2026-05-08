import type { SchoolSearchRecord } from "./types";

function uniqueBySlug(records: SchoolSearchRecord[]) {
  const seen = new Set<string>();
  return records.filter((school) => {
    if (seen.has(school.slug)) {
      return false;
    }

    seen.add(school.slug);
    return true;
  });
}

export function getFeaturedSchools(records: SchoolSearchRecord[], limit = 4) {
  const featured = records.filter((school) => school.isFeatured);
  const partners = records.filter((school) => school.isPartner);

  return uniqueBySlug([...featured, ...partners, ...records]).slice(0, limit);
}
