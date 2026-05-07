import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Privacy Policy",
  "Read the Pexpacks Supplies privacy policy for school and office stationery pack enquiries and orders.",
  "/privacy-policy"
);

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Privacy Policy</p>
          <h1>How Pexpacks Supplies handles your information</h1>
          <p className={page.pageHeroText}>
            We use order and enquiry details to prepare stationery packs, confirm delivery or collection options, and
            respond to customer support requests.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div className={page.sectionInner}>
          <article className={page.infoCard}>
            <h2>Information we collect</h2>
            <p>
              Pexpacks Supplies may collect contact details, school and grade selections, delivery preferences, and order notes
              submitted through the website.
            </p>
            <h2>How we use it</h2>
            <p>
              We use this information to process enquiries, prepare stationery packs, arrange delivery or collection,
              and communicate order updates.
            </p>
            <h2>Support</h2>
            <p>For privacy questions, contact Pexpacks Supplies through the contact page.</p>
          </article>
        </div>
      </section>
    </>
  );
}
