import { describe, it, expect, vi } from "vitest";
import robots from "@/app/robots";
import nextConfig from "@/next.config";

vi.mock("next/cache", () => ({
  unstable_cache: (fn: any) => fn,
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/schools/publicSchoolData", () => ({
  getPublicSchoolRecords: vi.fn(async () => [
    {
      id: "school-1",
      slug: "brakpan-high-school",
      name: "Brakpan High School",
      isPartnerSchool: false,
      grades: [
        { id: "brakpan-high-school-grade-12", grade: "Grade 12", gradeSlug: "grade-12" },
      ],
    },
  ]),
}));

describe("Sitemap, Robots and Canonical SEO Redirects", () => {
  it("generates correct robots.txt directives blocking admin, console and private routes", () => {
    const rules = robots();
    expect(rules.sitemap).toBe("https://pexpacks.co.za/sitemap.xml");

    const disallows = Array.isArray(rules.rules)
      ? rules.rules.flatMap((r) =>
          Array.isArray(r.disallow) ? r.disallow : [r.disallow],
        )
      : Array.isArray(rules.rules?.disallow)
        ? rules.rules.disallow
        : [rules.rules?.disallow];

    expect(disallows).toContain("/admin");
    expect(disallows).toContain("/admin/");
    expect(disallows).toContain("/pex-console-secure");
    expect(disallows).toContain("/login");
    expect(disallows).toContain("/checkout");
    expect(disallows).toContain("/api/");
  });

  it("configures legacy /packs and /school redirects to canonical /schools in next.config.ts", async () => {
    if (typeof nextConfig.redirects === "function") {
      const redirects = await nextConfig.redirects();
      const packsGradeRedirect = redirects.find(
        (r) => r.source === "/packs/:schoolSlug/:grade*",
      );
      expect(packsGradeRedirect).toBeDefined();
      expect(packsGradeRedirect?.destination).toBe(
        "/schools/:schoolSlug",
      );

      const schoolsGradeRedirect = redirects.find(
        (r) => r.source === "/schools/:schoolSlug/:gradeSlug",
      );
      expect(schoolsGradeRedirect).toBeDefined();
      expect(schoolsGradeRedirect?.destination).toBe("/schools/:schoolSlug");

      const checkoutSlugRedirect = redirects.find((r) =>
        r.source.startsWith("/checkout/:slug"),
      );
      expect(checkoutSlugRedirect).toBeDefined();
      expect(checkoutSlugRedirect?.destination).toBe("/checkout");

      const packsRedirect = redirects.find(
        (r) => r.source === "/packs/:schoolSlug",
      );
      expect(packsRedirect).toBeDefined();
      expect(packsRedirect?.destination).toBe("/schools/:schoolSlug");

      const adminLoginRedirect = redirects.find(
        (r) => r.source === "/admin/login",
      );
      expect(adminLoginRedirect).toBeUndefined();

      const contactUsRedirect = redirects.find(
        (r) => r.source === "/contact-us",
      );
      expect(contactUsRedirect).toBeDefined();
      expect(contactUsRedirect?.destination).toBe("/contact");
    }
  });

  it("ensures sitemap excludes /login and individual grade pack deep-links", async () => {
    const sitemapFn = (await import("@/app/sitemap")).default;
    const entries = await sitemapFn();
    const urls = entries.map((e) => e.url);

    // /login should never be indexed in sitemap
    expect(urls.some((u) => u.endsWith("/login"))).toBe(false);

    // Legacy school grade pack deep links (e.g. /schools/.../grade-12) must not be in sitemap
    expect(urls.some((u) => u.includes("/grade-"))).toBe(false);
  });
});
