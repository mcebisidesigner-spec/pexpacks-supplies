import type { SchoolPhase } from "./schoolPhase";

export type SchoolSearchRecord = {
  id: string;
  name: string;
  slug: string;
  region: string;
  city?: string;
  metro?: string;
  province?: string;
  grades: string[];
  isFeatured?: boolean;
  isPartner?: boolean;
  image?: string;
  customBadge?: string | null;
  phases: SchoolPhase[];
  /** Lowest grade pack price for this school (in ZAR cents) */
  lowestPrice?: number;
};

export type SchoolSearchFilters = {
  query?: string;
  grade?: string;
  phase?: SchoolPhase | "";
  region?: string;
};

export type PaginatedSchoolResults = {
  results: SchoolSearchRecord[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};
