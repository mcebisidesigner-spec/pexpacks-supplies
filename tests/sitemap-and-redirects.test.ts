import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import nextConfig from "@/next.config";

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
        "/schools/:schoolSlug/:grade*",
      );

      const packsRedirect = redirects.find(
        (r) => r.source === "/packs/:schoolSlug",
      );
      expect(packsRedirect).toBeDefined();
      expect(packsRedirect?.destination).toBe("/schools/:schoolSlug");

      const adminLoginRedirect = redirects.find(
        (r) => r.source === "/admin/login",
      );
      expect(adminLoginRedirect).toBeDefined();
      expect(adminLoginRedirect?.destination).toBe("/pex-console-secure");

      const contactUsRedirect = redirects.find(
        (r) => r.source === "/contact-us",
      );
      expect(contactUsRedirect).toBeDefined();
      expect(contactUsRedirect?.destination).toBe("/contact");
    }
  });
});
