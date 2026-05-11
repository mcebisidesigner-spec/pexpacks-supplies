import type { MetadataRoute } from "next";
import { schools } from "@/data/schools";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/schools",
    "/office-packs",
    "/partner-with-schools",
    "/order",
    "/track-order",
    "/add-your-school",
    "/standard-school-packs",
    "/faq",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/cookie-notice",
    "/delivery-policy"
  ];

  const schoolRoutes = schools.flatMap((school) => [
    `/schools/${school.slug}`,
    ...school.grades.map((grade) => `/schools/${school.slug}/${grade.gradeSlug}`)
  ]);

  return [...staticRoutes, ...schoolRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-05-01"),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7
  }));
}
