import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/marketing/CTASection";
import { LayByExperience } from "@/components/marketing/LayByExperience";
import { PageHero } from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/LayByExperience.module.css";
import pageStyles from "./LayByPage.module.css";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import cardStyles from "@/components/marketing/MarketingCards.module.css";

export const metadata: Metadata = buildMetadata(
  "Lay-by & Pay Monthly | Pexpacks Supplies",
  "Secure your child's stationery pack with Pexpacks Lay-by. Spread payments over a few months with zero interest, CPA-compliant terms, and secure South African payment processing.",
  "/lay-by"
);

export const dynamic = "force-static";

export default function LayByPage() {
  return (
    <>
      <PageHero
        eyebrow="Pay over time"
        title="Lock in your school pack today, pay over time"
        panelChildren={
          <div className={styles.heroPanelCard}>
            <span>Lay-by at a glance</span>
            <strong>0% interest</strong>
            <p>Reserve your school pack now and settle it by October 31st.</p>
            <div className={styles.heroMiniStats}>
              <span>CPA compliant</span>
              <span>Secure payments</span>
              <span>No admin fees</span>
            </div>
          </div>
        }
      >
        <div className={styles.heroActions}>
          <Button href="/schools" size="lg">
            Browse School Packs
          </Button>
          <Button href="#layby-details" variant="outline" size="lg">
            How Lay-by Works
          </Button>
        </div>
      </PageHero>

      <section className={pageStyles.priceDemoSection}>
        <div className={pageStyles.inner}>
          <div className={pageStyles.priceDemoCard}>
            <div className={pageStyles.priceDemoContent}>
              <p className={pageStyles.priceDemoEyebrow}>Example calculation</p>
              <h2>From as little as R110 per month</h2>
              <p>
                A standard primary school pack costs around <strong>R659</strong>. With lay-by, that&rsquo;s roughly <strong>R132/month</strong> over 5 months &mdash; zero interest, zero hidden fees. The deposit is simply your first month&rsquo;s installment.
              </p>
              <div className={pageStyles.priceDemoRow}>
                <div className={pageStyles.priceDemoBox}>
                  <span className={pageStyles.priceDemoLabel}>One-time payment</span>
                  <span className={pageStyles.priceDemoValue}>R659</span>
                </div>
                <div className={pageStyles.priceDemoDivider}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
                <div className={`${pageStyles.priceDemoBox} ${pageStyles.priceDemoBoxHighlight}`}>
                  <span className={pageStyles.priceDemoLabel}>Lay-by, 5 months</span>
                  <span className={pageStyles.priceDemoValue}>R132<span className={pageStyles.priceDemoUnit}>/mo</span></span>
                </div>
              </div>
            </div>
            <div className={pageStyles.priceDemoActions}>
              <Button href="/schools" variant="primary" size="lg">
                Find Your Pack
              </Button>
              <Link href="/lay-by-terms" className={pageStyles.demoLink}>
                See full terms &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={pageStyles.trustStatsSection}>
        <div className={pageStyles.inner}>
          <div className={pageStyles.trustStatsGrid}>
            <div className={pageStyles.trustStatCard}>
              <strong className={pageStyles.trustStatValue}>0%</strong>
              <span className={pageStyles.trustStatLabel}>Interest charged</span>
            </div>
            <div className={pageStyles.trustStatCard}>
              <strong className={pageStyles.trustStatValue}>R0</strong>
              <span className={pageStyles.trustStatLabel}>Admin fees</span>
            </div>
            <div className={pageStyles.trustStatCard}>
              <strong className={pageStyles.trustStatValue}>5</strong>
              <span className={pageStyles.trustStatLabel}>Months to settle</span>
            </div>
            <div className={pageStyles.trustStatCard}>
              <strong className={pageStyles.trustStatValue}>CPA</strong>
              <span className={pageStyles.trustStatLabel}>Compliant</span>
            </div>
          </div>
        </div>
      </section>

      <LayByExperience />

      <CTASection
        eyebrow="January ready?"
        title="Choose the pack now. Pay it down calmly."
        text="Start with your school or grade pack, add Pexcover if you need books covered, and choose Lay-by / Pay Monthly at checkout."
        primaryHref="/schools"
        primaryLabel="Start Shopping Packs"
        secondaryHref="/contact"
        secondaryLabel="Ask a Question"
      />

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <div className={sectionStyles.splitBand}>
            <div>
              <p className={sectionStyles.sectionEyebrow}>Any questions?</p>
              <h2>We're here to help</h2>
              <p>
                Contact the Pexpacks team for lay-by questions, school pack enquiries, or help with your order.
              </p>
              <div className={sectionStyles.buttonRow}>
                <Button href="/contact" variant="primary">Contact Us</Button>
                <Button href="/schools" variant="white">Browse School Packs</Button>
              </div>
            </div>
            <div className={cardStyles.packCard}>
              <div className={cardStyles.packCardHead}>
                <h3 style={{ fontSize: "20px" }}>Read the full terms</h3>
              </div>
              <div className={cardStyles.packCardBody}>
                <p className={cardStyles.packDescription}>
                  View the complete lay-by terms and conditions, including CPA compliance details.
                </p>
              </div>
              <div className={cardStyles.packCardButtonWrap}>
                <Link href="/lay-by-terms" className={cardStyles.cardLink}>
                  View terms &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
