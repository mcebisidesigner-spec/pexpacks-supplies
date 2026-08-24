import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { getFaqs } from "@/lib/cms";
import { FAQExperience } from "@/components/marketing/FAQExperience";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { buildMetadata } from "@/lib/seo";
import { faqPageSchema } from "@/lib/schema";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export const metadata: Metadata = buildMetadata(
  "Frequently Asked Questions",
  "Answers to common questions about Pexpacks school stationery packs, delivery, payment and partnerships.",
  "/faq"
);

export default async function FAQPage() {
  const faqs = await getFaqs();
  return (
    <>
      <JsonLd data={faqPageSchema(faqs)} />
      <PageHero
        eyebrow="Got questions?"
        title="Answers without the back-and-forth"
        panelTitle={`${faqs.length} practical answers`}
        panelText="Start with a category, open what matters, and jump straight to the next action."
      />
      <FAQExperience faqs={faqs} />
      <CTASection
        eyebrow="Still stuck?"
        title="Send the team the details."
        text="Tell us the school, grade, or order and Pexpacks will help you choose the next step."
        primaryHref="/contact"
        primaryLabel="Contact Pexpacks"
        secondaryHref="/schools"
        secondaryLabel="Find a School Pack"
      />
      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Ready to order?</p>
              <h2>Find your school pack</h2>
              <p>
                Search for your school or choose a standard grade pack. Your stationery is handled.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/schools" variant="primary" data-conversion-event="faq_find_school_pack">Find Your School Pack</Button>
                <Button href="/partnership" variant="white" data-conversion-event="faq_partner">Partner With Us</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 className={cardStyles.packTitle}>Contact us</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Still have questions? Reach out to the Pexpacks support team for help.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/contact" className={cardStyles.cardLink} data-conversion-event="faq_contact">
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
