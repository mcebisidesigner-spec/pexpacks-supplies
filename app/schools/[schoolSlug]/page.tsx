import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { GradeSelector } from "@/components/schools/GradeSelector";
import { getSchoolIndex } from "@/data/schools";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { getSchoolBySlug } from "@/lib/school-utils";
import { JsonLd } from "@/components/ui/JsonLd";
import pageStyles from "@/styles/Page.module.css";
import styles from "./SchoolDetailPage.module.css";

type SchoolPageProps = {
  params: Promise<{ schoolSlug: string }>;
};

export const dynamicParams = true;

export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  const schoolIndex = await getSchoolIndex();
  return schoolIndex.map((school) => ({
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
      "/schools",
    );
  }

  return buildMetadata(
    `${school.name} School Stationery Packs`,
    `View ready-to-use stationery packs for ${school.name}, prepared by grade and matched to school stationery requirements.`,
    `/schools/${school.slug}`,
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
        panelChildren={
          <div className={styles.schoolHeroPanel}>
            <div className={styles.schoolHeroCopy}>
              <span className={styles.schoolHeroLabel}>Prepared with care</span>
              <span className={styles.schoolHeroTitle}>Ready packed</span>
            </div>
            <div className={styles.schoolHeroLogoWrap}>
              <Image
                src={school.logo || "/images/school-logo-placeholder.svg"}
                alt={`${school.name} logo`}
                width={136}
                height={136}
                className={styles.schoolHeroLogo}
                priority
              />
            </div>
          </div>
        }
      />
      <section className={pageStyles.section}>
        <div className={pageStyles.sectionInner}>
          <GradeSelector school={school} />
        </div>
      </section>
    </>
  );
}
