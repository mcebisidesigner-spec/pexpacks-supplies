import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { RatingStrip } from "@/components/shared/RatingStrip";
import {
  generalEmail,
  generalEmailHref,
  hasWhatsAppNumber,
  orderWhatsAppHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export const metadata: Metadata = buildMetadata(
  "Contact",
  "Contact Pexpacks for school stationery orders, office pack enquiries, school partnerships and supplier enquiries.",
  "/contact"
);

export const dynamic = "force-static";

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

import pageStyles from "./ContactPage.module.css";

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = searchParams ? await searchParams : {};
  const prefill = resolveContactPrefill(params);

  return (
    <>
      <PageHero
        eyebrow="Pex in touch"
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
            
            <div className={pageStyles.sidebarWrapper}>
              {/* 🟢 LIVE SUPPORT STATUS */}
              <div className={pageStyles.liveStatusCard}>
                <div className={pageStyles.statusIndicator}>
                  <span className={pageStyles.statusPulse} />
                </div>
                <div className={pageStyles.statusText}>
                  <h2 className={pageStyles.statusTitle}>Gauteng Support Desk Active</h2>
                  <span className={pageStyles.statusDesc}>
                    Live chat active • WhatsApp response time &lt; 5 mins
                  </span>
                </div>
              </div>

              {/* SERVICE LEVEL AGREEMENTS */}
              <div className={pageStyles.slaGroup}>
                <div className={pageStyles.slaCard}>
                  <span className={pageStyles.slaTitle}>School Partners</span>
                  <h3 className={pageStyles.slaTime}>&lt; 2 Hours</h3>
                  <span className={pageStyles.slaLabel}>Dedicated School Relations Lead callback.</span>
                </div>
                <div className={pageStyles.slaCard}>
                  <span className={pageStyles.slaTitle}>Office/Quotes</span>
                  <h3 className={pageStyles.slaTime}>&lt; 4 Hours</h3>
                  <span className={pageStyles.slaLabel}>Custom line-item quotation prepared.</span>
                </div>
              </div>

              {/* "WHAT HAPPENS NEXT?" TIMELINE */}
              <div className={pageStyles.timelineCard}>
                <h2 className={pageStyles.timelineTitle}>Your Response Timeline</h2>
                <div className={pageStyles.timelineSteps}>
                  <div className={`${pageStyles.timelineStep} ${pageStyles.stepActive}`}>
                    <span className={pageStyles.stepIcon}>1</span>
                    <div className={pageStyles.stepDetails}>
                      <h3 className={pageStyles.stepTitle}>Submit Request</h3>
                      <p className={pageStyles.stepDesc}>Submit your contact form with your exact needs.</p>
                    </div>
                  </div>
                  <div className={`${pageStyles.timelineStep} ${pageStyles.stepActive}`}>
                    <span className={pageStyles.stepIcon}>2</span>
                    <div className={pageStyles.stepDetails}>
                      <h3 className={pageStyles.stepTitle}>Gauteng Fast-Track Router</h3>
                      <p className={pageStyles.stepDesc}>Your request is automatically fast-tracked to the correct department.</p>
                    </div>
                  </div>
                  <div className={`${pageStyles.timelineStep} ${pageStyles.stepActive}`}>
                    <span className={pageStyles.stepIcon}>3</span>
                    <div className={pageStyles.stepDetails}>
                      <h3 className={pageStyles.stepTitle}>Direct Outreach</h3>
                      <p className={pageStyles.stepDesc}>A support representative contacts you on WhatsApp or phone to finalize details.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTACT DETAILS CHANNELS */}
              <div className={pageStyles.contactChannelsCard}>
                <SectionHeader
                  eyebrow="Quick connections"
                  title="Contact details"
                  text="Reach out directly through standard support paths."
                />
                <div className={pageStyles.channelsGrid}>
                  <div className={pageStyles.channelRow}>
                    <svg className={pageStyles.channelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <strong>Email:</strong>
                    <a href={generalEmailHref}>{generalEmail}</a>
                  </div>
                  <div className={pageStyles.channelRow}>
                    <svg className={pageStyles.channelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <strong>Telephone:</strong>
                    <a href={phoneHref}>{phoneNumber}</a>
                  </div>
                  <div className={pageStyles.channelRow}>
                    <svg className={pageStyles.channelIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <strong>WhatsApp:</strong>
                    {hasWhatsAppNumber ? (
                      <a href={orderWhatsAppHref}>Start prefilled chat</a>
                    ) : (
                      <span>Currently offline</span>
                    )}
                  </div>
                </div>

                <div className={sectionStyles.buttonRow} style={{ marginTop: "12px" }}>
                  {hasWhatsAppNumber ? (
                    <Button href={orderWhatsAppHref} variant="white">
                      WhatsApp us
                    </Button>
                  ) : null}
                  <Button href="/partnership">Partner With Us</Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["school-not-listed", "delivery-timing", "payment-flow", "order-changes", "delivery-areas"].includes(f.id)
        )}
      />

      <CTASection
        eyebrow="Still need help?"
        title="Read our FAQs"
        text="Find answers to common questions about ordering, delivery, and payments before reaching out."
        primaryHref="/faq"
        primaryLabel="Read All FAQs"
        secondaryHref="/schools"
        secondaryLabel="Find School Packs"
      />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Quick links</p>
              <h2>Find what you need</h2>
              <p>
                Browse grade packs, track an existing order, or partner with Pexpacks.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/schools" variant="primary">Find School Packs</Button>
                <Button href="/faq" variant="white">Read All FAQs</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Track your order</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Check the status of a submitted stationery order using your reference details.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/track-order" className={cardStyles.cardLink}>
                  Track order &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <RatingStrip />
    </>
  );
}
