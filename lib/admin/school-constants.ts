export const SCHOOL_STATUSES = ["active", "pending", "inactive", "archived"] as const;
export type SchoolStatus = (typeof SCHOOL_STATUSES)[number];
