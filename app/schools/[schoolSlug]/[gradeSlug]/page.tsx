import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GradePackDetails } from "@/components/schools/GradePackDetails";
import { JsonLd } from "@/components/ui/JsonLd";
import { schools } from "@/data/schools";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";
import { getGradeBySlug, getSchoolBySlug } from "@/lib/school-utils";
import page from "@/styles/Page.module.css";

type GradePageProps = {
  params: Promise<{ schoolSlug: string; gradeSlug: string }>;
};

export function generateStaticParams() {
  return schools.flatMap((school) =>
    school.grades.map((grade) => ({
      schoolSlug: school.slug,
      gradeSlug: grade.gradeSlug
    }))
  );
}

export async function generateMetadata({ params }: GradePageProps): Promise<Metadata> {
  const { schoolSlug, gradeSlug } = await params;
  const school = getSchoolBySlug(schoolSlug);
  const grade = getGradeBySlug(schoolSlug, gradeSlug);

  if (!school || !grade) {
    return buildMetadata("Pack Not Found", "The requested grade stationery pack could not be found.", "/schools");
  }

  return buildMetadata(
    `${school.name} ${grade.grade} Pack`,
    `Order the ${school.name} ${grade.grade} stationery pack prepared by Pexpacks Supplies.`,
    `/schools/${school.slug}/${grade.gradeSlug}`
  );
}

export default async function GradePackPage({ params }: GradePageProps) {
  const { schoolSlug, gradeSlug } = await params;
  const school = getSchoolBySlug(schoolSlug);
  const grade = getGradeBySlug(schoolSlug, gradeSlug);

  if (!school || !grade) {
    notFound();
  }

  return (
    <>
      <JsonLd data={productJsonLd(school, grade)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Schools", path: "/schools" },
          { name: school.name, path: `/schools/${school.slug}` },
          { name: grade.grade, path: `/schools/${school.slug}/${grade.gradeSlug}` }
        ])}
      />
      <section className={page.section}>
        <GradePackDetails school={school} grade={grade} />
      </section>
    </>
  );
}
