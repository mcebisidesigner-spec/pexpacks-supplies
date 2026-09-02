import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import { getPublicSchoolRecords } from "@/lib/schools/publicSchoolData";
import { siteUrl } from "@/lib/seo";

export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/schools", changeFrequency: "daily" as const, priority: 0.95 },
    {
      path: "/partnership",
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    {
      path: "/add-your-school",
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    { path: "/happy-pay", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/faq", changeFrequency: "weekly" as const, priority: 0.75 },
    { path: "/contact", changeFrequency: "weekly" as const, priority: 0.75 },
    { path: "/order", changeFrequency: "weekly" as const, priority: 0.7 },
    { path: "/track-order", changeFrequency: "weekly" as const, priority: 0.7 },
    {
      path: "/delivery-policy",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/returns-refunds-policy",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/privacy-policy",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    { path: "/terms", changeFrequency: "monthly" as const, priority: 0.5 },
    {
      path: "/cookie-notice",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/email-disclaimer",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/happy-pay-terms",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/paia-manual",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/social-media-guidelines",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/school-partnership-terms",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/supplier-terms",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      path: "/campaign-terms",
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  const schools = await getPublicSchoolRecords();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${siteUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date || now),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const schoolEntries: MetadataRoute.Sitemap = schools.map((school) => ({
    url: `${siteUrl}/schools/${school.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: school.isPartnerSchool ? 0.9 : 0.8,
  }));

  const gradeEntries: MetadataRoute.Sitemap = schools.flatMap((school) =>
    (school.grades || []).map((grade) => ({
      url: `${siteUrl}/schools/${school.slug}/${grade.gradeSlug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: school.isPartnerSchool ? 0.85 : 0.75,
    })),
  );

  return [...staticEntries, ...blogEntries, ...schoolEntries, ...gradeEntries];
}
