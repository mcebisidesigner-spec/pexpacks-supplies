import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Terms of Use",
  "Read the Pexpacks Supplies website terms of use for school and office stationery pack services.",
  "/terms"
);

export default function TermsPage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Terms of Use</p>
          <h1>Using the Pexpacks Supplies website</h1>
          <p className={page.pageHeroText}>
            These terms explain the basic conditions for browsing the website and submitting stationery pack enquiries
            or order requests.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div className={page.sectionInner}>
          <article className={page.infoCard}>
            <h2>Website information</h2>
            <p>
              Website content is provided to help customers understand Pexpacks Supplies school, office, delivery, and collection
              services.
            </p>
            <h2>Orders and enquiries</h2>
            <p>
              Submitted order details are treated as requests until Pexpacks Supplies confirms pack availability, pricing,
              delivery details, and payment instructions.
            </p>
            <h2>Updates</h2>
            <p>Pexpacks Supplies may update website content, pack details, and service information when needed.</p>
          </article>
        </div>
      </section>
    </>
  );
}
