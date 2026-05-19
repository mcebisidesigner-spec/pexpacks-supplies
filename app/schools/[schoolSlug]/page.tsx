import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GradeSelector } from "@/components/schools/GradeSelector";
import { MultiLearnerBanner } from "@/components/schools/MultiLearnerBanner";
import { PageHero } from "@/components/marketing/PageHero";
import { getSchoolIndex } from "@/data/schools";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { getSchoolBySlug } from "@/lib/school-utils";
import { ViralReferralBanner } from "@/components/schools/ViralReferralBanner";
import { JsonLd } from "@/components/ui/JsonLd";
import page from "@/styles/Page.module.css";

type SchoolPageProps = {
  params: Promise<{ schoolSlug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return getSchoolIndex().map((school) => ({
    schoolSlug: school.slug,
  }));
}

export async function generateMetadata({
  params,
}: SchoolPageProps): Promise<Metadata> {
  const { schoolSlug } = await params;
  const school = await getSchoolBySlug(schoolSlug);

  if (!school) {
    return buildMetadata(
      "School Not Found",
      "The requested school pack could not be found.",
      "/schools"
    );
  }

  return buildMetadata(
    `${school.name} School Stationery Packs`,
    `View ready-to-use stationery packs for ${school.name}, prepared by grade and matched to school stationery requirements.`,
    `/schools/${school.slug}`
  );
}

export default async function SchoolDetailPage({ params }: SchoolPageProps) {
  const { schoolSlug } = await params;
  const school = await getSchoolBySlug(schoolSlug);

  if (!school) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Schools", path: "/schools" },
          { name: school.name, path: `/schools/${school.slug}` },
        ])}
      />
      <PageHero
        eyebrow={`${school.city}, ${school.province}`}
        title={school.name}
        text="Official stationery packs prepared according to the school stationery list."
        panelTitle="Ready packed"
        panelText="Prepared for your grade."
      />
      <section className={page.section}>
        <div className={page.sectionInner}>
          {school.grades.length > 1 && <MultiLearnerBanner />}
          <GradeSelector school={school} />
        </div>
      </section>
      
      {/* Viral Referral for Engagement */}
      <ViralReferralBanner />
    </>
  );
}
