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
  phoneNumber,
} from "@/data/contact";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export const metadata: Metadata = buildMetadata(
  "Contact",
  "Contact Pexpacks for school stationery orders, office pack enquiries, school partnerships and supplier enquiries.",
  "/contact"
);

type ContactPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function resolveContactPrefill(params: Record<string, string | string[] | undefined>) {
  const type = firstValue(params.type).trim().toLowerCase();
  const subject = firstValue(params.subject).trim();
  const notes = firstValue(params.notes).trim();
  const businessName = firstValue(params.businessName).trim();

  const initialEnquiryType =
    type === "office"
      ? "Office pack"
      : type === "bulk" || type === "quote"
        ? "Bulk order"
        : type === "partner" || type === "school-partnership"
          ? "School partnership"
          : type === "parent" || type === "order"
            ? "Parent order"
            : type === "supplier"
              ? "Supplier partnership"
              : "General enquiry";

  const initialMessage = [subject ? `I am enquiring about ${subject}.` : "", notes]
    .filter(Boolean)
    .join("\n\n");

  return {
    initialEnquiryType,
    initialMessage,
    initialBusinessName:
      businessName || (initialEnquiryType === "Office pack" ? subject : ""),
  };
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = searchParams ? await searchParams : {};
  const prefill = resolveContactPrefill(params);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to Pexpacks"
        text="Send an enquiry about parent orders, school partnerships, office packs or supplier opportunities."
        panelText="Service area"
        panelTitle="Gauteng pilot province"
      >
        <div className={sectionStyles.buttonRow}>
          {hasWhatsAppNumber ? (
            <Button href={orderWhatsAppHref} variant="white">
              WhatsApp Pexpacks
            </Button>
          ) : null}
          <Button href="/order">Order a Pack</Button>
        </div>
      </PageHero>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={cardStyles.infoGrid}>
            <ContactForm {...prefill} />
            <div className={cardStyles.infoCard}>
              <SectionHeader
                eyebrow="Contact channels"
                title="Contact details"
                text="Use the form for structured enquiries or WhatsApp for quick order follow-ups."
              />
              <p>
                <strong>Email:</strong>{" "}
                <a href={generalEmailHref}>{generalEmail}</a>
              </p>
              <p>
                <strong>Orders:</strong>{" "}
                <a href={ordersEmailHref}>{ordersEmail}</a>
              </p>
              <p>
                <strong>Telephone:</strong>{" "}
                <a href={phoneHref}>{phoneNumber}</a>
              </p>
              <p>
                <strong>WhatsApp:</strong>{" "}
                {hasWhatsAppNumber ? (
                  <a href={orderWhatsAppHref}>
                    Start a prefilled WhatsApp order chat
                  </a>
                ) : (
                  "WhatsApp chat is currently unavailable."
                )}
              </p>
              <p>
                <strong>Location:</strong> Gauteng pilot province, South Africa.
              </p>
              <div className={sectionStyles.buttonRow}>
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
