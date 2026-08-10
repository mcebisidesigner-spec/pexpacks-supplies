import type { Metadata } from "next";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";
import { RecentlyViewedSchools } from "@/components/schools/RecentlyViewedSchools";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsFaqAccordion } from "@/components/schools/SchoolsFaqAccordion";
import { SchoolsHowItWorks } from "@/components/schools/SchoolsHowItWorks";
import { ConciergeSection } from "@/components/marketing/ConciergeSection";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import { HappyPayBanner } from "@/components/bnpl/HappyPayBanner";
import { HappyPaySteps } from "@/components/bnpl/HappyPaySteps";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import {
  getFeaturedSchoolRecords,
} from "@/lib/schools/schoolSearchData";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import homeStyles from "@/components/marketing/MarketingHome.module.css";

export const metadata: Metadata = buildMetadata(
  "Find Your School Stationery Pack | Pexpacks",
  "Find your child's school and grade to order a ready-packed stationery kit, prepared exactly to their official school stationery list and delivered to your door.",
  "/schools"
);

type SchoolsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  const params = searchParams ? await searchParams : {};
  const featuredSchools = await getFeaturedSchoolRecords();

  return (
    <>
      <div id="schools-search">
        <PageHero
          eyebrow="Pack finder"
          title="Find your school pack"
          panelClassName={heroStyles.heroPanelSearchAligned}
          panelChildren={
            <>
              <div>
                <p>
                  Each stationery pack is thoughtfully assembled in accordance
                  with your school&apos;s official stationery list.
                </p>
                <p style={{ marginTop: 20 }}>
                  Ensuring that every item you receive is tailored to meet the
                  specific requirements for your school curriculum.
                </p>
              </div>
              <strong>Fast delivery anywhere in Gauteng</strong>
            </>
          }
        >
          <SchoolSearchPanel
            initialQuery={firstValue(params.q) ?? ""}
          />
        </PageHero>
      </div>

      <RecentlyViewedSchools />

      <SchoolsHowItWorks className={homeStyles.schoolsHowItWorksDesktop} />

      {featuredSchools.length > 0 && (
        <FeaturedSchoolsBanner schools={featuredSchools} />
      )}

      <ConciergeSection />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <HappyPayBanner variant="schoolPage" />
          <div style={{ marginTop: 20 }}>
            <HappyPaySteps />
          </div>
        </div>
      </section>

      <div className={homeStyles.paymentRow}>
        <div className={homeStyles.paymentRowInner}>
          <span className={homeStyles.paymentTagline}>Lock in 2026 prices &middot; Buy Now Pay Later</span>
          <div className={homeStyles.paymentLogos}>
            <span className={homeStyles.paymentChip} title="Ozow">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="3" fill="#231F20" />
                <path d="M8 10v4M12 9v6M16 11v3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Ozow
            </span>
            <span className={homeStyles.paymentChip} title="Instant EFT">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Instant EFT
            </span>
          </div>
        </div>
      </div>

      <SchoolsFaqAccordion className={homeStyles.schoolsAccordionBeforeRating} />
    </>
  );
}
