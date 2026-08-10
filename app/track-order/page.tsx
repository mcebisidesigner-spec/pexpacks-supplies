import type { Metadata } from "next";
import Link from "next/link";
import { TrackOrderForm } from "@/components/forms/TrackOrderForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { getFaqs } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export const metadata: Metadata = buildMetadata(
  "Track Order",
  "Track your Pexpacks stationery order by order number, phone number or email address.",
  "/track-order"
);

import { Suspense } from "react";

export default async function TrackOrderPage() {
  const faqs = await getFaqs();
  return (
    <>
      <PageHero
        eyebrow="Track your pack"
        title="Check your stationery pack status"
        panelTitle="Order Tracking"
        panelText="Stay updated on your pack."
      />
      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <Suspense fallback={<div style={{ minHeight: 300, display: "grid", placeItems: "center" }}>Loading tracker...</div>}>
            <TrackOrderForm />
          </Suspense>
        </div>
      </section>

      <FaqMarquee
        faqs={faqs.filter((f) =>
          [
            "track-order-how",
            "track-order-status-meaning",
            "delivery-timing",
            "order-changes",
            "proof-of-payment",
            "delivery-areas",
            "track-order-missing-ref",
          ].includes(f.id)
        )}
      />

      <CTASection
        eyebrow="Need another?"
        title="Start your order"
        text="Find your school pack or have your school list packed exactly as specified."
        primaryHref="/schools"
        primaryLabel="Find School Packs"
        secondaryHref="/order"
        secondaryLabel="Upload Your School List"
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
                  Ready to order? Find your school pack or have your school list packed exactly as specified.
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
    </>
  );
}
