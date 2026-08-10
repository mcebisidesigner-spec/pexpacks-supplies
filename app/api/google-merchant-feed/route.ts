import { NextResponse } from "next/server";
import { getFullSchoolRecords } from "@/data/schools";
import { siteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const revalidate = 3600; // Cache XML feed for 1 hour

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const schools = await getFullSchoolRecords();

  const itemsXml = schools
    .flatMap((school) =>
      school.grades.map((grade) => {
        const title = `${grade.grade} Stationery Pack - ${school.name}`;
        const description = `Official 100% matched ${grade.grade} stationery pack for ${school.name} in ${school.city}. Prepared for school delivery or collection.`;
        const link = `${siteUrl}/schools/${school.slug}/${grade.gradeSlug}`;
        const imageLink = school.logo
          ? `${siteUrl}${school.logo}`
          : `${siteUrl}/images/hero-school-delivery.webp`;

        return `
    <item>
      <g:id>${escapeXml(grade.id)}</g:id>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${grade.price.toFixed(2)} ZAR</g:price>
      <g:brand>Pexpacks</g:brand>
      <g:product_type>Office Supplies &gt; General Supplies &gt; Stationery Packs</g:product_type>
    </item>`;
      })
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Pexpacks School Stationery Packs</title>
    <link>${siteUrl}</link>
    <description>Official school stationery packs and grade-matched lists for South African schools.</description>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
