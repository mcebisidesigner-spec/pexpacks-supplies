import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GradeSelector } from "@/components/schools/GradeSelector";
import { Button } from "@/components/ui/Button";
import { schools } from "@/data/schools";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { getSchoolBySlug } from "@/lib/school-utils";
import { JsonLd } from "@/components/ui/JsonLd";
import page from "@/styles/Page.module.css";

type SchoolPageProps = {
  params: Promise<{ schoolSlug: string }>;
};

export function generateStaticParams() {
  return schools.map((school) => ({ schoolSlug: school.slug }));
}

export async function generateMetadata({ params }: SchoolPageProps): Promise<Metadata> {
  const { schoolSlug } = await params;
  const school = getSchoolBySlug(schoolSlug);

  if (!school) {
    return buildMetadata("School Not Found", "The requested school pack could not be found.", "/schools");
  }

  return buildMetadata(
    `${school.name} School Stationery Packs`,
    `View ready-to-use stationery packs for ${school.name}, prepared by grade and matched to school stationery requirements.`,
    `/schools/${school.slug}`
  );
}

export default async function SchoolDetailPage({ params }: SchoolPageProps) {
  const { schoolSlug } = await params;
  const school = getSchoolBySlug(schoolSlug);

  if (!school) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Schools", path: "/schools" },
          { name: school.name, path: `/schools/${school.slug}` }
        ])}
      />
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>
            {school.city}, {school.province}
          </p>
          <h1>{school.name}</h1>
          <p className={page.pageHeroText}>
            Official stationery packs prepared according to the school stationery list.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div className={page.sectionInner}>
          <GradeSelector school={school} />
        </div>
      </section>
      <div className={page.darkBand}>
        <div>
          <p>Start school ready</p>
          <h2>Select the correct grade pack</h2>
        </div>
        <Button href="/order" variant="white">
          Order Now
        </Button>
      </div>
    </>
  );
}
