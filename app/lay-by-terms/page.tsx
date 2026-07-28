import type { Metadata } from "next";
import {
  LegalDocumentPage,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Lay-by Terms",
  "Pexpacks Lay-by Terms & Conditions — Official statutory terms regulating lay-by payment plans in full compliance with Section 62 of the Consumer Protection Act (CPA 68 of 2008).",
  "/lay-by-terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/lay-by-terms",
  pageTitle: "Lay-by Terms & Conditions",
  metaDescription:
    "Pexpacks Lay-by Terms & Conditions — Official statutory terms regulating lay-by payment plans in full compliance with Section 62 of the Consumer Protection Act (CPA 68 of 2008).",
  heroEyebrow: "Statutory Lay-By Agreement (CPA Section 62)",
  heroTitle: "Interest-Free School Stationery Lay-By Terms",
  heroText:
    "This document sets out the legal conditions governing Pexpacks interest-free lay-by payment plans for school stationery packs, in strict compliance with Section 62 of the Consumer Protection Act.",
  heroPanelTitle: `Last Updated: ${EFFECTIVE_DATE}`,
  heroPanelText: "CPA Section 62 Compliant — Republic of South Africa",
  tocHeading: "Lay-by Terms Contents",
  tocAriaLabel: "Lay-by terms contents",
  summaryKicker: "Key Lay-By Notice",
  summaryTitle: "Interest-Free Flexible Payments with Full CPA Protection",
  summaryText:
    "Pexpacks offers a credit-free, interest-free lay-by facility allowing parents and guardians to secure school stationery packs over 5 monthly installments. All lay-by agreements are regulated by Section 62 of the Consumer Protection Act 68 of 2008.",
  highlights: [
    {
      title: "Zero Interest Guarantee",
      content:
        "No interest, finance charges, or credit checks apply. Title remains with Pexpacks until full payment is received.",
      tone: "accent",
    },
    {
      title: "CPA Cancellation Protection",
      content:
        "Customers may cancel a lay-by agreement at any time before final settlement and receive a full refund less the statutory cancellation fee permitted under CPA Section 62.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "statutory-framework",
      eyebrow: "1",
      title: "Legislative Framework & Section 62 Compliance",
      summary:
        "The legal basis of the Pexpacks lay-by facility under South African consumer law.",
      content: (
        <>
          <p>
            Pexpacks Supplies (&ldquo;Pexpacks,&rdquo; &ldquo;we,&rdquo; or &ldquo;our&rdquo;) provides an interest-free lay-by payment facility to parents and legal guardians (&ldquo;you&rdquo; or &ldquo;customer&rdquo;) for the reservation and purchase of school stationery packs.
          </p>
          <p>
            This agreement is governed by Section 62 of the <strong>Consumer Protection Act, 68 of 2008 (CPA)</strong> and the Consumer Protection Regulations. It is a credit-free installment agreement. No interest is charged, and no credit assessment or credit bureau reporting is conducted under the National Credit Act.
          </p>
        </>
      ),
    },
    {
      id: "eligibility-agreement",
      eyebrow: "2",
      title: "Eligibility and Agreement Activation",
      summary:
        "Requirements to enter into a valid lay-by contract.",
      content: (
        <>
          <p>To enter into a lay-by agreement, the customer must:</p>
          <ul>
            <li>Be a natural person of 18 years or older residing in South Africa;</li>
            <li>Provide accurate contact details, learner details, and school pack selections;</li>
            <li>Pay the required initial deposit equal to one month's installment.</li>
          </ul>
          <p>
            Upon receipt of the initial deposit, Pexpacks reserves the nominated stationery pack stock or reserves the required list inventory for assembly.
          </p>
        </>
      ),
    },
    {
      id: "payment-schedule",
      eyebrow: "3",
      title: "Installment Schedule, Price Lock, & Deadline",
      summary:
        "Payment structure, sealed price guarantee, and the final October 31st settlement deadline.",
      content: (
        <>
          <h3>1. Sealed Price Guarantee</h3>
          <p>
            The stationery pack price agreed upon at the date of lay-by activation is a <strong>sealed, fixed price</strong>. Pexpacks guarantees that the agreed purchase price will not increase during the lay-by term, regardless of supplier price increases or inflation.
          </p>
          <h3>2. Installment Schedule</h3>
          <p>
            Payments are structured into 5 equal monthly installments commencing at the end of June. The initial deposit serves as the first installment. Early settlement is permitted at any time without penalty.
          </p>
          <h3>3. Final Settlement Deadline (October 31st)</h3>
          <p>
            All lay-by balances must be fully paid and cleared by <strong>October 31st</strong> of the current year. This deadline is essential to allow Pexpacks to perform quality checking, Pexcover™ book covering, and dispatch logistics during November and December prior to school reopening in January.
          </p>
        </>
      ),
    },
    {
      id: "cancellation-refunds",
      eyebrow: "4",
      title: "Cancellation Rights and Refunds (CPA Section 62)",
      summary:
        "Statutory cancellation rights, refund timelines, and cancellation fee limits.",
      content: (
        <>
          <p>
            In accordance with Section 62(1) and 62(2) of the CPA:
          </p>
          <ul>
            <li>
              <strong>Cancellation by Consumer:</strong> You may cancel your lay-by agreement at any time prior to full payment by delivering a written cancellation notice to Pexpacks (<a href="mailto:lay-by@pexpacks.co.za">lay-by@pexpacks.co.za</a>).
            </li>
            <li>
              <strong>Statutory Cancellation Fee:</strong> In terms of Section 62(4)(a) of the CPA and Regulation 22, upon cancellation, Pexpacks is entitled to charge a cancellation fee capped at <strong>1% of the total lay-by purchase price</strong>, or actual reasonable costs incurred.
            </li>
            <li>
              <strong>Statutory Refund Timeline:</strong> Pexpacks will refund all monies paid by the customer, less the statutory cancellation fee, within <strong>14 business days</strong> of receiving the written cancellation notice.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "default-remedies",
      eyebrow: "5",
      title: "Payment Default and Supplier Cancellation",
      summary:
        "Notice periods and remedies if an installment is defaulted.",
      content: (
        <>
          <p>
            If an installment is missed, Pexpacks will issue a payment reminder notice giving a 14-day grace period. If the default is not remedied within the grace period or if the balance remains unpaid after October 31st, Pexpacks may cancel the lay-by agreement, re-allocate the reserved goods, and refund the customer all amounts paid less the statutory cancellation fee (CPA Section 62(4)).
          </p>
          <p>
            <strong>No Dispatch Without Full Settlement:</strong> Pexpacks will not dispatch or deliver any portion of a stationery pack until the lay-by balance is fully settled and cleared.
          </p>
        </>
      ),
    },
  ],
};

export default function LayByTermsPage() {
  return <LegalDocumentPage {...config} />;
}
