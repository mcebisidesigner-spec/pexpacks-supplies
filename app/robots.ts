import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/admin/",
        "/pex-console-secure",
        "/pex-console",
        "/login",
        "/checkout",
        "/checkout/",
        "/_next/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
