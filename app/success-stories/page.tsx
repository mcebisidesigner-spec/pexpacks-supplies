import { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { Button } from "@/components/ui/Button";
import { successStories } from "@/data/successStories";
import styles from "./SuccessStories.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(
  "Partner Success Stories",
  "See how Pexpacks helps schools across South Africa streamline their back-to-school stationery logistics.",
  "/success-stories"
);

export const dynamic = "force-static";

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
        eyebrow="School success stories"
        title="Trusted by schools across the country"
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
                    <h3>The Pexpacks Solution</h3>
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
        text="It is 100% free for schools to partner with Pexpacks. We set up your lists, handle the payments, and deliver the packs."
        primaryHref="/partnership"
        primaryLabel="Learn about Partnerships"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Ready to start?</p>
              <h2>Find your school pack</h2>
              <p>
                Search for your school or choose a standard grade pack. Pexpacks handles the rest.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/schools" variant="primary">Find Your School Pack</Button>
                <Button href="/partnership" variant="white">Become a Partner School</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Need office supplies?</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Pexpacks also supplies practical office stationery for SMEs, home offices, and small teams.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/office" className={cardStyles.cardLink}>
                  View office packs &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
