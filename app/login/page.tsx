import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/Button";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { RatingStrip } from "@/components/shared/RatingStrip";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export const metadata: Metadata = buildMetadata(
  "Parent Portal | Pexpacks",
  "Access parent support actions for tracking orders, finding school packs, and contacting Pexpacks.",
  "/login",
);

export const dynamic = "force-static";

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Pex your pack"
        title="Quick access for Pexpacks parents"
        text="Use the parent portal entry point to track an order, return to your school pack, or get help from the Pexpacks team."
        panelText="No account needed"
        panelTitle="Track your order with your order reference."
      >
        <div className={sectionStyles.buttonRow}>
          <Button href="/track-order" size="lg">
            Track order
          </Button>
          <Button href="/schools" variant="white" size="lg">
            Find school pack
          </Button>
        </div>
      </PageHero>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <SectionHeader
            eyebrow="Parent actions"
            title="Choose what you need next"
            text="Pexpacks keeps the parent path simple while full account features are being prepared."
          />
          <div className={cardStyles.infoGrid}>
            <article className={cardStyles.infoCard}>
              <p className={sectionStyles.sectionEyebrow}>Existing order</p>
              <h3>Track your pack</h3>
              <p>
                Check the status of a submitted stationery order using your
                reference details.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/track-order">Track order</Button>
              </div>
            </article>
            <article className={cardStyles.infoCard}>
              <p className={sectionStyles.sectionEyebrow}>New order</p>
              <h3>Find your school</h3>
              <p>
                Search by school and grade to start a new ready-packed
                stationery order.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/schools" variant="white">
                  Search schools
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["delivery-timing", "school-not-listed", "payment-flow", "proof-of-payment", "order-changes"].includes(f.id)
        )}
      />

      <CTASection
        eyebrow="New here?"
        title="Find your school pack"
        text="Search for your child's school and grade to get the exact stationery pack delivered."
        primaryHref="/schools"
        primaryLabel="Find School Pack"
        secondaryHref="/office"
        secondaryLabel="View Office Packs"
      />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Need more help?</p>
              <h2>Get in touch</h2>
              <p>
                Contact the Pexpacks team for order assistance, school enquiries, or office pack quotes.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/contact" variant="primary">Contact Us</Button>
                <Button href="/faq" variant="white">Read FAQs</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Office supplies</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Pexpacks also prepares practical office stationery packs for SMEs, home offices, and small teams.
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
      <RatingStrip />
    </>
  );
}
