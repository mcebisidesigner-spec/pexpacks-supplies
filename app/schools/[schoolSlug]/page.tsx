import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
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

export const revalidate = 300;

type SchoolPageProps = {
  params: Promise<{ schoolSlug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

function formatSchoolLocation(
  city?: string | null,
  province?: string | null,
  district?: string | null,
): string {
  const parts = [
    city ? city.trim() : "",
    province ? province.trim() : "",
    district ? district.trim() : "",
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" - ") : "South Africa";
}

import { buildTailoredPublicGrades } from "@/lib/schools/school-grade-packs";
import { getFeaturedSchoolRecords } from "@/lib/schools/schoolSearchData";

export async function generateStaticParams(): Promise<Array<{ schoolSlug: string }>> {
  try {
    const topSchools = await getFeaturedSchoolRecords(24);
    return topSchools.map((school) => ({
      schoolSlug: school.slug,
    }));
  } catch {
    return [];
  }
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

  // Canonical 301 permanent redirect if accessed via alias / suffix variation (e.g. Google index legacy URLs)
  if (school.slug !== schoolSlug) {
    permanentRedirect(`/schools/${school.slug}`);
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
        eyebrow={formatSchoolLocation(
          school.city,
          school.province,
          school.district || school.metro,
        )}
        title={school.name}
        panelChildren={
          <div className="bg-card border border-pex-border rounded-card md:rounded-[28px] p-5 sm:p-6 md:p-[24px_28px] shadow-card flex items-center justify-between gap-4 md:gap-[clamp(16px,3vw,28px)]">
            <div className="flex flex-col min-w-0">
              <span className="text-pex-navy font-bold text-base sm:text-lg leading-[1.2]">
                Stationery List {season.academicYear}
              </span>
              <span className="text-pex-navy font-heading text-xl sm:text-[clamp(20px,2.5vw,26px)] font-bold leading-[1.2] mt-1">
                {isRefused ? "Non-partner" : "Prepared with care"}
              </span>
              <a
                href={officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-pex-keppel hover:text-pex-keppel/80 text-sm font-bold no-underline transition-all hover:translate-x-0.5 w-fit"
              >
                Visit School Website
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3.5 h-3.5 stroke-current stroke-[2.2] fill-none">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </a>
            </div>
            <div className="w-[76px] h-[76px] sm:w-[clamp(80px,10vw,100px)] sm:h-[clamp(80px,10vw,100px)] rounded-2xl sm:rounded-[20px] bg-pex-bg-soft grid place-items-center p-2 sm:p-2.5 shrink-0">
              {school.logo ? (
                <Image
                  src={school.logo}
                  alt={`${school.name} crest`}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain block"
                  priority
                />
              ) : (
                <SchoolLogoPlaceholder
                  className="w-full h-full object-contain block"
                  title={`${school.name} logo`}
                />
              )}
            </div>
          </div>
        }
      />

      {isRefused ? (
        <div className="w-full max-w-[var(--content-max-width)] mx-auto px-4 md:px-8 pt-6 sm:pt-10">
          <div className="py-6 px-5 sm:p-11 sm:px-10 rounded-card lg:rounded-3xl bg-gradient-to-br from-pex-navy to-[#0f1e30] text-white text-center">
            <span className="inline-block mb-3.5 px-3.5 py-1 rounded-full bg-pex-coral/15 text-pex-coral text-xs font-extrabold uppercase tracking-wider">
              Not yet an official partner
            </span>
            <h2 className="m-0 mb-3.5 font-heading text-2xl sm:text-[clamp(24px,3.2vw,34px)] font-extrabold leading-[1.1]">
              {`${school.name} isn't partnered with Pexpacks yet.`}
            </h2>
            <p className="max-w-[520px] mx-auto mb-7 text-white/80 text-[clamp(15px,1.6vw,17px)] leading-[1.6]">
              You can still order — upload your child&apos;s stationery list and
              we&apos;ll pack it for you.
            </p>

            <div className="flex flex-wrap justify-center gap-3.5">
              <Button href="/order" variant="primary">
                Upload Stationery List
              </Button>
              <Button
                href={buildWhatsAppHref(
                  `Hi Pexpacks, I'd like to send my ${school.name} stationery list.`,
                )}
                variant="outline"
                className="!border-white/50 !bg-white/10 !text-white hover:!bg-white/20 hover:!border-white/80"
              >
                Send List on WhatsApp
              </Button>
            </div>
          </div>

          <div className="mt-5 p-6 border border-pex-border rounded-card bg-card shadow-sm text-center">
            <h3 className="m-0 mb-2 text-pex-navy font-heading text-lg sm:text-[clamp(18px,2vw,22px)] font-extrabold leading-[1.15]">
              Want to add {school.name} as a partner?
            </h3>
            <p className="max-w-[480px] mx-auto mb-5 text-pex-muted text-[15px] leading-[1.5]">
              Encourage the school to list with us so parents can order
              grade-specific packs directly.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
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
          <div className="w-full max-w-[var(--content-max-width)] mx-auto px-4 md:px-8 pt-5">
            <p className="m-0 py-3 px-4.5 rounded-field bg-pex-bg-mint text-pex-navy text-sm font-semibold leading-[1.5]">
              Every pack is an exact 100% match to {school.name}&apos;s official
              requirements. Simply select your grade, and you can easily add or
              minus quantities of the required items before checkout.
            </p>
          </div>

          {/* Subtle Pexcover Advertisement Banner */}
          <div className="w-full max-w-[var(--content-max-width)] mx-auto px-4 md:px-8 pt-5 sm:pt-6 md:pt-10">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-5 items-stretch md:items-start p-5 bg-pex-bg-soft border border-pex-border rounded-card hover:border-pex-keppel hover:shadow-[0_10px_30px_rgba(26,42,64,0.04)] transition-all duration-200">
              <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-pex-bg-mint text-pex-keppel grid place-items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="m-0 mb-1.5 text-pex-navy font-heading text-lg font-black leading-[1.25]">
                  Simplify prep with Pexcover book covering
                </h4>
                <p className="m-0 mb-3 text-pex-muted text-sm leading-[1.5]">
                  Add covered books and custom-printed name labels for as little
                  as <strong>R200</strong>, depending on the pack items. We
                  cover the books and print matching labels so your child is
                  first-day ready.
                </p>
                <Link
                  href="/blog/what-is-pexcover-book-covering"
                  className="inline-flex items-center text-pex-coral hover:text-pex-navy text-sm font-extrabold no-underline hover:underline transition-colors"
                >
                  Learn how Pexcover works &rarr;
                </Link>
              </div>
            </div>
          </div>

          <section className="py-8 sm:py-12 md:py-16">
            <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
              <GradeSelector school={schoolWithGrades} />
            </div>
          </section>

          <section className="py-8 sm:py-12 md:py-16">
            <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8">
              <HappyPayBanner variant="schoolPage" />
              <div className="mt-5">
                <HappyPaySteps />
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}

