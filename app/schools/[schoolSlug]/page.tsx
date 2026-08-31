import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { GradeSelector } from "@/components/schools/GradeSelector";
import { SchoolLogoPlaceholder } from "@/components/schools/SchoolLogoPlaceholder";
import { Button } from "@/components/ui/Button";
import { HappyPayBanner } from "@/components/bnpl/HappyPayBanner";
import { HappyPaySteps } from "@/components/bnpl/HappyPaySteps";
import { buildMetadata } from "@/lib/seo";
import { schoolPageMultiGraphSchema } from "@/lib/schema";
import { getCachedSchoolBySlug } from "@/lib/school-utils";
import { getActivePublicSeason } from "@/lib/public-data/seasons";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildWhatsAppHref } from "@/data/contact";
import pageStyles from "@/styles/Page.module.css";
import styles from "./SchoolDetailPage.module.css";

export const dynamicParams = true;
export const revalidate = 3600; // Edge ISR cache for 1 hour, auto-revalidated on dashboard edit

type SchoolPageProps = {
  params: Promise<{ schoolSlug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function formatSchoolLocation(city?: string | null, province?: string | null, district?: string | null): string {
  const parts = [
    city ? city.trim() : "",
    province ? province.trim() : "",
    district ? district.trim() : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" - ") : "South Africa";
}

import { buildTailoredPublicGrades } from "@/lib/schools/school-grade-packs";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: SchoolPageProps): Promise<Metadata> {
  const { schoolSlug } = await params;
  const [school, season] = await Promise.all([
    getCachedSchoolBySlug(schoolSlug),
    getActivePublicSeason(),
  ]);

  if (!school) {
    return buildMetadata(
      "School Not Found | Pexpacks Supplies",
      "The requested school stationery list could not be found.",
      "/schools",
    );
  }

  const year = season.academicYear;
  const title = `${school.name} Stationery List ${year} - Pexpacks`;
  const locationDesc = school.metro || school.city || "Gauteng";
  const description = `Get the verified ${year} stationery packs for ${school.name}, ${locationDesc}. Pre-pack customisation, direct delivery, and lay-by savings plans available.`;

  return {
    ...buildMetadata(
      title,
      description,
      `/schools/${school.slug}`,
      school.logo || undefined,
      [
        `${school.name} stationery list ${year}`,
        `${school.name} stationery packs`,
        `${school.name} school supplies`,
        `${school.city} stationery`,
      ],
    ),
    title,
    description,
  };
}

export default async function SchoolDetailPage({
  params,
  searchParams,
}: SchoolPageProps) {
  const { schoolSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const isPreviewUnpartnered =
    resolvedSearchParams?.unpartnered === "true" ||
    resolvedSearchParams?.preview === "unpartnered" ||
    resolvedSearchParams?.status === "not-yet-partner";

  const [school, season] = await Promise.all([
    getCachedSchoolBySlug(schoolSlug),
    getActivePublicSeason(),
  ]);

  if (!school) {
    notFound();
  }

  const isRefused =
    Boolean(school.refusedPartnership) ||
    school.partnership === "refused_partner" ||
    isPreviewUnpartnered;
  const gradesToRender = buildTailoredPublicGrades(school, school.grades);
  const schoolWithGrades = { ...school, grades: gradesToRender };
  const websiteRaw = school.website?.trim();
  const officialWebsiteUrl = websiteRaw
    ? /^https?:\/\//i.test(websiteRaw)
      ? websiteRaw
      : `https://${websiteRaw}`
    : `https://www.google.com/search?q=${encodeURIComponent(`${school.name} official website ${school.city}`)}`;

  return (
    <>
      <JsonLd data={schoolPageMultiGraphSchema(schoolWithGrades)} />

      <PageHero
        variant="navy"
        eyebrow={formatSchoolLocation(school.city, school.province, school.district || school.metro)}
        title={school.name}
        panelChildren={
          <div className={styles.schoolHeroCard}>
            <div className={styles.schoolHeroCardLeft}>
              <span className={styles.schoolHeroYearLabel}>
                Stationery List {season.academicYear}
              </span>
              <span className={styles.schoolHeroPrepared}>
                {isRefused ? "Non-partner" : "Prepared with care"}
              </span>
              <a
                href={officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.schoolHeroWebsiteLink}
              >
                Visit School Website
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            </div>
            <div className={styles.schoolHeroLogoBox}>
              {school.logo ? (
                <Image
                  src={school.logo}
                  alt={`${school.name} crest`}
                  width={96}
                  height={96}
                  className={styles.schoolHeroLogo}
                  priority
                />
              ) : (
                <SchoolLogoPlaceholder
                  className={styles.schoolHeroLogo}
                  title={`${school.name} logo`}
                />
              )}
            </div>
          </div>
        }
      />

      {isRefused ? (
        <div className={styles.unpartneredCard}>
          <div className={styles.unpartneredCardBody}>
            <span className={styles.unpartneredBadge}>Not yet an official partner</span>
            <h2 className={styles.unpartneredCardTitle}>
              {`${school.name} isn't partnered with Pexpacks yet.`}
            </h2>
            <p className={styles.unpartneredCardText}>
              You can still order — upload your child&apos;s stationery list and we&apos;ll pack it for you.
            </p>

            <div className={styles.unpartneredCardActions}>
              <Button href="/order" variant="primary">
                Upload Stationery List
              </Button>
              <Button href={buildWhatsAppHref(`Hi Pexpacks, I'd like to send my ${school.name} stationery list.`)} variant="outline">
                Send List on WhatsApp
              </Button>
            </div>
          </div>

          <div className={styles.unpartneredCardSecondary}>
            <h3>Want to add {school.name} as a partner?</h3>
            <p>Encourage the school to list with us so parents can order grade-specific packs directly.</p>
            <div className={styles.unpartneredCardSecondaryActions}>
              <Button
                href={`https://wa.me/?text=${encodeURIComponent(`Hi Principal, please partner with Pexpacks so we can order our stationery packs online. https://pexpacks.co.za/partnership`)}`}
                variant="outline"
              >
                Send to your Principal
              </Button>
              <Button href="/add-your-school" variant="outline">
                Submit School Partnership Request
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.searchMicroCopy}>
            <p>
              Every pack is an exact 100% match to {school.name}&apos;s official requirements. Simply select your grade, and you can easily add or minus quantities of the required items before checkout.
            </p>
          </div>

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
                  Add covered books and custom-printed name labels for as little as <strong>R200</strong>, depending on the pack items. 
                  We cover the books and print matching labels so your child is first-day ready.
                </p>
                <Link href="/blog/what-is-pexcover-book-covering" className={styles.pexcoverBannerLink}>
                  Learn how Pexcover works &rarr;
                </Link>
              </div>
            </div>
          </div>

          <section className={pageStyles.section}>
            <div className={pageStyles.sectionInner}>
              <GradeSelector school={schoolWithGrades} />
            </div>
          </section>

          <section className={pageStyles.section}>
            <div className={pageStyles.sectionInner}>
              <HappyPayBanner variant="schoolPage" />
              <div style={{ marginTop: 20 }}>
                <HappyPaySteps />
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
