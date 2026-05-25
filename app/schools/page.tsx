import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";
import Link from "next/link";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";

import { RequestSchoolCTA } from "@/components/schools/RequestSchoolCTA";
import { RecentlyViewedSchools } from "@/components/schools/RecentlyViewedSchools";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsPageHero } from "@/components/schools/SchoolsPageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { LayByPromo } from "@/components/shared/LayByPromo";
import { MobileStickyCta } from "@/components/shared/MobileStickyCta";
import { FindSchoolBar } from "@/components/schools/FindSchoolBar";
import { buildMetadata } from "@/lib/seo";
import {
  getFeaturedSchoolRecords,
  getSchoolSearchOptions,
} from "@/lib/schools/schoolSearchData";
import { homepagePacks } from "@/data/packs";
import { testimonials } from "@/data/testimonials";
import { faqs } from "@/data/faqs";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import heroStyles from "@/components/marketing/HeroBase.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";

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
  const { grades } = getSchoolSearchOptions();
  const featuredSchools = getFeaturedSchoolRecords();

  return (
    <>
      <div id="schools-search">
        <SchoolsPageHero>
        <SchoolSearchPanel
          grades={grades}
          initialQuery={firstValue(params.q) ?? ""}
          initialGrade={firstValue(params.grade) ?? "all"}
        />
      </SchoolsPageHero>
      </div>

      {featuredSchools.length > 3 ? (
        <div className={sectionStyles.trendingPills}>
          <span className={sectionStyles.trendingLabel}>Trending:</span>
          <div className={sectionStyles.pillRow}>
            {featuredSchools.slice(0, 6).map((school) => (
              <Link
                key={school.slug}
                href={`/schools/${school.slug}`}
                className={sectionStyles.trendingPill}
              >
                {school.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Standard packs"
            title="Packs by grade"
            text="Choose a standard grade pack if your school isn't listed or you know exactly what you need."
            headingId="school-grade-packs"
          />
          <div className={cardStyles.packGrid}>
            {homepagePacks.map((pack, idx) => (
              <div className={`${cardStyles.packCard} ${idx === 1 ? cardStyles.packCardFeatured : ""}`} key={pack.id}>
                {idx === 1 ? <div className={cardStyles.packCardAccent} /> : null}
                {idx === 1 ? <span className={cardStyles.popularPill}>Most popular</span> : null}
                <div
                  className={`${cardStyles.packMedia} ${pack.id === "primary-school-pack" ? cardStyles.packMediaGreen : cardStyles.packMediaBlue}`}
                  aria-hidden="true"
                >
                  <span>{pack.subcategory ?? pack.category}</span>
                </div>
                <div className={cardStyles.packCardHead}>
                  <span className={heroStyles.eyebrow}>
                    {pack.category}
                    {idx === 1 ? <span className={cardStyles.mostOrderedBadge}>Most ordered</span> : null}
                  </span>
                  <h3>{pack.name}</h3>
                </div>
                <div className={cardStyles.packCardBody}>
                  <p className={cardStyles.packDescription}>
                    {pack.description}
                  </p>
                  <div className={cardStyles.packMetaRow}>
                    <span className={cardStyles.priceBadge}>
                      {pack.priceLabel}
                    </span>
                    <span
                      className={cardStyles.quickListPreview}
                      tabIndex={0}
                      aria-label={`${pack.name} quick list preview: ${pack.includes.join(", ")}`}
                    >
                      Quick list preview
                      <span className={cardStyles.quickListTooltip} role="tooltip">
                        {pack.includes.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </span>
                    </span>
                  </div>
                </div>
                <div className={cardStyles.packCardButtonWrap}>
                  <Button
                    href={pack.href}
                    variant="primary"
                    className={cardStyles.fullWidthButton}
                  >
                    {pack.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <RequestSchoolCTA />

      <CTASection
        eyebrow="Ready to order"
        title="Find your school pack now."
        text="Search for your school or choose a standard grade pack. Either way, your stationery is handled."
        primaryHref="/foundation-phase"
        primaryLabel="Order a Standard Pack"
        secondaryHref="#schools-search"
        secondaryLabel="Search for Your School"
      />

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
        eyebrow="Questions and answers"
        title="Frequently asked questions"
      />

      <LayByPromo />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Business supplies</p>
              <h2>Need office stationery?</h2>
              <p>
                Pexpacks prepares practical office packs for SMEs, home offices, freelancers, and small teams &mdash; with custom quotes and bulk pricing.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/office" variant="primary">View Office Packs</Button>
                <Button href="/office#contact-enquiry" variant="white">Request a Quote</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Business Starter Brand Package</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Launch with a professional identity &mdash; logo, business cards, flyers, letterhead, and a 5-page website hosted free for 12 months.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/business-starter-brand-package" className={cardStyles.cardLink}>
                  View package &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MobileStickyCta />
      <FindSchoolBar />
    </>
  );
}
