import type { Metadata } from "next";
import Link from "next/link";
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
  "Pexpacks Supplies Privacy Policy – How we handle and protect your personal information in compliance with POPIA.",
  "/privacy-policy"
);

const currentDate = new Date().toLocaleDateString("en-ZA", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Privacy Policy</p>
          <h1>How Pexpacks handles your information</h1>
          <p className={page.pageHeroText}>
            We respect your privacy and are committed to protecting your personal
            information in accordance with South African law, including the
            Protection of Personal Information Act (POPIA).
          </p>
        </div>
      </section>
      
      <section className={page.section}>
        <div className={page.sectionInner}>
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            <article className={page.infoCard}>
              <p className={page.kicker}>Business Details</p>
              <h2>Pexpacks Supplies</h2>
              <ul>
                <li><strong>Effective Date:</strong> May 2026</li>
                <li><strong>Website:</strong> www.pexpacks.co.za</li>
                <li><strong>Trading Name:</strong> Pexpacks / Pexcover</li>
                <li><strong>Country of Operation:</strong> South Africa</li>
                <li><strong>Contact Email:</strong> <a href={generalEmailHref}>{generalEmail}</a></li>
                <li><strong>Contact Number:</strong> <a href={phoneHref}>{phoneNumber}</a></li>
                <li><strong>Information Officer:</strong> Privacy Officer</li>
              </ul>
            </article>

            <article className={page.infoCard}>
              <p className={page.kicker}>1 - 3</p>
              <h2>Introduction & Scope</h2>
              <p>
                Pexpacks Supplies respects your privacy and is committed to protecting your personal information in accordance with the <strong>Protection of Personal Information Act, 4 of 2013 (“POPIA”)</strong>, the <strong>Promotion of Access to Information Act, 2 of 2000 (“PAIA”)</strong>, the <strong>Electronic Communications and Transactions Act, 25 of 2002 (“ECTA”)</strong>, the <strong>Consumer Protection Act, 68 of 2008 (“CPA”)</strong>, and other applicable South African laws.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, share, protect, and delete personal information when you use our website, web app, online forms, order system, communication channels, social media pages, customer support platforms, delivery services, and related services.
              </p>
              <p>
                This Policy applies to customers, parents, guardians, learners where applicable, school representatives, business clients, suppliers, contractors, employees, job applicants, website visitors, and other persons who interact with Pexpacks.
              </p>
            </article>

            <article className={page.infoCard}>
              <p className={page.kicker}>4</p>
              <h2>Personal Information We Collect</h2>
              
              <h3>Customer & Website User Information</h3>
              <p>We may collect your full name, email address, mobile number, physical and delivery address, order details, payment status, communication preferences, and device/browser usage information.</p>
              
              <h3>Learner-Related Information</h3>
              <p>
                Where Pexpacks provides school stationery packs or Pexcover services, we may collect limited learner-related information where necessary, such as learner name, grade, school name, stationery list requirements, and delivery preferences. We only collect learner information to fulfil orders and treat it with additional care as required by POPIA.
              </p>
              
              <h3>School and Business Client Information</h3>
              <p>For schools and SMEs, we collect organisation names, contact person details, procurement and billing information, and related service records.</p>
              
              <h3>Payment & Technical Information</h3>
              <p>We collect order totals, payment references, IP addresses, and cookies to ensure website security and order processing. We do not store full card numbers directly.</p>
            </article>

            <article className={page.infoCard}>
              <p className={page.kicker}>5 - 7</p>
              <h2>How & Why We Process Information</h2>
              <p>
                We collect personal information directly from you, from parents/schools, payment providers, couriers, and website analytics.
              </p>
              <p>We use this information to:</p>
              <ul>
                <li>Process stationery and office supply orders</li>
                <li>Provide Pexcover book-covering services</li>
                <li>Coordinate collection or delivery</li>
                <li>Manage school and business relationships</li>
                <li>Respond to enquiries and provide customer support</li>
                <li>Maintain website functionality and security</li>
                <li>Comply with legal, tax, and regulatory duties</li>
              </ul>
              <p>
                We only process personal information where we have a lawful basis under POPIA, such as your consent, contractual necessity, legal obligation, or legitimate interest.
              </p>
            </article>

            <article className={page.infoCard}>
              <p className={page.kicker}>8 - 11</p>
              <h2>Children, Marketing & Cookies</h2>
              <h3>Children’s Information</h3>
              <p>
                We only process children’s information when provided by a parent, guardian, or school for the purpose of fulfilling an order. We do not sell children’s personal information or use it for unrelated marketing.
              </p>
              
              <h3>Direct Marketing</h3>
              <p>
                We may send marketing messages about specials or new services where permitted by law. Every marketing message will include a way to opt out or unsubscribe.
              </p>

              <h3>Cookies</h3>
              <p>
                Our website uses essential, performance, and functional cookies to keep the website running smoothly, enable account functionalities, and analyse website traffic. You can control cookies through your browser settings.
              </p>
            </article>

            <article className={page.infoCard}>
              <p className={page.kicker}>12 - 15</p>
              <h2>When We Share Information</h2>
              <p>
                We may share personal information only where necessary and lawful. This includes sharing with:
              </p>
              <ul>
                <li>Payment service providers for secure transactions</li>
                <li>Delivery and courier partners to fulfill your order</li>
                <li>Website hosting and IT support providers</li>
                <li>Schools (where relevant to bulk school orders or distribution)</li>
                <li>Legal advisors or regulatory authorities where legally required</li>
              </ul>
              <p>We require all operators and service providers to process personal information securely. <strong>We do not sell personal information.</strong></p>
            </article>

            <article className={page.infoCard}>
              <p className={page.kicker}>16 - 20</p>
              <h2>Security, Retention & Transfers</h2>
              <p>
                <strong>Security:</strong> Pexpacks implements reasonable technical and organisational measures (HTTPS, access controls, firewalls) to protect personal information against loss, unauthorised access, or cyber threats.
              </p>
              <p>
                <strong>Data Breach:</strong> In the event of a security compromise, we will take steps to investigate, contain the breach, and notify affected persons and the Information Regulator as required.
              </p>
              <p>
                <strong>Retention:</strong> We keep personal information only for as long as necessary. For example, customer orders are retained for minimum periods required by accounting laws, while enquiries are kept until resolved.
              </p>
              <p>
                <strong>Cross-Border Transfers:</strong> Some service providers may store information outside South Africa. We ensure such transfers comply with POPIA safeguards.
              </p>
            </article>

            <article className={page.infoCard}>
              <p className={page.kicker}>21 - 24</p>
              <h2>Your Rights & Complaints</h2>
              <p>As a data subject under POPIA, you have the right to:</p>
              <ul>
                <li>Request access to your personal information</li>
                <li>Request correction or deletion of inaccurate or outdated information</li>
                <li>Object to processing or withdraw consent</li>
                <li>Object to direct marketing</li>
              </ul>
              <p>
                To exercise your rights, please email us at <a href={generalEmailHref}>{generalEmail}</a>.
              </p>
              <p>
                If you believe your information has been processed unlawfully, please contact us first. You also have the right to lodge a complaint with the <strong>Information Regulator of South Africa</strong> at <a href="https://inforegulator.org.za/" target="_blank" rel="noopener noreferrer">inforegulator.org.za</a>.
              </p>
            </article>

            <article className={page.infoCard}>
              <p className={page.kicker}>25 - 36</p>
              <h2>Other Important Information</h2>
              <p>
                <strong>Accuracy:</strong> Please notify us if your personal information (especially delivery addresses) changes. We are not responsible for delivery failures caused by inaccurate customer information.
              </p>
              <p>
                <strong>Third-Party Links:</strong> Our website may link to courier platforms or payment providers. We are not responsible for their privacy practices.
              </p>
              <p>
                <strong>Job Applicants & Suppliers:</strong> We process applicant and supplier information strictly for recruitment, verification, service delivery, and operational requirements.
              </p>
              <p>
                <strong>Updates to this Policy:</strong> We may update this policy to reflect legal or business changes. Continued use of our services constitutes acceptance of the updated policy.
              </p>
            </article>

          </div>
        </div>
      </section>
    </>
  );
}
