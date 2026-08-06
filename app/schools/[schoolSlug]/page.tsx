import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { GradeSelector } from "@/components/schools/GradeSelector";
import { Button } from "@/components/ui/Button";
import { HappyPayBanner } from "@/components/bnpl/HappyPayBanner";
import { HappyPaySteps } from "@/components/bnpl/HappyPaySteps";
import {
  getSchoolIndex,
  getSchoolRecordMap,
} from "@/data/schools";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { getSchoolBySlug } from "@/lib/school-utils";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildWhatsAppHref } from "@/data/contact";
import pageStyles from "@/styles/Page.module.css";
import styles from "./SchoolDetailPage.module.css";

// Eagerly start loading the full school records at module evaluation time,
// ahead of component rendering. This gives the 11MB dynamic import a head
// start so it's more likely to resolve before the async component's first
// `await`, avoiding a React Suspense interleave that can confuse Next.js's
// internal performance.mark/measure bookkeeping in dev / Turbopack.
getSchoolRecordMap();

type SchoolPageProps = {
  params: Promise<{ schoolSlug: string }>;
};

export const dynamicParams = true;

export const revalidate = 86400; // 24 hours

export async function generateStaticParams() {
  const schoolIndex = await getSchoolIndex();
  return schoolIndex
    .filter((school) => school.isFeatured || school.isPartnerSchool)
    .map((school) => ({
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

  const isPartner = school.isPartnerSchool;

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
        eyebrow={`${school.city}, City of ${school.metro}`}
        title={school.name}
        panelChildren={
          <div className={styles.schoolHeroPanel}>
            <div className={styles.schoolHeroCopy}>
              <span className={styles.schoolHeroLabel}>
                {isPartner ? "Prepared with care" : "Awaiting the school list"}
              </span>
              <span className={styles.schoolHeroTitle}>
                {isPartner ? "Ready packed" : "or you could send your list"}
              </span>
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

      {isPartner ? (
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
                  Add covered books and custom-printed name labels for just <strong>R 350</strong> per pack. 
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
              <GradeSelector school={school} />
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
      ) : (
        <div className={styles.unpartneredCard}>
          <div className={styles.unpartneredCardBody}>
            <span className={styles.unpartneredBadge}>Not yet an official partner</span>
            <h2 className={styles.unpartneredCardTitle}>
              {school.name}{' '}isn&apos;t partnered with Pexpacks yet.
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
      )}
    </>
  );
}
