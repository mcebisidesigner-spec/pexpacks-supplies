import type { MetadataRoute } from "next";
import { getFullSchoolRecords } from "@/data/schools";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const schools = await getFullSchoolRecords();

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
