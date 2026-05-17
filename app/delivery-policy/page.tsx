import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Delivery Policy",
  "Read the Pexpacks delivery policy for school stationery packs and office stationery packs.",
  "/delivery-policy"
);

export default function DeliveryPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Delivery Policy"
        title="Delivery and collection guidance"
        text="Pexpacks confirms delivery and collection details after receiving the selected school, grade, pack, and customer information."
        panelTitle="Support"
        panelText="Contact us for delivery assistance."
      />
      <section className={page.section}>
        <div className={page.sectionInner}>
          <article className={page.infoCard}>
            <p className={page.kicker}>Delivery choices</p>
            <h2>Delivery options</h2>
            <p>
              Available options may include school collection, home delivery, or
              office delivery depending on the pack.
            </p>
            <p className={page.kicker}>Timing guidance</p>
            <h2>Timing</h2>
            <p>
              Delivery and collection timelines are confirmed with the customer
              after pack availability and payment details are checked.
            </p>
            <p className={page.kicker}>Delivery help</p>
            <h2>Support</h2>
            <p>
              Use the contact page for delivery questions or order tracking
              support.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
