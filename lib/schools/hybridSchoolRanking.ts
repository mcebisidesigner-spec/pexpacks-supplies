export type HybridSchoolItem = {
  name: string;
  slug: string;
  image?: string | null;
  city?: string;
  metro?: string;
  province?: string;
  isRecent?: boolean;
};

export type RecentVisitItem = {
  schoolName: string;
  schoolSlug: string;
  city?: string;
  image?: string | null;
  timestamp?: number;
};

/**
 * Pure function that blends Edge IP-geolocated / trending school records
 * with local behavioral memory (recent school visits).
 *
 * Ranking Strategy:
 * 1. Pinned slot(s): 1 to 2 most recent visits from local memory (`isRecent: true`).
 * 2. Geo/Cluster Boost: Server schools located in the same municipality/metro
 *    as the user's recent school(s) are given priority.
 * 3. Remainder: Server's Edge IP / trending schools fill the remaining slots up to maxItems.
 * 4. Deduplication: Any school already pinned in the recent slot is omitted from
 *    the remaining positions.
 */
export function rankHybridSchools(
  serverSchools: HybridSchoolItem[],
  recentVisits: RecentVisitItem[],
  maxItems = 8,
): {
  rankedSchools: HybridSchoolItem[];
  hasRecent: boolean;
  primaryCity?: string;
} {
  if (!recentVisits || recentVisits.length === 0) {
    return {
      rankedSchools: (serverSchools || []).slice(0, maxItems).map((s) => ({
        ...s,
        isRecent: false,
      })),
      hasRecent: false,
    };
  }

  // 1. Extract up to 2 unique recent visits
  const uniqueRecents: RecentVisitItem[] = [];
  const seenSlugs = new Set<string>();

  for (const visit of recentVisits) {
    if (!visit?.schoolSlug || seenSlugs.has(visit.schoolSlug)) continue;
    seenSlugs.add(visit.schoolSlug);
    uniqueRecents.push(visit);
    if (uniqueRecents.length >= 2) break;
  }

  // Identify user's active geographic cluster from recent visits
  const primaryCity = uniqueRecents
    .find((r) => r.city?.trim())
    ?.city?.trim()
    .toLowerCase();

  // 2. Format pinned recent schools, enriching with server metadata (image, city) if available
  const recentItems: HybridSchoolItem[] = uniqueRecents.map((recent) => {
    const serverMatch = (serverSchools || []).find(
      (s) => s.slug === recent.schoolSlug,
    );
    return {
      name: recent.schoolName,
      slug: recent.schoolSlug,
      image: recent.image || serverMatch?.image || null,
      city: recent.city || serverMatch?.city,
      metro: serverMatch?.metro,
      province: serverMatch?.province,
      isRecent: true,
    };
  });

  // 3. Exclude already-pinned schools from the remaining candidate list
  const remainingCandidates = (serverSchools || []).filter(
    (s) => !seenSlugs.has(s.slug),
  );

  // 4. Boost same-city / same-metro server schools if primaryCity is known
  const boostedList: HybridSchoolItem[] = [];
  const otherList: HybridSchoolItem[] = [];

  if (primaryCity) {
    for (const school of remainingCandidates) {
      const cityMatch = school.city?.trim().toLowerCase() === primaryCity;
      const metroMatch = school.metro?.trim().toLowerCase() === primaryCity;
      if (cityMatch || metroMatch) {
        boostedList.push({ ...school, isRecent: false });
      } else {
        otherList.push({ ...school, isRecent: false });
      }
    }
  } else {
    for (const school of remainingCandidates) {
      otherList.push({ ...school, isRecent: false });
    }
  }

  // 5. Merge all tiers: [Recent Pinned -> Local Cluster Trending -> General Edge Trending]
  const combined = [...recentItems, ...boostedList, ...otherList];

  return {
    rankedSchools: combined.slice(0, maxItems),
    hasRecent: recentItems.length > 0,
    primaryCity: primaryCity || undefined,
  };
}
