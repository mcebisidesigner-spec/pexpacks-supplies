import type { Metadata } from "next";
import { PackCard } from "@/components/marketing/PackCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { BookCoveringBanner } from "@/components/schools/BookCoveringBanner";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import { buildMetadata } from "@/lib/seo";
import { homepagePacks } from "@/data/packs";
import { testimonials } from "@/data/testimonials";
import { faqs } from "@/data/faqs";
import pageStyles from "@/styles/Page.module.css";
import styles from "@/components/schools/Schools.module.css";

export const metadata: Metadata = buildMetadata(
  "Standard Stationery Packs | Pexpacks",
  "Buy standard grade-appropriate stationery packs for Foundation Phase, Primary School, and High School learners. Perfect when you can't find your exact school list.",
  "/standard-packs",
);

export default function StandardPacksPage() {
  const genericFaqs = faqs.filter((faq) =>
    ["delivery-timing", "exercise-books", "multiple-learners", "payment-flow"].includes(faq.id),
  );

  return (
    <>
      <section className={pageStyles.pageHero}>
        <div className={pageStyles.pageHeroNarrow}>
          <p>Standard Packs</p>
          <h1>Skip the list. Buy the standard.</h1>
          <p className={pageStyles.pageHeroText}>
            Can&apos;t find your specific school list? Our standard phase packs are pre-configured with 90% of the typical items required by South African curriculums for each grade phase.
          </p>
        </div>
      </section>

      <section className={pageStyles.section} aria-labelledby="standard-packs-heading">
        <div className={pageStyles.sectionInner}>
          <div className={pageStyles.cardGrid}>
            {homepagePacks.map((pack) => (
              <PackCard 
                key={pack.id} 
                pack={{ ...pack, href: `/order?generic=true&phase=${pack.subcategory}`, cta: "Order this pack" }} 
              />
            ))}
          </div>
        </div>
      </section>

      <section
        className={styles.howItWorksSection}
        aria-labelledby="how-it-works-heading">
        <div className={styles.howItWorksInner}>
          <div className={styles.sectionIntro}>
            <p>Why Standard Packs?</p>
            <h2 id="how-it-works-heading">The fastest way to get ready</h2>
            <span>
              If you don't have time to wait for a custom school list, our standard packs cover the essentials. <strong>The average parent saves 4 hours of driving, queuing, and crossing off lists.</strong>
            </span>
          </div>
          <div className={styles.howItWorksGrid}>
            <div className={styles.howItWorksStep}>
              <div className={styles.stepCircle}>1</div>
              <h3>Choose a phase</h3>
              <p>Select Foundation, Primary, or High School based on your child's age.</p>
            </div>
            <div className={styles.howItWorksStep}>
              <div className={styles.stepCircle}>2</div>
              <h3>We pack the basics</h3>
              <p>
                Each box is packed with standard curriculum-approved pens, pencils, glue, and books.
              </p>
            </div>
            <div className={styles.howItWorksStep}>
              <div className={styles.stepCircle}>3</div>
              <h3>Delivered ready</h3>
              <p>Skip the queues and receive a complete, ready-to-use box.</p>
            </div>
          </div>
        </div>
      </section>

      <BookCoveringBanner />

      <section
        className={pageStyles.section}
        aria-labelledby="school-testimonials">
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

      <section
        className={pageStyles.section}
        style={{ background: "var(--pex-bg)" }}
        aria-labelledby="school-faqs">
        <div className={pageStyles.sectionInner}>
          <SectionHeader
            eyebrow="Questions and answers"
            title="Frequently asked questions"
            text="Answers for parents and schools."
            headingId="school-faqs"
          />
          <div
            style={{ maxWidth: "800px", margin: "0 auto", marginTop: "32px" }}>
            <FaqAccordion faqs={genericFaqs} title="" subtitle="" />
          </div>
        </div>
      </section>
    </>
  );
}
