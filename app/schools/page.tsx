import type { Metadata } from "next";
import Image from "next/image";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";

import { RecentlyViewedSchools } from "@/components/schools/RecentlyViewedSchools";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsPageHero } from "@/components/schools/SchoolsPageHero";
import { ConciergeSection } from "@/components/marketing/ConciergeSection";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { buildMetadata } from "@/lib/seo";
import {
  getFeaturedSchoolRecords,
} from "@/lib/schools/schoolSearchData";
import { faqs } from "@/data/faqs";
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

      <div className={homeStyles.howItWorks}>
        <div className={homeStyles.howItWorksInner}>
          <div className={homeStyles.howItWorksStep}>
            <div className={homeStyles.howItWorksIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div className={homeStyles.howItWorksStepContent}>
              <span className={homeStyles.howItWorksStepTitle}>Find your school</span>
              <span className={homeStyles.howItWorksStepDesc}>Search our directory of SA schools</span>
            </div>
          </div>
          <div className={homeStyles.howItWorksArrow}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
          <div className={homeStyles.howItWorksStep}>
            <div className={homeStyles.howItWorksIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>
            <div className={homeStyles.howItWorksStepContent}>
              <span className={homeStyles.howItWorksStepTitle}>Add or remove items</span>
              <span className={homeStyles.howItWorksStepDesc}>Customise quantities before checkout</span>
            </div>
          </div>
          <div className={homeStyles.howItWorksArrow}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
          <div className={homeStyles.howItWorksStep}>
            <div className={homeStyles.howItWorksIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className={homeStyles.howItWorksStepContent}>
              <span className={homeStyles.howItWorksStepTitle}>We pack &amp; deliver</span>
              <span className={homeStyles.howItWorksStepDesc}>Straight to your door, term-ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className={homeStyles.brandMarquee}>
        <div className={homeStyles.brandMarqueeTrack}>
          {[
            "croxley", "bic", "pilot", "pritt", "staedtler",
            "post-it", "bantex", "freedom",
            "casio", "marlin", "pentel", "rapid", "rexel",
            "sellotape", "stabilo", "starpie",
            "croxley", "bic", "pilot", "pritt", "staedtler",
            "post-it", "bantex", "freedom",
            "casio", "marlin", "pentel", "rapid", "rexel",
            "sellotape", "stabilo", "starpie",
          ].map((brand, i) => (
            <span key={i} className={homeStyles.brandChip}>
              <Image
                src={`/images/stationery-brands/${brand}.svg`}
                alt={`${brand} logo`}
                width={80}
                height={40}
                style={{ objectFit: "contain", display: "block" }}
              />
            </span>
          ))}
        </div>
      </div>

      <div className={homeStyles.urgencyBar}>
        <p>
          Order by <strong>30th October</strong> for delivery before school opens in January.
        </p>
      </div>

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

      <section className={homeStyles.accordionSection} aria-label="Frequently asked questions before ordering">
        <div className={homeStyles.accordionInner}>
          <details className={homeStyles.accordionItem} name="schools-faq">
            <summary className={homeStyles.accordionSummary}>
              Are these lists for the upcoming 2027 academic year?
            </summary>
            <p className={homeStyles.accordionAnswer}>
              Yes, updated directly from the school.
            </p>
          </details>
          <details className={homeStyles.accordionItem} name="schools-faq">
            <summary className={homeStyles.accordionSummary}>
              Do I have to buy the whole pack?
            </summary>
            <p className={homeStyles.accordionAnswer}>
              No, click your school and use our system to minus what you already have.
            </p>
          </details>
          <details className={homeStyles.accordionItem} name="schools-faq">
            <summary className={homeStyles.accordionSummary}>
              Are the brands high quality?
            </summary>
            <p className={homeStyles.accordionAnswer}>
              Yes, we use teacher-approved brands.
            </p>
          </details>
        </div>
      </section>

      <ConciergeSection />

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["school-not-listed", "delivery-timing", "exercise-books", "payment-flow", "find-grade-pack"].includes(f.id)
        )}
      />
    </>
  );
}
