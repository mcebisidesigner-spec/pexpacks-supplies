export const PUBLICATION_STATUSES = [
  "published",
  "ready_for_review",
] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const PARTNERSHIP_STATUSES = [
  "partner",
  "non_partner",
  "refused_partner",
] as const;
export type PartnershipStatus = (typeof PARTNERSHIP_STATUSES)[number];

export const FEATURE_STATUSES = [
  "featured",
  "unfeatured",
] as const;
export type FeatureStatus = (typeof FEATURE_STATUSES)[number];

export const PARENT_COLLECTION_OPTIONS = [
  "accepted",
  "unaccepted",
] as const;
export type ParentCollectionOption = (typeof PARENT_COLLECTION_OPTIONS)[number];

// Legacy / internal operational constants retained for compatibility
export const SCHOOL_STATUSES = ["active", "pending", "inactive", "archived"] as const;
export type SchoolStatus = (typeof SCHOOL_STATUSES)[number];

export const STATIONERY_LIST_STATUSES = [
  "verified",
  "being_digitised",
  "received",
  "not_received",
] as const;
export type StationeryListStatus = (typeof STATIONERY_LIST_STATUSES)[number];
