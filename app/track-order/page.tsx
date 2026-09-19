import type { Metadata } from "next";
import Link from "next/link";
import { TrackOrderForm } from "@/components/forms/TrackOrderForm";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { CTASection } from "@/components/marketing/CTASection";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import { getFaqs, getWebsiteContent } from "@/lib/cms";
import { buildMetadata } from "@/lib/seo";
import { Suspense } from "react";

export const metadata: Metadata = buildMetadata(
  "Track Order",
  "Track your Pexpacks stationery order by order number, phone number or email address.",
  "/track-order",
);

// ── Shared layout tokens ────────────────────────────────────────────────────
const sectionCls =
  "py-[var(--section-padding-y-desktop)] bg-transparent max-lg:py-[var(--section-padding-y-tablet)] max-[480px]:py-[var(--section-padding-y-mobile)]";
const innerCls =
  "w-full max-w-[var(--layout-max-width)] mx-auto px-[var(--gutter-desktop)] max-lg:px-[var(--gutter-mobile)]";
const splitBandCls =
  "rounded-[var(--radius-section)] p-[clamp(28px,5vw,54px)] grid grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] gap-[clamp(28px,5vw,60px)] items-center border-[var(--card-border)] bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] max-lg:grid-cols-1";
const sectionEyebrowCls =
  "m-[var(--section-eyebrow-margin)] text-[var(--section-eyebrow-color)] font-[var(--section-eyebrow-font-weight)] text-[var(--section-eyebrow-font-size)] tracking-[var(--section-eyebrow-letter-spacing)]";
const buttonRowCls =
  "mt-[26px] flex items-center flex-wrap gap-[var(--space-3)] max-lg:items-stretch max-lg:[&>*]:w-full";

// ── Card tokens ─────────────────────────────────────────────────────────────
const packCardCls =
  "border-[var(--card-border)] rounded-[var(--radius-card)] bg-[var(--card-bg)] [box-shadow:var(--card-shadow)] overflow-hidden flex flex-col relative";
const packCardHeadCls =
  "py-[var(--space-5)] px-[var(--space-5)] pb-[var(--space-3)] min-w-0";
const packCardBodyCls =
  "px-[var(--space-5)] grow flex flex-col gap-[var(--space-5)]";
const packDescriptionCls = "text-[var(--pex-text-muted)] m-0 text-[15px] leading-[1.45]";
const packCardButtonWrapCls = "px-[var(--space-5)] pb-[var(--space-5)]";
const cardLinkCls =
  "mt-[var(--space-5)] text-[var(--pex-keppel)] font-extrabold";

export default async function TrackOrderPage() {
  const [faqs, content] = await Promise.all([
    getFaqs("track_order"),
    getWebsiteContent(),
  ]);
  const hero = content["track-order.hero"];
  const heroEyebrow =
    typeof hero.eyebrow === "string" && hero.eyebrow
      ? hero.eyebrow
      : "Track your pack";
  const heroTitle =
    typeof hero.title === "string" && hero.title
      ? hero.title
      : "Check your stationery pack status";
  const visibleTrackingFaqs = faqs;

  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        panelTitle="Order Tracking"
        panelText="Stay updated on your pack."
      />
      <section className={sectionCls}>
        <div className={innerCls}>
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: 300,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                Loading tracker...
              </div>
            }
          >
            <TrackOrderForm />
          </Suspense>
        </div>
      </section>

      <FaqMarquee faqs={visibleTrackingFaqs} />

      <CTASection
        eyebrow="Need another?"
        title="Start your order"
        text="Find your school pack or have your school list packed exactly as specified."
        primaryHref="/schools"
        primaryLabel="Find School Packs"
        secondaryHref="/order"
        secondaryLabel="Upload Your School List"
      />

      <section className={sectionCls}>
        <div className={innerCls}>
          <div className={splitBandCls} style={{ border: "var(--card-border)" }}>
            <div>
              <p className={sectionEyebrowCls}>Need help?</p>
              <h2>Contact Pexpacks</h2>
              <p>
                If you cannot find your order status, reach out to the support
                team for assistance.
              </p>
              <div className={buttonRowCls}>
                <Button href="/contact" variant="primary">
                  Contact Support
                </Button>
                <Button href="/faq" variant="white">
                  Read All FAQs
                </Button>
              </div>
            </div>
            <div className={packCardCls} style={{ border: "var(--card-border)" }}>
              <div className={packCardHeadCls}>
                <h3 style={{ fontSize: "20px" }}>Start a new order</h3>
              </div>
              <div className={packCardBodyCls}>
                <p className={packDescriptionCls}>
                  Ready to order? Find your school pack or have your school list
                  packed exactly as specified.
                </p>
              </div>
              <div className={packCardButtonWrapCls}>
                <Link href="/schools" className={cardLinkCls}>
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
