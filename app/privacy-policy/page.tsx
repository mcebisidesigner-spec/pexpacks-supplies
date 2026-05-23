import type { Metadata } from "next";
import {
  generalEmail,
  generalEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Privacy Policy",
  "Pexpacks Supplies Privacy Policy - How we handle and protect your personal information in compliance with POPIA.",
  "/privacy-policy"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/privacy-policy",
  pageTitle: "Privacy Policy",
  metaDescription:
    "Pexpacks Supplies Privacy Policy - How we handle and protect your personal information in compliance with POPIA.",
  heroEyebrow: "Pex your privacy",
  heroTitle: "How Pexpacks handles your information",
  heroText:
    "A clear guide to what we collect, why we collect it, who we share it with, and how you can contact us about your personal information.",
  heroPanelTitle: "POPIA Aligned",
  heroPanelText: `Effective ${EFFECTIVE_DATE}, South Africa`,
  tocHeading: "Privacy contents",
  tocAriaLabel: "Privacy policy table of contents",
  summaryKicker: "Quick privacy contact",
  summaryTitle: "Need help with your data?",
  summaryText: "",
  highlights: [
    {
      title: "Contact",
      content: (
        <>
          Email <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>. We will route privacy requests
          to the Pexpacks Privacy Officer.
        </>
      ),
      tone: "accent",
    },
  ],
  sections: [
    {
      id: "business-details",
      eyebrow: "Business details",
      title: "Pexpacks Supplies",
      summary:
        "The official privacy contact details for Pexpacks, Pexcover, and this website.",
      content: (
        <>
          <h3>Key details</h3>
          <ul>
            <li>
              <strong>Effective date:</strong> {EFFECTIVE_DATE}
            </li>
            <li>
              <strong>Website:</strong> www.Pexpacks.co.za
            </li>
            <li>
              <strong>Trading name:</strong> Pexpacks / Pexcover
            </li>
            <li>
              <strong>Country of operation:</strong> South Africa
            </li>
            <li>
              <strong>Contact email:</strong>{" "}
              <a href={generalEmailHref}>{generalEmail}</a>
            </li>
            <li>
              <strong>Contact number:</strong>{" "}
              <a href={phoneHref}>{phoneNumber}</a>
            </li>
            <li>
              <strong>Information Officer:</strong> Privacy Officer
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "scope",
      eyebrow: "1 - 3",
      title: "Introduction and scope",
      summary:
        "This policy explains when the privacy rules apply and who they protect.",
      content: (
        <>
          <p>
            Pexpacks Supplies respects your privacy and is committed to
            protecting your personal information in accordance with the{" "}
            <strong>
              Protection of Personal Information Act, 4 of 2013 (POPIA)
            </strong>
            , the{" "}
            <strong>
              Promotion of Access to Information Act, 2 of 2000 (PAIA)
            </strong>
            , the{" "}
            <strong>
              Electronic Communications and Transactions Act, 25 of 2002 (ECTA)
            </strong>
            , the <strong>Consumer Protection Act, 68 of 2008 (CPA)</strong>,
            and other applicable South African laws.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, share,
            protect, and delete personal information when you use our website,
            web app, online forms, order system, communication channels, social
            media pages, customer support platforms, delivery services, and
            related services.
          </p>
          <p>
            This Policy applies to customers, parents, guardians, learners where
            applicable, school representatives, business clients, suppliers,
            contractors, employees, job applicants, website visitors, and other
            persons who interact with Pexpacks.
          </p>
        </>
      ),
    },
    {
      id: "information-we-collect",
      eyebrow: "4",
      title: "Personal information we collect",
      summary:
        "We collect only the information needed to operate orders, services, support, and site security.",
      content: (
        <>
          <h3>Customer and website user information</h3>
          <p>
            We may collect your full name, email address, mobile number,
            physical and delivery address, order details, payment status,
            communication preferences, and device/browser usage information.
          </p>
          <h3>Learner-related information</h3>
          <p>
            Where Pexpacks provides school stationery packs or Pexcover
            services, we may collect limited learner-related information where
            necessary, such as learner name, grade, school name, stationery list
            requirements, and delivery preferences. We only collect learner
            information to fulfil orders and treat it with additional care as
            required by POPIA.
          </p>
          <h3>School and business client information</h3>
          <p>
            For schools and SMEs, we collect organisation names, contact person
            details, procurement and billing information, and related service
            records.
          </p>
          <h3>Payment and technical information</h3>
          <p>
            We collect order totals, payment references, IP addresses, and
            cookies to ensure website security and order processing. We do not
            store full card numbers directly.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use-information",
      eyebrow: "5 - 7",
      title: "How and why we process information",
      summary:
        "Personal information is used to fulfil services, support customers, and meet legal duties.",
      content: (
        <>
          <p>
            We collect personal information directly from you, from
            parents/schools, payment providers, couriers, and website analytics.
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
            We only process personal information where we have a lawful basis
            under POPIA, such as your consent, contractual necessity, legal
            obligation, or legitimate interest.
          </p>
        </>
      ),
    },
    {
      id: "children-marketing-cookies",
      eyebrow: "8 - 11",
      title: "Children, marketing and cookies",
      summary:
        "Learner information is handled carefully, marketing is opt-out friendly, and cookies are limited to website needs.",
      content: (
        <>
          <h3>Children's information</h3>
          <p>
            We only process children's information when provided by a parent,
            guardian, or school for the purpose of fulfilling an order. We do not
            sell children's personal information or use it for unrelated
            marketing.
          </p>
          <h3>Direct marketing</h3>
          <p>
            We may send marketing messages about specials or new services where
            permitted by law. Every marketing message will include a way to opt
            out or unsubscribe.
          </p>
          <h3>Cookies</h3>
          <p>
            Our website uses essential, performance, and functional cookies to
            keep the website running smoothly, enable account functionalities,
            and analyse website traffic. You can control cookies through your
            browser settings.
          </p>
        </>
      ),
    },
    {
      id: "sharing-information",
      eyebrow: "12 - 15",
      title: "When we share information",
      summary:
        "We share information only when it is needed for service delivery, compliance, or security.",
      content: (
        <>
          <p>
            We may share personal information only where necessary and lawful.
            This includes sharing with:
          </p>
          <ul>
            <li>Payment service providers for secure transactions</li>
            <li>Delivery and courier partners to fulfil your order</li>
            <li>Website hosting and IT support providers</li>
            <li>
              Schools, where relevant to bulk school orders or distribution
            </li>
            <li>
              Legal advisors or regulatory authorities where legally required
            </li>
          </ul>
          <p>
            We require all operators and service providers to process personal
            information securely.{" "}
            <strong>We do not sell personal information.</strong>
          </p>
        </>
      ),
    },
    {
      id: "security-retention-transfers",
      eyebrow: "16 - 20",
      title: "Security, retention and transfers",
      summary:
        "We use reasonable safeguards, keep information only as needed, and apply POPIA safeguards to transfers.",
      content: (
        <>
          <p>
            <strong>Security:</strong> Pexpacks implements reasonable technical
            and organisational measures, including HTTPS, access controls, and
            firewalls, to protect personal information against loss, unauthorised
            access, or cyber threats.
          </p>
          <p>
            <strong>Data breach:</strong> In the event of a security compromise,
            we will take steps to investigate, contain the breach, and notify
            affected persons and the Information Regulator as required.
          </p>
          <p>
            <strong>Retention:</strong> We keep personal information only for as
            long as necessary. For example, customer orders are retained for
            minimum periods required by accounting laws, while enquiries are kept
            until resolved.
          </p>
          <p>
            <strong>Cross-border transfers:</strong> Some service providers may
            store information outside South Africa. We ensure such transfers
            comply with POPIA safeguards.
          </p>
        </>
      ),
    },
    {
      id: "rights-complaints",
      eyebrow: "21 - 24",
      title: "Your rights and complaints",
      summary:
        "You can ask to access, correct, delete, object to, or limit processing of your personal information.",
      content: (
        <>
          <p>As a data subject under POPIA, you have the right to:</p>
          <ul>
            <li>Request access to your personal information</li>
            <li>
              Request correction or deletion of inaccurate or outdated
              information
            </li>
            <li>Object to processing or withdraw consent</li>
            <li>Object to direct marketing</li>
          </ul>
          <p>
            To exercise your rights, please email us at{" "}
            <a href={generalEmailHref}>{generalEmail}</a>.
          </p>
          <p>
            If you believe your information has been processed unlawfully,
            please contact us first. You also have the right to lodge a
            complaint with the{" "}
            <strong>Information Regulator of South Africa</strong> at{" "}
            <a
              href="https://inforegulator.org.za/"
              target="_blank"
              rel="noopener noreferrer"
            >
              inforegulator.org.za
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: "other-important-information",
      eyebrow: "25 - 36",
      title: "Other important information",
      summary:
        "Accuracy, third-party links, recruitment, supplier records, and future policy updates.",
      content: (
        <>
          <p>
            <strong>Accuracy:</strong> Please notify us if your personal
            information, especially delivery addresses, changes. We are not
            responsible for delivery failures caused by inaccurate customer
            information.
          </p>
          <p>
            <strong>Third-party links:</strong> Our website may link to courier
            platforms or payment providers. We are not responsible for their
            privacy practices.
          </p>
          <p>
            <strong>Job applicants and suppliers:</strong> We process applicant
            and supplier information strictly for recruitment, verification,
            service delivery, and operational requirements.
          </p>
          <p>
            <strong>Updates to this Policy:</strong> We may update this policy to
            reflect legal or business changes. Continued use of our services
            constitutes acceptance of the updated policy.
          </p>
        </>
      ),
    },
  ],
};

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage {...config} />;
}
