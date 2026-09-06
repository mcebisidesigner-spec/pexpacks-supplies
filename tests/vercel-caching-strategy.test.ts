import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SCHOOL_DATA_REVALIDATE_SECONDS } from "@/lib/school-utils";
import { SEASON_REVALIDATE_SECONDS } from "@/lib/public-data/seasons";
import { SETTINGS_REVALIDATE_SECONDS } from "@/lib/public-data/settings";
import { CMS_REVALIDATE_SECONDS } from "@/lib/cms";
import { BLOG_REVALIDATE_SECONDS } from "@/lib/blog";

const root = process.cwd();

function readRepoFile(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("Vercel Caching Strategy & Freshness Contract", () => {
  it("enforces a standard 5-minute (300s) TTL across all public data caching layers", () => {
    expect(SCHOOL_DATA_REVALIDATE_SECONDS).toBe(300);
    expect(SEASON_REVALIDATE_SECONDS).toBe(300);
    expect(SETTINGS_REVALIDATE_SECONDS).toBe(300);
    expect(CMS_REVALIDATE_SECONDS).toBe(300);
    expect(BLOG_REVALIDATE_SECONDS).toBe(300);
  });

  it("configures 5-minute (300s) ISR revalidation on all key customer-facing pages", () => {
    const homePage = readRepoFile("app/page.tsx");
    expect(homePage).toContain("export const revalidate = 300");

    const schoolsPage = readRepoFile("app/schools/page.tsx");
    expect(schoolsPage).toContain("export const revalidate = 300");

    const schoolDetailPage = readRepoFile("app/schools/[schoolSlug]/page.tsx");
    expect(schoolDetailPage).toContain("export const revalidate = 300");
    expect(schoolDetailPage).not.toContain('export const dynamic = "force-dynamic"');

    const blogPage = readRepoFile("app/blog/page.tsx");
    expect(blogPage).toContain("export const revalidate = 300");

    const blogPostPage = readRepoFile("app/blog/[slug]/page.tsx");
    expect(blogPostPage).toContain("export const revalidate = 300");
  });

  it("enforces 5-minute (s-maxage=300) edge caching headers on public JSON APIs", () => {
    const schoolApi = readRepoFile("app/api/schools/[schoolSlug]/route.ts");
    expect(schoolApi).toContain("s-maxage=300");

    const searchApi = readRepoFile("app/api/schools/search/route.ts");
    expect(searchApi).toContain("s-maxage=300");
    expect(searchApi).not.toContain("s-maxage=600");

    const nearbyApi = readRepoFile("app/api/nearby-schools/route.ts");
    expect(nearbyApi).toContain("s-maxage=300");
    expect(nearbyApi).not.toContain("s-maxage=600");
  });

  it("ensures revalidateCatalog invalidates all public tags and paths for instant freshness", () => {
    const revalidateCode = readRepoFile("lib/admin/catalog-revalidate.ts");
    expect(revalidateCode).toContain("SCHOOL_DATA_TAG");
    expect(revalidateCode).toContain("featured-schools");
    expect(revalidateCode).toContain("SEASON_CACHE_TAG");
    expect(revalidateCode).toContain("SETTINGS_CACHE_TAG");
    expect(revalidateCode).toContain("CMS_TAGS.testimonials");
    expect(revalidateCode).toContain("CMS_TAGS.faqs");
    expect(revalidateCode).toContain("CMS_TAGS.websiteContent");
    expect(revalidateCode).toContain('paths = ["/schools", "/"]');
  });

  it("ensures admin operations actions invoke revalidateCatalog upon mutating catalogue or seasons", () => {
    const operationsActions = readRepoFile("app/admin/operations-actions.ts");
    expect(operationsActions).toContain("import { revalidateCatalog } from");
    expect(operationsActions).toContain("revalidateCatalog()");
    expect(operationsActions).toContain("revalidateCatalog({ revalidateSeason: true })");
  });
});
