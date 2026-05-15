import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Deliveries",
  "Learn about Pexpacks delivery and collection options for school and office stationery packs.",
  "/deliveries"
);

export default function DeliveriesPage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Deliveries</p>
          <h1>Simple delivery and collection options</h1>
          <p className={page.pageHeroText}>
            Choose school collection, home delivery, or office delivery when you place your stationery pack order.
          </p>
        </div>
      </section>

      <section className={page.section}>
        <div className={`${page.sectionInner} ${page.cardGrid}`}>
          <article className={page.infoCard}>
            <h2>School collection</h2>
            <p>Collect packed and labelled school stationery from participating schools on the confirmed collection date.</p>
          </article>
          <article className={page.infoCard}>
            <h2>Home delivery</h2>
            <p>Have your learner&apos;s pack delivered to your home address where the option is available.</p>
          </article>
          <article className={page.infoCard}>
            <h2>Office delivery</h2>
            <p>Office and SME packs can be delivered to your workplace for monthly or once-off stationery needs.</p>
          </article>
        </div>
      </section>

      <section className={page.darkBand}>
        <div>
          <p className={page.kicker}>Ready to order</p>
          <h2>Start with the correct pack</h2>
        </div>
        <Button href="/order" variant="white">
          Order Now
        </Button>
      </section>
    </>
  );
}
