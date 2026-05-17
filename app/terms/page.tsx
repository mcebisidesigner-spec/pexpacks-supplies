import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Terms of Use",
  "Read the Pexpacks terms of use for school stationery packs, office packs, order enquiries, delivery and collection services.",
  "/terms"
);

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Terms of use"
        title="Using the Pexpacks website"
        text="These terms explain the basic conditions for browsing the website and submitting stationery pack enquiries or order requests."
        panelTitle="Terms"
        panelText="Information about using our site."
      />
      <section className={page.section}>
        <div className={page.sectionInner}>
          <article className={page.infoCard}>
            <p className={page.kicker}>Website guidance</p>
            <h2>Website information</h2>
            <p>
              Website content is provided to help customers understand Pexpacks
              school, office, delivery, and collection services.
            </p>
            <p className={page.kicker}>Order enquiries</p>
            <h2>Orders and enquiries</h2>
            <p>
              Submitted order details are treated as enquiry requests until
              Pexpacks confirms pack availability, pricing, delivery details,
              collection options, and payment instructions. No online payment is
              taken through the current enquiry flow.
            </p>
            <p className={page.kicker}>Customer details</p>
            <h2>Customer responsibility</h2>
            <p>
              Customers should check school names, grades, contact details,
              delivery preferences, and pack requirements before submitting an
              enquiry or order request.
            </p>
            <p className={page.kicker}>Content updates</p>
            <h2>Updates</h2>
            <p>
              Pexpacks may update website content, pack details, and service
              information when needed.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
