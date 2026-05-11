import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import {
  generalEmail,
  generalEmailHref,
  hasWhatsAppNumber,
  orderWhatsAppHref,
  ordersEmail,
  ordersEmailHref,
  phoneHref,
  phoneNumber
} from "@/data/contact";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

export const metadata: Metadata = buildMetadata(
  "Contact",
  "Contact Pexpacks for school stationery orders, office pack enquiries, partnerships, sponsorships and supplier enquiries.",
  "/contact"
);

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to Pexpacks"
        text="Send an enquiry about parent orders, school partnerships, office packs, sponsorships or supplier opportunities."
        panelText="Service area"
        panelTitle="Gauteng pilot province"
      >
        <div className={styles.buttonRow}>
          {hasWhatsAppNumber ? (
            <Button href={orderWhatsAppHref} variant="white">
              WhatsApp Pexpacks
            </Button>
          ) : null}
          <Button href="/order">Order a Pack</Button>
        </div>
      </PageHero>

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.infoGrid}>
            <ContactForm />
            <div className={styles.infoCard}>
              <SectionHeader
                eyebrow="Contact channels"
                title="Contact details"
                text="Use the form for structured enquiries or WhatsApp for quick order follow-ups."
              />
              <p>
                <strong>Email:</strong> <a href={generalEmailHref}>{generalEmail}</a>
              </p>
              <p>
                <strong>Orders:</strong> <a href={ordersEmailHref}>{ordersEmail}</a>
              </p>
              <p>
                <strong>Telephone:</strong> <a href={phoneHref}>{phoneNumber}</a>
              </p>
              <p>
                <strong>WhatsApp:</strong>{" "}
                {hasWhatsAppNumber ? (
                  <a href={orderWhatsAppHref}>Start a prefilled WhatsApp order chat</a>
                ) : (
                  "WhatsApp chat is currently unavailable."
                )}
              </p>
              <p>
                <strong>Location:</strong> Gauteng pilot province, South Africa.
              </p>
              <div className={styles.buttonRow}>
                {hasWhatsAppNumber ? (
                  <Button href={orderWhatsAppHref} variant="white">
                    WhatsApp us
                  </Button>
                ) : null}
                <Button href="/partner-with-schools">Partner With Us</Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
