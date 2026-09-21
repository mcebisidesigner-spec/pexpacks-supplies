import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { getFaqs, getWebsiteContent } from "@/lib/cms";
import { FAQExperience } from "@/components/marketing/FAQExperience";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { buildMetadata } from "@/lib/seo";
import { faqPageSchema } from "@/lib/schema";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata(
  "Frequently Asked Questions",
  "Answers to common questions about Pexpacks school stationery packs, delivery, payment and partnerships.",
  "/faq",
);

// ── Shared layout tokens ────────────────────────────────────────────────────
const sectionCls =
  "py-[var(--section-padding-y-desktop)] bg-transparent max-lg:py-[var(--section-padding-y-tablet)] max-[480px]:py-[var(--section-padding-y-mobile)]";
const innerCls =
  "w-full max-w-[var(--layout-max-width)] mx-auto px-[var(--gutter-desktop)] max-lg:px-[var(--gutter-mobile)]";
const splitBandCls =
  "rounded-[var(--radius-section)] p-[clamp(28px,5vw,54px)] grid grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] gap-[clamp(28px,5vw,60px)] items-center bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] max-lg:grid-cols-1";
const sectionEyebrowCls =
  "m-[var(--section-eyebrow-margin)] text-[var(--section-eyebrow-color)] font-[var(--section-eyebrow-font-weight)] text-[var(--section-eyebrow-font-size)] tracking-[var(--section-eyebrow-letter-spacing)]";
const buttonRowCls =
  "mt-[26px] flex items-center flex-wrap gap-[var(--space-3)] max-lg:items-stretch max-lg:[&>*]:w-full";

// ── Card tokens ─────────────────────────────────────────────────────────────
const packCardCls =
  "rounded-[var(--radius-card)] bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] overflow-hidden flex flex-col relative";
const packCardHeadCls =
  "py-[var(--space-5)] px-[var(--space-5)] pb-[var(--space-3)] min-w-0";
const packTitleCls =
  "m-0 text-[var(--pex-primary)] font-[var(--font-heading)] text-[var(--text-xl)] font-[var(--font-weight-bold)] leading-[1.2]";
const packCardBodyCls =
  "px-[var(--space-5)] grow flex flex-col gap-[var(--space-5)]";
const packDescriptionCls =
  "text-[var(--pex-text-muted)] m-0 text-[15px] leading-[1.45]";
const packCardButtonWrapCls = "px-[var(--space-5)] pb-[var(--space-5)]";
const cardLinkCls = "mt-[var(--space-5)] text-[var(--pex-keppel)] font-extrabold";

export default async function FAQPage() {
  const [faqs, content] = await Promise.all([getFaqs(), getWebsiteContent()]);
  const hero = content["faq.hero"];
  const heroEyebrow =
    typeof hero.eyebrow === "string" && hero.eyebrow
      ? hero.eyebrow
      : "Got questions?";
  const heroTitle =
    typeof hero.title === "string" && hero.title
      ? hero.title
      : "Answers without the back-and-forth";
  return (
    <>
      <JsonLd data={faqPageSchema(faqs)} />
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        panelTitle={`${faqs.length} practical answers`}
        panelText="Start with a category, open what matters, and jump straight to the next action."
      />
      <FAQExperience faqs={faqs} />
      <CTASection
        eyebrow="Still stuck?"
        title="Send the details and I will help."
        text="Tell me the school, grade, or order and I will help you choose the next step."
        primaryHref="/contact"
        primaryLabel="Contact Pexpacks"
        secondaryHref="/schools"
        secondaryLabel="Find a School Pack"
      />
      <section className={sectionCls}>
        <div className={innerCls}>
          <div
            className={splitBandCls}
            style={{ border: "var(--card-border)" }}
          >
            <div>
              <p className={sectionEyebrowCls}>Ready to order?</p>
              <h2>Find your school pack</h2>
              <p>
                Search for your school or choose a standard grade pack. Your
                stationery is handled.
              </p>
              <div className={buttonRowCls}>
                <Button
                  href="/schools"
                  variant="primary"
                  data-conversion-event="faq_find_school_pack"
                >
                  Find Your School Pack
                </Button>
                <Button
                  href="/partnership"
                  variant="white"
                  data-conversion-event="faq_partner"
                >
                  Partner With Us
                </Button>
              </div>
            </div>
            <div
              className={packCardCls}
              style={{ border: "var(--card-border)" }}
            >
              <div className={packCardHeadCls}>
                <h3 className={packTitleCls}>Contact us</h3>
              </div>
              <div className={packCardBodyCls}>
                <p className={packDescriptionCls}>
                  Still have questions? Send the details and I will help you work through them.
                </p>
              </div>
              <div className={packCardButtonWrapCls}>
                <Link
                  href="/contact"
                  className={cardLinkCls}
                  data-conversion-event="faq_contact"
                >
                  Contact Pexpacks &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
