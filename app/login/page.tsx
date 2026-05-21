import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import styles from "@/components/marketing/Marketing.module.css";

export const metadata: Metadata = buildMetadata(
  "Parent Portal | Pexpacks",
  "Access parent support actions for tracking orders, finding school packs, and contacting Pexpacks.",
  "/login",
);

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Parent portal"
        title="Quick access for Pexpacks parents"
        text="Use the parent portal entry point to track an order, return to your school pack, or get help from the Pexpacks team."
        panelText="No account needed"
        panelTitle="Track your order with your order reference."
      >
        <div className={styles.buttonRow}>
          <Button href="/track-order" size="lg">
            Track order
          </Button>
          <Button href="/schools" variant="white" size="lg">
            Find school pack
          </Button>
        </div>
      </PageHero>

      <section className={styles.section}>
        <div className={styles.inner}>
          <SectionHeader
            eyebrow="Parent actions"
            title="Choose what you need next"
            text="Pexpacks keeps the parent path simple while full account features are being prepared."
          />
          <div className={styles.infoGrid}>
            <article className={styles.infoCard}>
              <p className={styles.sectionEyebrow}>Existing order</p>
              <h3>Track your pack</h3>
              <p>
                Check the status of a submitted stationery order using your
                reference details.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/track-order">Track order</Button>
              </div>
            </article>
            <article className={styles.infoCard}>
              <p className={styles.sectionEyebrow}>New order</p>
              <h3>Find your school</h3>
              <p>
                Search by school and grade to start a new ready-packed
                stationery order.
              </p>
              <div className={styles.buttonRow}>
                <Button href="/schools" variant="white">
                  Search schools
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
