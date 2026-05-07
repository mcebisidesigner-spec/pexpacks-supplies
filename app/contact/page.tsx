import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { generalEmail, generalEmailHref, ordersEmail, ordersEmailHref } from "@/data/contact";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

export const metadata: Metadata = buildMetadata(
  "Contact Pexpacks Supplies",
  "Contact Pexpacks Supplies for parent orders, school partnerships, office packs, Pexpacks, sponsorships and supplier enquiries.",
  "/contact"
);

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to Pexpacks Supplies"
        text="Send an enquiry about parent orders, school partnerships, office packs, Pexpacks, sponsorships or supplier opportunities."
        panelText="Service area"
        panelTitle="Gauteng pilot province"
      >
        <div className={styles.buttonRow}>
          <Button href="https://wa.me/" variant="white">
            WhatsApp Pexpacks
          </Button>
          <Button href="/order">Order a Pack</Button>
        </div>
      </PageHero>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.infoGrid}>
            <ContactForm />
            <div className={styles.infoCard}>
              <SectionHeader title="Contact details" text="Use the form for structured enquiries or WhatsApp for quick order follow-ups." />
              <p>
                <strong>Email:</strong> <a href={generalEmailHref}>{generalEmail}</a>
              </p>
              <p>
                <strong>Orders:</strong> <a href={ordersEmailHref}>{ordersEmail}</a>
              </p>
              <p>
                <strong>WhatsApp:</strong> Available for pack questions and order follow-ups.
              </p>
              <p>
                <strong>Location:</strong> Gauteng pilot province, South Africa.
              </p>
              <div className={styles.buttonRow}>
                <Button href="https://wa.me/" variant="white">
                  WhatsApp us
                </Button>
                <Button href="/partner">Partner With Us</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
