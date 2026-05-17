export type SchoolSearchRecord = {
  id: string;
  name: string;
  slug: string;
  region: string;
  city?: string;
  province?: string;
  grades: string[];
  isFeatured?: boolean;
  isPartner?: boolean;
  image?: string;
  /** Lowest grade pack price for this school (in ZAR cents) */
  lowestPrice?: number;
};

export type SchoolSearchFilters = {
  query?: string;
  grade?: string;
  region?: string;
};

export type PaginatedSchoolResults = {
  results: SchoolSearchRecord[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};
