import type { Metadata } from "next";
import Link from "next/link";
import {
  legalEmail as generalEmail,
  legalEmailHref as generalEmailHref,
  hasWhatsAppNumber,
  phoneHref,
  phoneNumber,
  whatsappNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  legalStyles,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Terms of Use",
  "Pexpacks Supplies Official Terms of Use — Statutory conditions governing online stationery pack orders, Pexcover services, electronic transactions under ECTA, and consumer rights under the CPA.",
  "/terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/terms",
  pageTitle: "Terms of Use",
  metaDescription:
    "Pexpacks Supplies Official Terms of Use — Statutory conditions governing online stationery pack orders, Pexcover services, electronic transactions under ECTA, and consumer rights under the CPA.",
  heroEyebrow: "Statutory Terms of Use (ECTA 25 of 2002 & CPA 68 of 2008)",
  heroTitle: "General Terms & Conditions of Sale and Website Use",
  heroText:
    "These statutory terms regulate your use of the Pexpacks website, web application, online checkout, school stationery pack orders, Pexcover services, and customer support channels.",
  heroPanelTitle: `Last Updated: ${EFFECTIVE_DATE}`,
  heroPanelText: "Republic of South Africa",
  tocHeading: "Terms Contents",
  tocAriaLabel: "Terms of use table of contents",
  summaryKicker: "Key Legal Summary",
  summaryTitle: "Important Notice Before You Place an Order",
  summaryText:
    "Review your school list, learner grade, contact information, and delivery option carefully before submitting an order. Customised school packs, pre-labelled stationery, and Pexcover book-covering services carry statutory return restrictions once processing has commenced.",
  highlights: [
    {
      title: "CPA Section 49 Notice",
      content:
        "Important provisions limiting liability, allocating delivery risk, or restricting returns are highlighted in bold callout boxes in compliance with Section 49 of the Consumer Protection Act.",
      tone: "warning",
    },
    {
      title: "ECTA Section 43 Compliance",
      content:
        "Comprehensive statutory disclosures regarding our business entity, physical contact details, product pricing, and electronic contracting rules are provided herein.",
      tone: "accent",
    },
  ],
  sections: [
    {
      id: "business-details",
      eyebrow: "ECTA Section 43 Disclosures",
      title: "Statutory Supplier Disclosures",
      summary:
        "Full business information required under Section 43 of the Electronic Communications and Transactions Act (ECTA 25 of 2002).",
      content: (
        <>
          <h3>Statutory Supplier Information</h3>
          <ul>
            <li>
              <strong>Full Registered Entity:</strong> Pexpacks Supplies (Pty) Ltd / Pexpacks Trading
            </li>
            <li>
              <strong>Trading Name:</strong> Pexpacks / Pexcover
            </li>
            <li>
              <strong>Last Updated:</strong> October 2025
            </li>
            <li>
              <strong>Physical / Postal Address:</strong> Shared on official tax invoices, formal quotations, or written request.
            </li>
            <li>
              <strong>Country of Incorporation:</strong> Republic of South Africa
            </li>
            <li>
              <strong>Official Website:</strong>{" "}
              <a href={siteUrl}>{siteUrl.replace(/^https?:\/\//, "www.")}</a>
            </li>
            <li>
              <strong>Customer Support Email:</strong>{" "}
              <a href={generalEmailHref}>{generalEmail}</a>
            </li>
            <li>
              <strong>Customer Support Telephone:</strong>{" "}
              <a href={phoneHref}>{phoneNumber}</a>
            </li>
            <li>
              <strong>WhatsApp Support:</strong>{" "}
              {hasWhatsAppNumber ? whatsappNumber : "Available on request"}
            </li>
            <li>
              <strong>Codes of Conduct:</strong> Compliant with the Consumer Protection Act 68 of 2008 Code of Conduct and POPIA regulations.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "introduction",
      eyebrow: "1 — 4",
      title: "Scope, Legal Capacity, and Contract Formation",
      summary:
        "Application of these terms and electronic contract formation rules under ECTA.",
      content: (
        <>
          <p>
            These Terms of Use govern access to and use of the Pexpacks website, web application, checkout workflows, quote request portals, and electronic communication channels.
          </p>
          <p>
            By accessing the website, placing an order, completing an online transaction, or submitting a enquiry, you enter into a legally binding agreement with Pexpacks subject to these Terms, our{" "}
            <Link href="/privacy-policy">Privacy Policy</Link>,{" "}
            <Link href="/delivery-policy">Delivery Policy</Link>,{" "}
            <Link href="/returns-refunds-policy">Returns &amp; Refunds Policy</Link>, and{" "}
            <Link href="/happy-pay-terms">Happy Pay Terms</Link>.
          </p>
          <h3>Legal Capacity (ECTA &amp; Common Law)</h3>
          <ul>
            <li>You must be at least 18 years of age or possess full legal capacity to enter into binding transactions.</li>
            <li>Minors must act with the express consent and assistance of a parent or legal guardian.</li>
            <li>Persons placing orders on behalf of schools or corporate entities warrant that they possess express authority to bind such institution.</li>
          </ul>
          <h3>Electronic Contract Formation (ECTA Section 22)</h3>
          <p>
            In terms of Section 22 of ECTA, electronic agreements are valid and enforceable. An order submitted by a customer constitutes an offer to purchase. A binding contract is formed only when Pexpacks issues an electronic order confirmation or commences fulfillment.
          </p>
        </>
      ),
    },
    {
      id: "services",
      eyebrow: "5 — 9",
      title: "Products, School Lists, and Service Specifications",
      summary:
        "Stationery supply packs, Pexcover book services, and list accuracy guidelines.",
      content: (
        <>
          <p>Pexpacks provides goods and services including:</p>
          <ul>
            <li>Grade-specific school stationery supply packs compiled according to school requirements</li>
            <li>Custom stationery list selection and itemized parent ordering</li>
            <li>Pexcover™ professional book-covering, sorting, and learner name-labelling services</li>
            <li>Bulk educational institution supply procurement</li>
          </ul>
          <h3>School List Accuracy &amp; Product Substitution</h3>
          <p>
            Product images are for illustrative purposes. Pexpacks endeavors to supply specified stationery brands. Where a brand is out of stock due to seasonal supply chain constraints, Pexpacks reserves the right to supply a substitute item of equivalent or superior quality and equal value, in accordance with Section 19 or Section 55 of the CPA.
          </p>
        </>
      ),
    },
    {
      id: "school-and-pexcover",
      eyebrow: "10 — 14",
      title: "School Packs, Pexcover™, and Custom Fulfillment Exclusions",
      summary:
        "Statutory terms governing customized orders, labelling, and Pexcover labour.",
      content: (
        <>
          <h3>Pexcover™ and Custom Labelling Services</h3>
          <p>
            Pexcover services involve labour-intensive book covering, sorting, and customized learner name-labelling. Customers must supply accurate learner name details, book counts, and size instructions.
          </p>
          <div className={legalStyles.noticeBlock}>
            <p>
              <strong>CPA Section 49 Conspicuous Notice on Custom Work:</strong>
            </p>
            <p>
              Once Pexcover book-covering, personalized name-labelling, or custom list collation has commenced, such goods are classified as customized or personalized items. In terms of South African consumer law, change-of-mind cancellations or returns are restricted once custom work or labor has been performed, except where items are defective.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "quotes-orders",
      eyebrow: "15 — 18",
      title: "Quotations, Pricing, and Error Corrections",
      summary:
        "Quotation validity, pricing terms in ZAR, and rectification of inadvertent system errors.",
      content: (
        <>
          <p>
            All prices listed on the website or quoted are in South African Rand (ZAR). Pexpacks reserves the right to correct inadvertent pricing, calculation, or typographical errors on the website or quotes prior to order acceptance (ECTA Section 43(1)(g)).
          </p>
          <p>
            Quotations issued by Pexpacks remain valid for the period specified on the quote (typically 14 to 30 days) and are subject to stock availability.
          </p>
        </>
      ),
    },
    {
      id: "pricing-payment",
      eyebrow: "19 — 22",
      title: "Payment Methods and Payment Security",
      summary:
        "Payment execution, credit card processing, and PCI-DSS payment gateways.",
      content: (
        <>
          <p>
            Payment must be completed in full prior to order dispatch or custom Pexcover work, unless formal corporate/school credit terms have been agreed in writing.
          </p>
          <p>
            Approved payment options include Electronic Funds Transfer (EFT), instant EFT, debit cards, and credit cards processed via authorized South African payment gateways.
          </p>
          <p>
            Pexpacks does not store raw credit/debit card numbers. All electronic card transactions are encrypted and processed by PCI-DSS compliant payment gateways.
          </p>
        </>
      ),
    },
    {
      id: "delivery-collection",
      eyebrow: "23 — 27",
      title: "Delivery, Risk, and School Handover",
      summary:
        "Delivery timelines, passing of risk under CPA Section 19, and school handover.",
      content: (
        <>
          <p>
            Full delivery conditions are detailed in our <Link href="/delivery-policy">Delivery Policy</Link>.
          </p>
          <div className={legalStyles.noticeBlock}>
            <p>
              <strong>Passing of Risk (CPA Section 19):</strong>
            </p>
            <p>
              Risk of loss or damage to goods passes to the customer upon doorstep delivery, handover to an authorized recipient, or handover to a designated school collection point.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "returns-cancellations",
      eyebrow: "28 — 32",
      title: "Returns, Refunds, and Statutory Warranties",
      summary:
        "CPA statutory implied warranty and ECTA cooling-off rights.",
      content: (
        <>
          <p>
            Return rights are regulated under our <Link href="/returns-refunds-policy">Returns &amp; Refunds Policy</Link>, complying with:
          </p>
          <ul>
            <li><strong>CPA Section 56 Implied Warranty of Quality:</strong> 6-month statutory right to repair, replace, or refund defective or damaged stationery goods.</li>
            <li><strong>ECTA Section 44 Cooling-Off Period:</strong> 7-day right to cancel non-customised online purchases (excluding return courier charges).</li>
          </ul>
        </>
      ),
    },
    {
      id: "accounts-content-ip",
      eyebrow: "36 — 39",
      title: "Intellectual Property and Site Usage",
      summary:
        "Ownership of trademarks, stationery list compilations, and website content.",
      content: (
        <>
          <p>
            All website designs, text, graphics, logos, images, custom stationery list structures, Pexcover™ branding, and source code are the intellectual property of Pexpacks Supplies or its licensors.
          </p>
          <p>
            Unauthorized copying, scraping, reproduction, or exploitation of website content or brand assets without prior written consent is strictly prohibited.
          </p>
        </>
      ),
    },
    {
      id: "availability-liability",
      eyebrow: "43 — 44",
      title: "Limitation of Liability and Indemnity",
      summary:
        "Plain-language limitation of liability in compliance with CPA Section 49.",
      content: (
        <>
          <div className={legalStyles.noticeBlock}>
            <p>
              <strong>CPA Section 49 Limitation Notice:</strong>
            </p>
            <p>
              To the maximum extent permitted by South African law (including the CPA), Pexpacks shall not be liable for indirect, consequential, or special damages arising from website unavailability, courier transit delays beyond reasonable control, or incorrect customer-provided order information. Pexpacks' total liability for direct damages relating to any order shall be capped at the total price paid for the affected items.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "complaints-law",
      eyebrow: "45",
      title: "Governing Law and Dispute Resolution",
      summary:
        "South African jurisdiction and good-faith dispute resolution procedures.",
      content: (
        <>
          <p>
            These Terms are governed by and construed in accordance with the laws of the <strong>Republic of South Africa</strong>.
          </p>
          <p>
            In the event of any dispute arising from an order or website transaction, the parties shall first attempt to resolve the matter in good faith through direct consultation. Customers retain the right to approach the Consumer Goods and Services Ombudsman (CGSO) or the Information Regulator where applicable.
          </p>
          <div className={legalStyles.contactPanel}>
            <p>
              <strong>Legal &amp; Customer Support Email:</strong>{" "}
              <a href={generalEmailHref}>{generalEmail}</a>
            </p>
            <p>
              <strong>Telephone:</strong> <a href={phoneHref}>{phoneNumber}</a>
            </p>
            <p>
              <strong>Website:</strong> <a href={siteUrl}>{siteUrl}</a>
            </p>
          </div>
        </>
      ),
    },
  ],
  extraContent: (
    <article className={legalStyles.documentCard}>
      <div className={legalStyles.sectionHeader}>
        <p>Statutory Consent Notice</p>
        <h2>Required Checkout &amp; Form Consent</h2>
      </div>
      <div className={legalStyles.sectionBody}>
        <div className={legalStyles.noticeBlock}>
          <p>
            <strong>Checkout Acceptance Wording</strong>
          </p>
          <p>
            By placing this order, I confirm that the learner, school, and item details are correct, and I agree to the Pexpacks Terms of Use, Privacy Policy, Delivery Policy, and Returns and Refunds Policy.
          </p>
        </div>
      </div>
    </article>
  ),
};

export default function TermsPage() {
  return <LegalDocumentPage {...config} />;
}
