import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { GradePackDetails } from "@/components/schools/GradePackDetails";
import { PackBuildingAnimation } from "@/components/schools/PackBuildingAnimation";
import { SaveVisitTracker } from "@/components/schools/SaveVisitTracker";
import { JsonLd } from "@/components/ui/JsonLd";
import { getSchoolIndex } from "@/data/schools";
import { buildMetadata } from "@/lib/seo";
import { formatCurrency } from "@/lib/formatCurrency";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import {
  getCachedSchoolBySlug,
  getGradePackItemDescriptions,
} from "@/lib/school-utils";
import page from "@/styles/Page.module.css";

type GradePageProps = {
  params: Promise<{ schoolSlug: string; gradeSlug: string }>;
  searchParams?: Promise<{ customize?: string }>;
};

export const dynamicParams = true;

export const revalidate = 3600; // Edge ISR cache for 1 hour, auto-revalidated on dashboard edit

export async function generateStaticParams() {
  const schoolIndex = await getSchoolIndex();
  return schoolIndex
    .filter((school) => school.isFeatured || school.isPartnerSchool)
    .flatMap((school) =>
      school.grades.map((grade) => ({
        schoolSlug: school.slug,
        gradeSlug: grade.gradeSlug,
      }))
    );
}

export async function generateMetadata({
  params,
}: GradePageProps): Promise<Metadata> {
  const { schoolSlug, gradeSlug } = await params;
  const school = await getCachedSchoolBySlug(schoolSlug);
  const grade = school?.grades.find((g) => g.gradeSlug === gradeSlug);

  if (!school || !grade) {
    return buildMetadata(
      "Pack Not Found",
      "The requested grade stationery pack could not be found.",
      "/schools"
    );
  }

  const ogUrl = new URL("/api/og", "https://pexpacks.co.za");
  ogUrl.searchParams.set("school", school.name);
  ogUrl.searchParams.set("grade", grade.grade);
  if (grade.price) ogUrl.searchParams.set("price", grade.price.toString());

  return buildMetadata(
    `${grade.grade} Stationery Pack for ${school.name}`,
    `Order a ready-to-use ${grade.grade} stationery pack for ${school.name}, prepared according to school stationery requirements and delivery planning.`,
    `/schools/${school.slug}/${grade.gradeSlug}`,
    ogUrl.toString()
  );
}

export default async function GradePackPage({ params, searchParams }: GradePageProps) {
  const { schoolSlug, gradeSlug } = await params;
  const search = await searchParams;
  const autoCustomise = search?.customize === "1";
  const school = await getCachedSchoolBySlug(schoolSlug);
  const grade = school?.grades.find((g) => g.gradeSlug === gradeSlug);

  if (!school || !grade) {
    notFound();
  }

  const descriptions = await getGradePackItemDescriptions(school.slug, grade.gradeSlug);

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
          <GradePackDetails school={school} grade={grade} descriptions={descriptions} autoCustomise={autoCustomise} />
        </PackBuildingAnimation>
      </section>
    </>
  );
}
