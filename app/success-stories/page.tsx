import { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { successStories } from "@/data/successStories";
import styles from "./SuccessStories.module.css";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(
  "Partner Success Stories",
  "See how PexPacks helps schools across South Africa streamline their back-to-school stationery logistics.",
  "/success-stories"
);

function QuoteIcon() {
  return (
    <svg className={styles.quoteIcon} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.017 21L16.09 14.314C16.324 13.567 16.5 12.871 16.5 12.226C16.5 10.985 16.036 10.027 15.109 9.35C14.181 8.673 12.977 8.334 11.496 8.334V3C14.364 3 16.657 3.791 18.375 5.372C20.092 6.953 20.951 9.066 20.951 11.71C20.951 13.042 20.697 14.475 20.19 16.01L17.706 21H14.017ZM3.521 21L5.594 14.314C5.828 13.567 6.004 12.871 6.004 12.226C6.004 10.985 5.54 10.027 4.613 9.35C3.685 8.673 2.481 8.334 1 8.334V3C3.868 3 6.161 3.791 7.879 5.372C9.596 6.953 10.455 9.066 10.455 11.71C10.455 13.042 10.201 14.475 9.694 16.01L7.21 21H3.521Z" />
    </svg>
  );
}

export default function SuccessStoriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Success Stories"
        title="Trusted by schools across the country"
        text="See how PexPacks helps principals and teachers streamline their back-to-school logistics so they can focus on what matters: teaching."
        panelTitle="Ready to simplify your school's stationery?"
        panelText="Contact us today to set up a custom portal for your parents."
      />

      <section
        className={styles.section}
        aria-labelledby="case-studies-heading"
      >
        <h2 id="case-studies-heading" className="sr-only">
          School Case Studies
        </h2>
        <div className={styles.inner}>
          <div className={styles.grid}>
            {successStories.map((story) => (
              <article key={story.id} className={styles.storyCard}>
                <div className={styles.storyContent}>
                  <header className={styles.storyHeader}>
                    <p className={styles.location}>{story.location}</p>
                    <h2 className={styles.schoolName}>{story.schoolName}</h2>
                  </header>

                  <div className={styles.detailSection}>
                    <h3>The Challenge</h3>
                    <p>{story.challenge}</p>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>The PexPacks Solution</h3>
                    <p>{story.solution}</p>
                  </div>

                  <div className={styles.detailSection}>
                    <h3>Key Results</h3>
                    <ul className={styles.resultsList}>
                      {story.results.map((result, index) => (
                        <li key={index}>{result}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={styles.quoteCard}>
                  <QuoteIcon />
                  <blockquote className={styles.quoteText}>
                    "{story.quote}"
                  </blockquote>
                  <div className={styles.quoteAuthor}>
                    <span className={styles.authorName}>
                      {story.quoteAuthor}
                    </span>
                    <span className={styles.authorRole}>{story.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Join the network"
        title="Become a partner school today"
        text="It is 100% free for schools to partner with PexPacks. We set up your lists, handle the payments, and deliver the packs."
        primaryHref="/partner-with-schools"
        primaryLabel="Learn about Partnerships"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />
    </>
  );
}
