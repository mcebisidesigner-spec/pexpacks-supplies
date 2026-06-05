import type { Metadata } from "next";
import Image from "next/image";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";

import { RecentlyViewedSchools } from "@/components/schools/RecentlyViewedSchools";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsPageHero } from "@/components/schools/SchoolsPageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { LayByPromo } from "@/components/shared/LayByPromo";
import { buildMetadata } from "@/lib/seo";
import {
  getFeaturedSchoolRecords,
} from "@/lib/schools/schoolSearchData";
import { testimonials } from "@/data/testimonials";
import { faqs } from "@/data/faqs";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
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
          Order before <strong>30 September 2026</strong> for delivery before school opens in January.
        </p>
      </div>

      {featuredSchools.length > 0 && (
        <FeaturedSchoolsBanner schools={featuredSchools} />
      )}
      <RecentlyViewedSchools />

      <section
        className={sectionStyles.section}
        aria-labelledby="school-testimonials"
      >
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Trusted by parents"
            title="Hear from our parents"
            text="Read what other parents are saying about the Pexpacks experience."
            headingId="school-testimonials"
          />
          <TestimonialMarquee items={testimonials} />
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((faq) =>
          [
            "school-not-listed",
            "delivery-timing",
            "exercise-books",
            "multiple-learners",
            "school-list-submission",
          ].includes(faq.id)
        )}
      />

      <LayByPromo />
    </>
  );
}
