/**
 * URL-safe helpers for the /admin/suppliers/[supplierName] routes.
 * Kept dependency-free so they can be used from both server pages and the
 * client-side SuppliersPageView.
 */

/** Lowercase, dash-separated slug derived from a supplier name. */
export function supplierSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Human-readable supplier name reconstructed from its URL slug. */
export function supplierNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Compact uppercase supplier code derived from a slug (e.g. makro -> SUP-MAKRO). */
export function supplierCodeFromSlug(slug: string): string {
  return `SUP-${slug
    .replace(/[^a-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8)}`;
}

/** Mock procurement email derived from a slug (e.g. bsc-stationers -> orders@bscstationers.co.za). */
export function supplierEmailFromSlug(slug: string): string {
  return `orders@${slug.replace(/[^a-z0-9]/g, "")}.co.za`;
}
