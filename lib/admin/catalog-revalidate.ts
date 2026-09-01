import { SCHOOL_DATA_TAG } from "@/lib/school-utils";
import { SEASON_CACHE_TAG } from "@/lib/public-data/seasons";
import { SETTINGS_CACHE_TAG } from "@/lib/public-data/settings";
import { CMS_TAGS } from "@/lib/cms";

/**
 * Shared invalidation for the public catalogue after admin mutations.
 *
 * Public school/pack pages read through `getCachedSchoolBySlug` and friends,
 * which are cached under SCHOOL_DATA_TAG. Invalidating the tag forces those
 * cached reads (and the ISR pages that depend on them) to refresh immediately
 * instead of waiting out their 5-minute revalidate window.
 *
 * When a school's own page is affected (slug/name/status/logo/grade changes)
 * pass `schoolSlug` to also revalidate the page-level ISR paths.
 */
type RevalidateTagFn = (tag: string, options?: { expire?: number }) => void;

function revalidateTagNow(revalidateTag: RevalidateTagFn, tag: string): void {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch {
    revalidateTag(tag);
  }
}

export function revalidateCatalog(options?: {
  schoolSlug?: string | null;
  packSlug?: string | null;
  revalidateSeason?: boolean;
  revalidateSettings?: boolean;
}): void {
  if (typeof window !== "undefined") return;

  try {
    // Dynamically access next/cache at runtime on the server to prevent
    // bundling server-only next/cache into client component graphs.
    const nextCache = require("next/cache") as typeof import("next/cache");
    if (typeof nextCache.revalidateTag === "function") {
      try {
        const revalidateTag = nextCache.revalidateTag as RevalidateTagFn;
        revalidateTagNow(revalidateTag, SCHOOL_DATA_TAG);
        revalidateTagNow(revalidateTag, "featured-schools");
        revalidateTagNow(revalidateTag, SEASON_CACHE_TAG);
        revalidateTagNow(revalidateTag, SETTINGS_CACHE_TAG);
        revalidateTagNow(revalidateTag, CMS_TAGS.testimonials);
        revalidateTagNow(revalidateTag, CMS_TAGS.faqs);
        revalidateTagNow(revalidateTag, CMS_TAGS.websiteContent);

        if (options?.schoolSlug) {
          revalidateTagNow(revalidateTag, `school-${options.schoolSlug}`);
        }
      } catch (err) {
        console.error("[catalog-revalidate] revalidateTag failed:", err);
      }
    }

    const paths = ["/schools", "/"];
    if (options?.schoolSlug) paths.push(`/schools/${options.schoolSlug}`);
    if (options?.schoolSlug && options?.packSlug) {
      paths.push(`/schools/${options.schoolSlug}/${options.packSlug}`);
    }
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
