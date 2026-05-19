import type { Metadata } from "next";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";
import { RequestSchoolCTA } from "@/components/schools/RequestSchoolCTA";
import { ReturningParentBanner } from "@/components/schools/ReturningParentBanner";
import { RecentlyViewedSchools } from "@/components/schools/RecentlyViewedSchools";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsPageHero } from "@/components/schools/SchoolsPageHero";
import { OrderingWorksSection } from "@/components/marketing/OrderingWorksSection";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { buildMetadata } from "@/lib/seo";
import {
  getFeaturedSchoolRecords,
  getSchoolSearchOptions,
} from "@/lib/schools/schoolSearchData";
import { testimonials } from "@/data/testimonials";
import { faqs } from "@/data/faqs";
import pageStyles from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Find Your School Stationery Pack | Pexpacks",
  "Search for your school and grade to order a ready-packed stationery pack prepared according to the school stationery list.",
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

  const schoolFaqs = faqs.filter((faq) =>
    [
      "school-not-listed",
      "delivery-timing",
      "exercise-books",
      "multiple-learners",
      "school-list-submission",
    ].includes(faq.id)
  );

  return (
    <>
      <SchoolsPageHero>
        <SchoolSearchPanel
          grades={grades}
          initialQuery={firstValue(params.q) ?? ""}
          initialGrade={firstValue(params.grade) ?? "all"}
        />
      </SchoolsPageHero>
      <ReturningParentBanner />

      {featuredSchools.length > 0 && (
        <FeaturedSchoolsBanner schools={featuredSchools} />
      )}
      <RecentlyViewedSchools />
      <RequestSchoolCTA />
      <OrderingWorksSection />

      <section
        className={pageStyles.section}
        aria-labelledby="school-testimonials"
      >
        <div className={pageStyles.sectionInner}>
          <SectionHeader
            eyebrow="Trusted by parents"
            title="Hear from our parents"
            text="Read what other parents are saying about the Pexpacks experience."
            headingId="school-testimonials"
          />
          <TestimonialMarquee items={testimonials} />
        </div>
      </section>

      <section className={pageStyles.section} aria-labelledby="school-faqs">
        <div className={pageStyles.sectionInner}>
          <SectionHeader
            eyebrow="Questions and answers"
            title="Frequently asked questions"
            text="Answers for parents and schools."
            headingId="school-faqs"
          />
          <div
            style={{ maxWidth: "800px", margin: "0 auto", marginTop: "32px" }}
          >
            <FaqAccordion faqs={schoolFaqs} title="" subtitle="" />
          </div>
        </div>
      </section>
    </>
  );
}
