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
