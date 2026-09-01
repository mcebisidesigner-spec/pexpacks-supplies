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

export const revalidate = 300;

export default async function SchoolsPage() {
  const featuredSchools = await getFeaturedSchoolRecords();

  return (
    <>
      <div id="schools-search">
        <PageHero
          eyebrow="Pack finder"
          title="Find your pack"
          panelTitle="Fast delivery anywhere in Gauteng"
          panelText="Each pack is packed according to your&nbsp; school&rsquo;s official stationery list."
          panelClassName={heroStyles.heroPanelSearchAligned}
        >
          <SchoolSearchPanel readQueryFromUrl />
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
