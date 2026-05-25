import type { Metadata } from "next";
import { CTASection } from "@/components/marketing/CTASection";
import { LayByExperience } from "@/components/marketing/LayByExperience";
import { PageHero } from "@/components/marketing/PageHero";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/LayByExperience.module.css";

export const metadata: Metadata = buildMetadata(
  "Lay-by Information | Pexpacks Supplies",
  "Secure your child's stationery pack with Pexpacks Lay-by. Spread payments over a few months with zero interest, CPA-compliant terms, and secure South African payment processing.",
  "/lay-by"
);

export const dynamic = "force-static";

export default function LayByPage() {
  return (
    <>
      <PageHero
        eyebrow="Pex lay-by"
        title="Secure Your Child's Stationery with Pexpacks Lay-by"
        text="Beat the January rush. Spread the cost. Zero interest, zero stress."
        panelChildren={
          <div className={styles.heroPanelCard}>
            <span>Lay-by at a glance</span>
            <strong>0% interest</strong>
            <p>Reserve your school pack now and settle it by November 30th.</p>
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
            Start Shopping Packs
          </Button>
          <Button href="#layby-details" variant="outline" size="lg">
            Read the Details
          </Button>
        </div>
      </PageHero>

      <LayByExperience />

      <CTASection
        eyebrow="Ready when January arrives"
        title="Choose the pack now. Pay it down calmly."
        text="Start with your school or grade pack, add Pexcover if you need books covered, and choose Lay-by / Pay Monthly at checkout."
        primaryHref="/schools"
        primaryLabel="Start Shopping Packs"
        secondaryHref="/contact"
        secondaryLabel="Ask a Question"
      />
    </>
  );
}
