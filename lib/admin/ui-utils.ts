/**
 * Shared admin UI utilities — eliminates duplication across 20+ pages.
 */

export const PAGE_SIZE = 20;

/** Merge URL search params, returning a path with query string. */
export function buildHref(
  basePath: string,
  params: Record<string, string | number | undefined | null>,
  overrides: Record<string, string | number | undefined | null> = {},
): string {
  const merged = { ...params, ...overrides };
  const entries = Object.entries(merged).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Format a number as ZAR currency. */
export function money(value: number | null | undefined): string {
  const num = Number(value ?? 0);
  return `R ${num.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format an ISO date string to a short human-readable date. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Format an ISO date string to a date + time. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

/** Format a number with thousand separators. */
export function formatNumber(value: number | null | undefined): string {
  const num = Number(value ?? 0);
  return num.toLocaleString("en-ZA");
}

/** Pluralize a label based on count. */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + "s"}`;
}
