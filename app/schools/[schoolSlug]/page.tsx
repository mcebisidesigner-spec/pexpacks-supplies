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
import type { GradePack, School } from "@/data/schools";
import { getSchoolIndex } from "@/data/schools";
import { buildMetadata } from "@/lib/seo";
import { schoolPageMultiGraphSchema } from "@/lib/schema";
import { getCachedSchoolBySlug } from "@/lib/school-utils";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildWhatsAppHref } from "@/data/contact";
import pageStyles from "@/styles/Page.module.css";
import styles from "./SchoolDetailPage.module.css";

export const revalidate = 3600; // Edge ISR cache for 1 hour, auto-revalidated on dashboard edit

type SchoolPageProps = {
  params: Promise<{ schoolSlug: string }>;
};

function formatSchoolLocation(city: string, district: string, province: string): string {
  const districtLabel = district
    ? /^city of\b/i.test(district)
      ? district
      : `City of ${district}`
    : "";

  return [city, districtLabel, province]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(", ");
}

function isHighSchoolName(name: string): boolean {
  return /high|hoërskool|secondary|college|academy/i.test(name) && !/primary/i.test(name);
}

function isPrimarySchoolName(name: string): boolean {
  return /primary|laerskool|preparatory|pre-primary/i.test(name) && !/high|hoërskool/i.test(name);
}

function getStandardGradeList(schoolName: string): string[] {
  if (isHighSchoolName(schoolName)) {
    return ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  }
  if (isPrimarySchoolName(schoolName)) {
    return ["Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
  }
  return [
    "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7",
    "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ];
}

function getNormalizedSchoolGrades(school: School): GradePack[] {
  const standardGrades = getStandardGradeList(school.name);
  const existingByLabel = new Map<string, GradePack>();

  for (const grade of school.grades || []) {
    const key = grade.grade.trim().toLowerCase();
    existingByLabel.set(key, grade);
  }

  return standardGrades.map((gradeLabel, idx) => {
    const key = gradeLabel.trim().toLowerCase();
    const existing = existingByLabel.get(key);
    if (existing) return existing;

    const slug = gradeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      id: `std-${school.id}-${slug}-${idx}`,
      grade: gradeLabel,
      gradeSlug: slug,
      price: 0,
      contents: [],
      packItems: [],
      deliveryNote: "Prepared according to official school list.",
      availability: "in-stock" as const,
    };
  });
}

export async function generateStaticParams() {
  if (process.env.NODE_ENV !== "production") return [];
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
  const school = await getCachedSchoolBySlug(schoolSlug);

  if (!school) {
    return buildMetadata(
      "School Not Found | Pexpacks Supplies",
      "The requested school stationery list could not be found.",
      "/schools",
    );
  }

  const title = `${school.name} Stationery List 2027 - Pexpacks`;
  const locationDesc = school.metro || school.city || "Gauteng";
  const description = `Get the verified 2027 stationery packs for ${school.name}, ${locationDesc}. Pre-pack customisation, direct delivery, and lay-by savings plans available.`;

  return {
    ...buildMetadata(
      title,
      description,
      `/schools/${school.slug}`,
      school.logo || undefined,
      [
        `${school.name} stationery list 2027`,
        `${school.name} stationery packs`,
        `${school.name} school supplies`,
        `${school.city} stationery`,
      ],
    ),
    title,
    description,
  };
}

export default async function SchoolDetailPage({ params }: SchoolPageProps) {
  const { schoolSlug } = await params;
  const school = await getCachedSchoolBySlug(schoolSlug);

  if (!school) {
    notFound();
  }

  const isRefused = Boolean(school.refusedPartnership);
  const gradesToRender = getNormalizedSchoolGrades(school);
  const schoolWithGrades = { ...school, grades: gradesToRender };
  const officialWebsiteUrl = school.website || `https://www.google.com/search?q=${encodeURIComponent(`${school.name} official website ${school.city}`)}`;

  return (
    <>
      <JsonLd data={schoolPageMultiGraphSchema(schoolWithGrades)} />

      <PageHero
        variant="navy"
        eyebrow={formatSchoolLocation(school.city, school.metro, school.province)}
        title={school.name}
        panelChildren={
          <div className={styles.schoolHeroCard}>
            <div className={styles.schoolHeroCardLeft}>
              <span className={styles.schoolHeroYearLabel}>
                Stationery List 2027
              </span>
              <span className={styles.schoolHeroPrepared}>
                {isRefused ? "or you could send your list" : "Prepared with care"}
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
