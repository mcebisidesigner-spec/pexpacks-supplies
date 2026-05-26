import type { Metadata } from "next";
import Link from "next/link";
import { TrackOrderForm } from "@/components/forms/TrackOrderForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export const metadata: Metadata = buildMetadata(
  "Track Order",
  "Track your Pexpacks stationery order by order number, phone number or email address.",
  "/track-order"
);

export const dynamic = "force-static";

export default function TrackOrderPage() {
  return (
    <>
      <PageHero
        eyebrow="Pex your pack"
        title="Check your stationery pack status"
        text="Enter your order reference and contact detail to request an update."
        panelTitle="Order Tracking"
        panelText="Stay updated on your pack."
      />
      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <TrackOrderForm />
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((f) =>
          ["delivery-timing", "order-changes", "proof-of-payment", "payment-flow", "delivery-areas"].includes(f.id)
        )}
      />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Need help?</p>
              <h2>Contact Pexpacks</h2>
              <p>
                If you cannot find your order status, reach out to the support team for assistance.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/contact" variant="primary">Contact Support</Button>
                <Button href="/faq" variant="white">Read All FAQs</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Start a new order</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  Ready to order? Find your school pack or browse office stationery options.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/schools" className={cardStyles.cardLink}>
                  Find school packs &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Need a new pack?"
        title="Start your order"
        text="Find your school pack or browse office stationery options for your business."
        primaryHref="/schools"
        primaryLabel="Find School Packs"
        secondaryHref="/office"
        secondaryLabel="View Office Packs"
      />
    </>
  );
}
