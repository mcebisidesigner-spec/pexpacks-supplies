import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GradePackDetails } from "@/components/schools/GradePackDetails";
import { JsonLd } from "@/components/ui/JsonLd";
import { getSchoolIndex } from "@/data/schools";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import { getGradeBySlug, getSchoolBySlug } from "@/lib/school-utils";
import page from "@/styles/Page.module.css";

type GradePageProps = {
  params: Promise<{ schoolSlug: string; gradeSlug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return getSchoolIndex().flatMap((school) =>
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
  const school = await getSchoolBySlug(schoolSlug);
  const grade = await getGradeBySlug(schoolSlug, gradeSlug);

  if (!school || !grade) {
    return buildMetadata(
      "Pack Not Found",
      "The requested grade stationery pack could not be found.",
      "/schools"
    );
  }

  return buildMetadata(
    `${grade.grade} Stationery Pack for ${school.name}`,
    `Order a ready-to-use ${grade.grade} stationery pack for ${school.name}, prepared according to school stationery requirements and delivery planning.`,
    `/schools/${school.slug}/${grade.gradeSlug}`
  );
}

export default async function GradePackPage({ params }: GradePageProps) {
  const { schoolSlug, gradeSlug } = await params;
  const school = await getSchoolBySlug(schoolSlug);
  const grade = await getGradeBySlug(schoolSlug, gradeSlug);

  if (!school || !grade) {
    notFound();
  }

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
      <section className={page.section}>
        <GradePackDetails school={school} grade={grade} />
      </section>
    </>
  );
}
