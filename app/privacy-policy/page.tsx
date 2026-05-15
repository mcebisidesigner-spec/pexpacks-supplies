import type { Metadata } from "next";
import {
  generalEmail,
  generalEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Privacy Policy",
  "Read the Pexpacks privacy policy for school and office stationery pack enquiries, orders, delivery details and customer support.",
  "/privacy-policy"
);

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Privacy policy</p>
          <h1>How Pexpacks handles your information</h1>
          <p className={page.pageHeroText}>
            We use order and enquiry details to prepare stationery packs,
            confirm delivery or collection options, and respond to customer
            support requests.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div className={page.sectionInner}>
          <article className={page.infoCard}>
            <p className={page.kicker}>Collected details</p>
            <h2>Information we collect</h2>
            <p>
              Pexpacks may collect contact details, school and grade selections,
              delivery preferences, and order notes submitted through the
              website.
            </p>
            <p className={page.kicker}>Purpose of use</p>
            <h2>How we use it</h2>
            <p>
              We use this information to process enquiries, prepare stationery
              packs, arrange delivery or collection, and communicate order
              updates.
            </p>
            <p className={page.kicker}>Data retention</p>
            <h2>How long we keep it</h2>
            <p>
              Enquiry and order details are kept only for as long as needed to
              respond, confirm pack availability, support delivery or
              collection, handle follow-up questions, and meet reasonable
              record-keeping needs.
            </p>
            <p className={page.kicker}>Privacy handling</p>
            <h2>POPIA-conscious handling</h2>
            <p>
              Pexpacks aims to collect only the information needed for the
              requested service and to keep customer details protected from
              unnecessary access, sharing, or reuse.
            </p>
            <p className={page.kicker}>Privacy support</p>
            <h2>Support</h2>
            <p>
              For privacy questions, email{" "}
              <a href={generalEmailHref}>{generalEmail}</a>, call{" "}
              <a href={phoneHref}>{phoneNumber}</a>, or use the contact page.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
