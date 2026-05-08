import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Terms of Use",
  "Read the PexPacks terms of use for school stationery packs, office packs, order enquiries, delivery and collection services.",
  "/terms"
);

export default function TermsPage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Terms of Use</p>
          <h1>Using the PexPacks website</h1>
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
              Website content is provided to help customers understand PexPacks school, office, delivery, and collection
              services.
            </p>
            <h2>Orders and enquiries</h2>
            <p>
              Submitted order details are treated as enquiry requests until PexPacks confirms pack availability, pricing,
              delivery details, collection options, and payment instructions. No online payment is taken through the
              current enquiry flow.
            </p>
            <h2>Customer responsibility</h2>
            <p>
              Customers should check school names, grades, contact details, delivery preferences, and pack requirements
              before submitting an enquiry or order request.
            </p>
            <h2>Updates</h2>
            <p>PexPacks may update website content, pack details, and service information when needed.</p>
          </article>
        </div>
      </section>
    </>
  );
}
