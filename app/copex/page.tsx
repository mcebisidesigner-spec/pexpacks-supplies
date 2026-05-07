import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { PexpacksCatalogue } from "@/components/marketing/PexpacksCatalogue";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { sponsorshipExamples } from "@/data/packs";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

const usageScenarios = [
  {
    title: "Busy school mornings",
    text: "Breakfast, lunch and learner care packs help families prepare for the day faster."
  },
  {
    title: "Monthly home planning",
    text: "Home basics and hygiene packs make routine household essentials easier to manage."
  },
  {
    title: "Sponsor support",
    text: "Sponsors can support learners and families through structured, visible pack campaigns."
  }
];

const pexpacksBenefits = [
  "Convenience packs for real household routines",
  "Clear pack contents and easy enquiry paths",
  "Sponsor-friendly formats for schools and communities",
  "Pexpacks remains a Pexpacks product category, not the main business name"
];

export const metadata: Metadata = buildMetadata(
  "Pexpacks Convenience Packs",
  "From breakfast and lunch packs to hygiene and home basics, Pexpacks help families save time and stay prepared.",
  "/copex"
);

export default function PexpacksPage() {
  return (
    <>
      <PageHero
        eyebrow="Pexpacks"
        title="Everyday convenience packs for busy households"
        text="From breakfast and lunch packs to hygiene and home basics, Pexpacks help families save time and stay prepared."
        panelText="Core message"
        panelTitle="Everyday convenience packed for busy households."
      >
        <div className={styles.buttonRow}>
          <Button href="/contact?type=pexpacks">Enquire About Pexpacks</Button>
          <Button href="/partner#sponsor" variant="white">
            Sponsor a Pack
          </Button>
        </div>
      </PageHero>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader title="Explore Pexpacks" text="Filter by category and choose a pack that matches the household, learner or sponsor need." />
          <PexpacksCatalogue />
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.inner}>
          <SectionHeader title="Where Pexpacks fit" text="Pexpacks are everyday convenience packs under the Pexpacks Supplies brand." />
          <div className={styles.stepsGrid}>
            {usageScenarios.map((scenario) => (
              <article className={styles.stepCard} key={scenario.title}>
                <h3>{scenario.title}</h3>
                <p>{scenario.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.eyebrow}>Household convenience</p>
              <h2>Pexpacks keep practical essentials ready</h2>
              <p>
                Pexpacks Supplies offers Pexpacks convenience packs for families, learners, schools and sponsors who want
                clear pack contents without shopping for every item one by one.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/contact?type=pexpacks">Request Household Pack</Button>
                <Button href="/partner#sponsor" variant="white">
                  Sponsor Pack Support
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              {pexpacksBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.darkBand}>
            <div>
              <p className={styles.eyebrow}>Sponsor packs</p>
              <h2>Support families through structured packs</h2>
              <p>
                Local businesses and donors can sponsor learner care, breakfast, hygiene and home support packs through
                Pexpacks campaigns connected to partner schools and communities.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/partner#sponsor" variant="white">
                  Become a Sponsor
                </Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              {sponsorshipExamples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
