import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { GradePackDetails } from "@/components/schools/GradePackDetails";
import { PackBuildingAnimation } from "@/components/schools/PackBuildingAnimation";
import { SaveVisitTracker } from "@/components/schools/SaveVisitTracker";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency } from "@/lib/formatCurrency";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import { getCachedSchoolBySlug } from "@/lib/school-utils";
import { getPublicSiteSettings } from "@/lib/public-data/settings";
import page from "@/styles/Page.module.css";

type GradePageProps = {
  params: Promise<{ schoolSlug: string; gradeSlug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({
  params,
}: GradePageProps): Promise<Metadata> {
  const { schoolSlug, gradeSlug } = await params;
  const school = await getCachedSchoolBySlug(schoolSlug);
  const normalizedGrade = gradeSlug.toLowerCase();
  const grade =
    school?.grades.find((g) => g.gradeSlug === normalizedGrade) ||
    school?.grades.find((g) => g.id === gradeSlug) ||
    school?.grades.find((g) => normalizedGrade.endsWith(g.gradeSlug));

  if (!school || !grade) {
    return buildMetadata(
      "Pack Not Found",
      "The requested grade stationery pack could not be found.",
      "/schools",
    );
  }

  const ogUrl = new URL("/api/og", "https://pexpacks.co.za");
  ogUrl.searchParams.set("school", school.name);
  ogUrl.searchParams.set("grade", grade.grade);
  if (grade.price) ogUrl.searchParams.set("price", grade.price.toString());

  const meta = buildMetadata(
    `${grade.grade} Stationery Pack for ${school.name}`,
    `Order a ready-to-use ${grade.grade} stationery pack for ${school.name}, prepared according to school stationery requirements and delivery planning.`,
    `/schools/${school.slug}/${grade.gradeSlug}`,
    ogUrl.toString(),
  );

  return {
    ...meta,
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
  };
}

export default async function GradePackPage({ params }: GradePageProps) {
  const { schoolSlug, gradeSlug } = await params;
  const [school, settings] = await Promise.all([
    getCachedSchoolBySlug(schoolSlug),
    getPublicSiteSettings(),
  ]);

  if (!school) {
    notFound();
  }

  // Canonical redirect if school is not an official partner with individual pack pages
  if (!school.isPartnerSchool) {
    permanentRedirect(`/schools/${school.slug}`);
  }

  // Canonical 301 permanent redirect if school was resolved via slug alias
  if (school.slug !== schoolSlug) {
    permanentRedirect(`/schools/${school.slug}/${gradeSlug}`);
  }

  // Match grade with fallback support (e.g. "brakpan-high-school-grade-12" -> "grade-12")
  const normalizedGrade = gradeSlug.toLowerCase();
  const grade =
    school.grades.find((g) => g.gradeSlug === normalizedGrade) ||
    school.grades.find((g) => g.id === gradeSlug) ||
    school.grades.find((g) => normalizedGrade.endsWith(g.gradeSlug)) ||
    school.grades.find(
      (g) =>
        g.grade.toLowerCase().replace(/[^a-z0-9]/g, "") ===
        normalizedGrade.replace(/[^a-z0-9]/g, ""),
    );

  if (!grade) {
    // If grade is not found on this school, gracefully redirect to the school's overview page
    permanentRedirect(`/schools/${school.slug}`);
  }

  if (grade.gradeSlug !== gradeSlug) {
    permanentRedirect(`/schools/${school.slug}/${grade.gradeSlug}`);
  }

  const descriptions = Object.fromEntries(
    (grade.packItems ?? []).flatMap((item) => {
      const description = item.description?.trim();
      if (!description) return [];
      const contentLabel =
        item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name;
      return [
        [item.name, description],
        [contentLabel, description],
      ];
    }),
  );

  return (
    <>
      <JsonLd data={productSchema(school, grade)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Schools", path: "/schools" },
          { name: school.name, path: `/schools/${school.slug}` },
          {
            name: grade.grade,
            path: `/schools/${school.slug}/${grade.gradeSlug}`,
          },
        ])}
      />
      <Suspense fallback={null}>
        <SaveVisitTracker
          schoolName={school.name}
          schoolSlug={school.slug}
          grade={grade.grade}
          gradeSlug={grade.gradeSlug}
        />
      </Suspense>
      <PageHero
        eyebrow={school.name}
        title={`${grade.grade} Stationery Pack`}
        panelText="Pack estimate"
        panelTitle={formatCurrency(grade.price)}
      />
      <section className={page.section}>
        <PackBuildingAnimation schoolName={school.name}>
          <GradePackDetails
            school={school}
            grade={grade}
            descriptions={descriptions}
            readCustomiseFromUrl
            pexcoverPrice={settings.pexcoverPrice}
          />
        </PackBuildingAnimation>
      </section>
    </>
  );
}
