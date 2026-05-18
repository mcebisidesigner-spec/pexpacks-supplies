import type { Metadata } from "next";
import { FeaturedSchoolsBanner } from "@/components/schools/FeaturedSchoolsBanner";
import { BookCoveringBanner } from "@/components/schools/BookCoveringBanner";
import { RequestSchoolCTA } from "@/components/schools/RequestSchoolCTA";
import { ReturningParentBanner } from "@/components/schools/ReturningParentBanner";
import { SchoolSearchPanel } from "@/components/schools/SchoolSearchPanel";
import { SchoolsPageHero } from "@/components/schools/SchoolsPageHero";
import { RetailComparisonSlider } from "@/components/marketing/RetailComparisonSlider";
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
import styles from "@/components/schools/Schools.module.css";
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
      <BookCoveringBanner />
      <section
        className={styles.howItWorksSection}
        aria-labelledby="how-it-works-heading"
      >
        <div className={styles.howItWorksInner}>
          <div className={styles.sectionIntro}>
            <p>School-ready support</p>
            <h2 id="how-it-works-heading">How ordering works</h2>
            <span>
              Pexpacks keeps the school list searchable so parents do not need
              to scroll through hundreds of schools.{" "}
              <strong>
                The average parent saves 4 hours of driving, queuing, and
                crossing off lists.
              </strong>
            </span>
          </div>
          <div className={styles.howItWorksGrid}>
            <div className={styles.howItWorksStep}>
              <div className={styles.stepCircle}>1</div>
              <h3>Find your school</h3>
              <p>Search your child's school and select the required grade.</p>
            </div>
            <div className={styles.howItWorksStep}>
              <div className={styles.stepCircle}>2</div>
              <h3>Review the pack</h3>
              <p>
                All items perfectly match your official school stationery list.
              </p>
            </div>
            <div className={styles.howItWorksStep}>
              <div className={styles.stepCircle}>3</div>
              <h3>Delivered ready</h3>
              <p>Skip the queues and receive a complete, ready-to-go box.</p>
            </div>
          </div>
          <RetailComparisonSlider />
        </div>
      </section>

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

      <RequestSchoolCTA />

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
