import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

const schoolBenefits = [
  "School stationery list and grade pack pages",
  "Parent order links and clear stationery communication",
  "Grade-specific stationery packs prepared from approved lists",
  "A simpler enquiry channel for stationery list support",
];

const supplierBenefits = [
  "Supply pack-ready stationery for schools and offices",
  "Support school and office stationery fulfilment",
  "Help Pexpacks build reliable Gauteng pilot operations",
  "Quote into practical, repeatable stationery pack categories",
];

export const metadata: Metadata = buildMetadata(
  "Partner With Pexpacks | School Stationery Supply",
  "Pexpacks helps schools simplify stationery ordering with grade-specific packs prepared according to school lists.",
  "/partner-with-schools"
);

export default function PartnerWithSchoolsPage() {
  return (
    <>
      <PageHero
        eyebrow="Partner with us"
        title="Help parents order the correct stationery"
        text="Schools and stationery suppliers can work with Pexpacks to simplify school-list ordering and keep grade-specific packs clear for parents."
        panelText="Built for"
        panelTitle="Schools and suppliers"
      >
        <div className={styles.buttonRow}>
          <Button href="#partner-form">Start Partnership</Button>
          <Button href="/contact" variant="white">
            Contact Pexpacks
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
              <p className={styles.eyebrow}>School-list support</p>
              <h2>Grade-specific stationery made clearer</h2>
              <p>
                Pexpacks helps schools turn approved stationery lists into clear
                grade pack pages so parents know what to order and learners can
                start prepared.
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

      <section className={styles.sectionCream}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Supplier network"
            title="Become a stationery supplier"
            text="Pexpacks needs dependable suppliers for school and office stationery pack categories."
          />
          <div className={styles.infoGrid}>
            {supplierBenefits.map((benefit) => (
              <article className={styles.infoCard} key={benefit}>
                <h3>{benefit}</h3>
                <p>
                  Use the partnership form and select supplier partnership so
                  Pexpacks can review the opportunity.
                </p>
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
            text="Share the school or supplier opportunity so Pexpacks can follow up."
          />
          <PartnerForm />
        </div>
      </section>
    </>
  );
}
