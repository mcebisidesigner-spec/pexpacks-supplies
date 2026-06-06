import type { Metadata } from "next";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";

import { RecentlyViewedSchools } from "@/components/schools/RecentlyViewedSchools";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsFaqAccordion } from "@/components/schools/SchoolsFaqAccordion";
import { SchoolsHowItWorks } from "@/components/schools/SchoolsHowItWorks";
import { SchoolsPageHero } from "@/components/schools/SchoolsPageHero";
import { ConciergeSection } from "@/components/marketing/ConciergeSection";
import { buildMetadata } from "@/lib/seo";
import {
  getFeaturedSchoolRecords,
} from "@/lib/schools/schoolSearchData";
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
        <SchoolsPageHero>
        <SchoolSearchPanel
          initialQuery={firstValue(params.q) ?? ""}
        />
      </SchoolsPageHero>
      </div>

      <SchoolsHowItWorks className={homeStyles.schoolsHowItWorksDesktop} />

      {featuredSchools.length > 0 && (
        <FeaturedSchoolsBanner schools={featuredSchools} />
      )}
      <RecentlyViewedSchools />

      <div className={homeStyles.paymentRow}>
        <div className={homeStyles.paymentRowInner}>
          <span className={homeStyles.paymentTagline}>Lock in 2026 prices &middot; Pay on delivery &middot; Lay-by available</span>
          <div className={homeStyles.paymentLogos}>
            <span className={homeStyles.paymentChip} title="Payflex">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="3" fill="#0B4EA2" />
                <path d="M7 12h3M14 12h3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Payflex
            </span>
            <span className={homeStyles.paymentChip} title="Ozow">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="3" fill="#231F20" />
                <path d="M8 10v4M12 9v6M16 11v3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Ozow
            </span>
            <span className={homeStyles.paymentChip} title="SnapScan">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <rect width="24" height="24" rx="6" fill="#1CA9E5" />
                <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="2.5" />
                <circle cx="12" cy="12" r="2.5" fill="#fff" />
                <path d="M12 6.5v2.5M12 15v2.5M6.5 12h2.5M15 12h2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              SnapScan
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

      <SchoolsFaqAccordion />

      <ConciergeSection />
    </>
  );
}
