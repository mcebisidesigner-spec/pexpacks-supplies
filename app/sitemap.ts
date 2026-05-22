import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import { getFullSchoolRecords } from "@/data/schools";
import { siteUrl } from "@/lib/seo";

const siteContentUpdatedAt = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/schools",
    "/blog",
    "/office",
    "/partnership",
    "/order",
    "/track-order",
    "/add-your-school",
    "/foundation-phase",
    "/primary-school",
    "/high-school",
    "/success-stories",
    "/faq",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/cookie-notice",
    "/delivery-policy",
    "/returns-refunds-policy",
    "/paia-manual",
    "/social-media-guidelines",
    "/school-partnership-terms",
    "/supplier-terms",
    "/campaign-terms",
  ];

  const schools = await getFullSchoolRecords();

  const schoolRoutes = schools.flatMap((school) => [
    `/schools/${school.slug}`,
    ...school.grades.map(
      (grade) => `/schools/${school.slug}/${grade.gradeSlug}`
    ),
  ]);

  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: siteContentUpdatedAt,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const schoolEntries = schoolRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: siteContentUpdatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...blogEntries, ...schoolEntries];
}
