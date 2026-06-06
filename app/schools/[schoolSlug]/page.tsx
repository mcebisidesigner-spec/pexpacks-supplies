import type { Metadata } from "next";
import Link from "next/link";
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
      {/* Subtle Pexcover Advertisement Banner */}
      <div className={styles.pexcoverBannerOuter}>
        <div className={styles.pexcoverBanner}>
          <div className={styles.pexcoverBannerIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className={styles.pexcoverBannerContent}>
            <h4 className={styles.pexcoverBannerTitle}>Simplify prep with Pexcover book covering</h4>
            <p className={styles.pexcoverBannerText}>
              Add covered books and custom-printed name labels for just <strong>R 350</strong> per pack. 
              We cover the books and print matching labels so your child is first-day ready.
            </p>
            <Link href="/blog/what-is-pexcover-book-covering" className={styles.pexcoverBannerLink}>
              Learn how Pexcover works &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.searchMicroCopy}>
        <p>
          Every pack is an exact 100% match to {school.name}&apos;s official requirements. Simply select your grade, and you can easily add or minus quantities of the required items before checkout.
        </p>
      </div>

      <section className={pageStyles.section}>
        <div className={pageStyles.sectionInner}>
          <GradeSelector school={school} />
        </div>
      </section>
    </>
  );
}
