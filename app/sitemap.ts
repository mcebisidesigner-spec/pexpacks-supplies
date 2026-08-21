import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog";
import { getPublicSchoolRecords } from "@/lib/schools/publicSchoolData";
import { siteUrl } from "@/lib/seo";

const siteContentUpdatedAt = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/schools",
    "/blog",
    "/partnership",
    "/order",
    "/track-order",
    "/add-your-school",
    "/faq",
    "/contact",
    "/happy-pay",
    "/opengraph-image.jpg",
    "/twitter-image.jpg",
    "/privacy-policy",
    "/terms",
    "/email-disclaimer",
    "/happy-pay-terms",
    "/cookie-notice",
    "/delivery-policy",
    "/returns-refunds-policy",
    "/paia-manual",
    "/social-media-guidelines",
    "/school-partnership-terms",
    "/supplier-terms",
    "/campaign-terms",
  ];

  const schools = await getPublicSchoolRecords();

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

  const schoolEntries = schools.map((school) => ({
    url: `${siteUrl}/schools/${school.slug}`,
    lastModified: siteContentUpdatedAt,
    changeFrequency: "weekly" as const,
    priority: school.isPartnerSchool ? 0.9 : 0.75,
  }));

  const gradeEntries = schools.flatMap((school) =>
    school.grades.map((grade) => ({
      url: `${siteUrl}/schools/${school.slug}/${grade.gradeSlug}`,
      lastModified: siteContentUpdatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  return [...staticEntries, ...blogEntries, ...schoolEntries, ...gradeEntries];
}
