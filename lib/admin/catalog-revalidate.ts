import { SCHOOL_DATA_TAG } from "@/lib/school-utils";

/**
 * Shared invalidation for the public catalogue after admin mutations.
 *
 * Public school/pack pages read through `getCachedSchoolBySlug` and friends,
 * which are cached under SCHOOL_DATA_TAG. Invalidating the tag forces those
 * cached reads (and the ISR pages that depend on them) to refresh immediately
 * instead of waiting out their 1-hour revalidate window.
 *
 * When a school's own page is affected (slug/name/status/logo/grade changes)
 * pass `schoolSlug` to also revalidate the page-level ISR paths.
 */
export function revalidateCatalog(options?: {
  schoolSlug?: string | null;
  packSlug?: string | null;
}): void {
  if (typeof window !== "undefined") return;

  try {
    // Dynamically access next/cache at runtime on the server to prevent
    // bundling server-only next/cache into client component graphs.
    const nextCache = require("next/cache") as typeof import("next/cache");
    if (typeof nextCache.revalidateTag === "function") {
      try {
        nextCache.revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
      } catch (err) {
        console.error("[catalog-revalidate] revalidateTag failed:", err);
      }
    }

    const paths = ["/schools", "/"];
    if (options?.schoolSlug) paths.push(`/schools/${options.schoolSlug}`);
    if (options?.packSlug) paths.push(`/schools/packs/${options.packSlug}`);
    if (typeof nextCache.revalidatePath === "function") {
      for (const path of paths) {
        try {
          nextCache.revalidatePath(path);
        } catch (err) {
          console.error(`[catalog-revalidate] revalidatePath failed for ${path}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("[catalog-revalidate] failed to invoke next/cache:", err);
  }
}
