import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { sponsorshipExamples } from "@/data/packs";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

const schoolBenefits = [
  "Free standardised school website programme for approved partner schools",
  "School stationery list and grade pack pages",
  "Parent order links and clear stationery communication",
  "Sponsor visibility pages and community support channels"
];

const supplierBenefits = [
  "Supply pack-ready stationery for schools and offices",
  "Support school, office and PexPacks fulfilment",
  "Help PexPacks build reliable Gauteng pilot operations",
  "Quote into practical, repeatable stationery pack categories"
];

export const metadata: Metadata = buildMetadata(
  "Partner With PexPacks | School Stationery Supply",
  "PexPacks helps schools simplify stationery ordering with grade-specific packs prepared according to school lists.",
  "/partner-with-schools"
);

export default function PartnerWithSchoolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner with us"
        title="Partner with Pexpacks and make essentials easier to access"
        text="Schools, sponsors and suppliers can work with PexPacks to simplify stationery ordering, support learners and build reliable school and office stationery channels."
        panelText="Built for"
        panelTitle="Schools, sponsors and suppliers"
      >
        <div className={styles.buttonRow}>
          <Button href="#partner-form">Start Partnership</Button>
          <Button href="#sponsor" variant="white">
            Become a Sponsor
          </Button>
        </div>
      </PageHero>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="School partnerships"
            title="Partner as a school"
            text="A practical way to reduce stationery admin and improve parent communication."
          />
          <div className={styles.splitBand}>
            <div>
              <p className={styles.eyebrow}>School website programme</p>
              <h2>Free school website programme</h2>
              <p>
                Pexpacks provides and manages the website platform, while schools approve their official content and
                communication. Approved partner schools can use the platform for parent updates, stationery pack links,
                sponsor pages and school information.
              </p>
              <div className={styles.buttonRow}>
                <Button href="#partner-form">Partner Your School</Button>
              </div>
            </div>
            <ul className={styles.checkList}>
              {schoolBenefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.sectionCream} id="sponsor">
        <div className={styles.inner}>
          <div className={styles.splitBand}>
            <div>
              <p className={styles.eyebrow}>Sponsors and donors</p>
              <h2>Support schools through Pexpacks</h2>
              <p>
                Local businesses and donors can sponsor learner stationery packs, classroom supplies, or school website visibility through a structured support channel.
              </p>
              <div className={styles.buttonRow}>
                <Button href="#partner-form">
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

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Supplier network"
            title="Become a supplier"
            text="Pexpacks needs dependable suppliers for school and office stationery pack categories."
          />
          <div className={styles.infoGrid}>
            {supplierBenefits.map((benefit) => (
              <article className={styles.infoCard} key={benefit}>
                <h3>{benefit}</h3>
                <p>Use the partnership form and select supplier partnership so Pexpacks can review the opportunity.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="partner-form">
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Partnership enquiry"
            title="Contact Pexpacks partnerships"
            text="Share the school, sponsor or supplier opportunity. The form opens a prepared email enquiry so Pexpacks can follow up."
          />
          <PartnerForm />
        </div>
      </section>
    </>
  );
}
