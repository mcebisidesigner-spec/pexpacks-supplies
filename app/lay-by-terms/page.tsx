import type { Metadata } from "next";
import {
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  legalStyles,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Lay-by Terms",
  "Read the Pexpacks Lay-by Terms governing the lay-by payment plan, structured in accordance with Section 62 of the Consumer Protection Act (CPA) of South Africa.",
  "/lay-by-terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/lay-by-terms",
  pageTitle: "Lay-by Terms",
  metaDescription:
    "Read the Pexpacks Lay-by Terms governing the lay-by payment plan, structured in accordance with Section 62 of the Consumer Protection Act (CPA) of South Africa.",
  heroEyebrow: "Pex lay-by terms",
  heroTitle: "Lay-by agreement terms and conditions",
  heroText:
    "This document outlines the structuring and regulation of the Pexpacks lay-by agreement in accordance with the Consumer Protection Act (CPA) of South Africa, including payment plans, deposit requirements, timelines, and implications of non-compliance.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "CPA-compliant lay-by terms for school stationery packs.",
  tocHeading: "Lay-by contents",
  tocAriaLabel: "Lay-by terms contents",
  summaryKicker: "Lay-by overview",
  summaryTitle: "Flexible, interest-free payment for school stationery",
  summaryText:
    "Pexpacks offers a lay-by payment option that allows parents and guardians to secure their child's stationery pack by spreading the cost over several months with zero interest, in full compliance with Section 62 of the Consumer Protection Act (CPA) of South Africa.",
  highlights: [
    {
      title: "Contact",
      content: (
        <>
          Email <a href="mailto:lay-by@pexpacks.co.za">lay-by@pexpacks.co.za</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Important",
      content:
        "By entering into a lay-by agreement, you acknowledge that you have read, understood, and accepted these terms in full.",
      tone: "warning",
    },
    {
      title: "Legal framework",
      content:
        "This agreement is governed by the Consumer Protection Act 68 of 2008, specifically Section 62, and the common law of the Republic of South Africa.",
    },
  ],
  sections: [
    {
      id: "introduction",
      eyebrow: "1",
      title: "Introduction and purpose",
      summary:
        "This lay-by agreement allows customers to reserve stationery packs by paying in installments over an agreed period.",
      content: (
        <>
          <p>
            Pexpacks Supplies (&ldquo;Pexpacks,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) offers a lay-by payment facility to parents and guardians (&ldquo;you,&rdquo; &ldquo;your,&rdquo; or &ldquo;customer&rdquo;) for the purchase of school stationery packs. This facility is designed to make school preparation more affordable by allowing you to pay for your child&rsquo;s stationery pack over time, rather than in a single lump sum.
          </p>
          <p>
            The lay-by arrangement is structured as a credit-free installment plan. No interest is charged, and no credit score is affected. The agreement is governed by the Consumer Protection Act 68 of 2008 (&ldquo;CPA&rdquo;), and your rights as a consumer are fully protected.
          </p>
          <p>
            These terms apply to all lay-by agreements entered into between you and Pexpacks. By submitting a lay-by application and making an initial deposit, you confirm that you have read, understood, and agree to be bound by these terms.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      eyebrow: "2",
      title: "Eligibility and application",
      summary:
        "Lay-by is available to individuals 18 years or older who are resident in South Africa.",
      content: (
        <>
          <p>To qualify for a lay-by agreement, you must:</p>
          <ul>
            <li>Be a natural person 18 years of age or older.</li>
            <li>Be a resident of the Republic of South Africa.</li>
            <li>Provide full and accurate personal and contact information.</li>
            <li>Select a valid school stationery pack listed on the Pexpacks website.</li>
            <li>Submit a completed lay-by application form through the Pexpacks website.</li>
          </ul>
          <p>
            Pexpacks reserves the right to decline any lay-by application at its sole discretion, including where the required information is incomplete, inaccurate, or where the requested pack is unavailable.
          </p>
          <p>
            Approved applicants will receive a written lay-by agreement (via email) confirming the pack details, total price, deposit amount, installment schedule, and settlement date. The agreement must be reviewed and acknowledged before the lay-by is activated.
          </p>
        </>
      ),
    },
    {
      id: "payment-structure",
      eyebrow: "3",
      title: "Payment structure and schedule",
      summary:
        "Lay-by payments are made via cash deposit or EFT over a 5-month period. The deposit is a single payment equal to one month\u2019s installment, and full settlement is required by October 31st.",
      content: (
        <>
          <p>
            The lay-by payment structure is designed to be simple and transparent:
          </p>
          <ul>
            <li>
              <strong>Initial deposit:</strong> A deposit equal to <strong>one month&rsquo;s installment</strong> is required to activate the lay-by agreement. For example, if the payment term is 5 months, the deposit is one-fifth of the total pack price.
            </li>
            <li>
              <strong>Payment period:</strong> The lay-by payment period commences at the end of June and runs for <strong>5 months</strong>, with the final payment due no later than <strong>October 31st</strong> of the same calendar year.
            </li>
            <li>
              <strong>Installments:</strong> The balance (total pack price less deposit) is divided into equal monthly installments over the remaining payment period. The deposit itself counts as the first installment, so the total number of payments equals the number of months in the payment term. Customers may pay more than the minimum at any time, or settle the full balance early, with no penalty.
            </li>
            <li>
              <strong>Payment methods:</strong> Payments may be made by <strong>cash deposit</strong> into the Pexpacks bank account or by <strong>Electronic Funds Transfer (EFT)</strong>. Proof of payment must be emailed to Pexpacks (<a href="mailto:lay-by@pexpacks.co.za">lay-by@pexpacks.co.za</a>) for each payment. No debit order facilities are available under this lay-by arrangement.
            </li>
          </ul>
          <p>
            Bank account details for payments will be provided in the lay-by agreement. All payments must reference the customer&rsquo;s unique lay-by reference number.
          </p>
        </>
      ),
    },
    {
      id: "timing-and-delivery",
      eyebrow: "4",
      title: "Timing, stationery lists, and delivery",
      summary:
        "Lay-by begins at the end of June. Stationery lists are finalized before July. Delivery occurs the following year after full payment.",
      content: (
        <>
          <p>
            The lay-by timeline is structured around the South African school calendar:
          </p>
          <ul>
            <li>
              <strong>End of June:</strong> Lay-by agreements officially commence. Pexpacks ensures that all stationery lists for the upcoming school year are finalized and made available to parents and guardians before the end of June each year.
            </li>
            <li>
              <strong>Budgeting assistance:</strong> To help parents plan their budgets, the <strong>previous year&rsquo;s stationery list</strong> is accessible on the Pexpacks website. This list provides a reliable indication of anticipated costs, including expected annual price adjustments due to inflation and manufacturer increases.
            </li>
            <li>
              <strong>Payment window:</strong> All lay-by payments must be completed by <strong>October 31st</strong> of the current year. No extensions to this date are permitted, as the period from November to December is reserved for packing, quality checking, Pexcover book covering, and delivery logistics.
            </li>
            <li>
              <strong>Delivery:</strong> Pexpacks packs, checks, and prepares all lay-by orders during November and December. Delivery takes place in <strong>January of the following year</strong>, before schools reopen. Customers will be notified of the delivery schedule once orders are ready for dispatch.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "pricing-and-increases",
      eyebrow: "5",
      title: "Pricing, price increases, and sealed price",
      summary:
        "The agreed pack price at the time of signing is sealed. Annual price increases due to inflation are communicated before the agreement is entered into.",
      content: (
        <>
          <p>
            Pexpacks is committed to pricing transparency:
          </p>
          <ul>
            <li>
              <strong>Sealed price:</strong> The stationery pack price agreed upon at the time the lay-by agreement is signed is the <strong>final and sealed price</strong>. This price is divided according to the payment terms and will not change during the payment period, regardless of any subsequent price adjustments by manufacturers or suppliers.
            </li>
            <li>
              <strong>Annual price adjustments:</strong> Stationery pack prices are subject to annual increases due to inflation, manufacturer price adjustments, and changes in supply costs. These adjustments are applied at the start of each school year cycle (before the end of June) and are clearly communicated to customers before they enter into a lay-by agreement.
            </li>
            <li>
              <strong>Previous year&rsquo;s pricing:</strong> The previous year&rsquo;s stationery list and pricing are available on the Pexpacks website for reference and budgeting purposes. These historical prices are indicative only and do not guarantee the same pricing for the upcoming year.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "cancellation",
      eyebrow: "6",
      title: "Cancellation and refunds",
      summary:
        "Customers may cancel a lay-by agreement at any time and receive a refund of paid installments, less a 1% cancellation penalty as permitted by law.",
      content: (
        <>
          <p>
            In accordance with Section 62 of the CPA, a customer may cancel a lay-by agreement at any time before the full purchase price has been paid:
          </p>
          <ul>
            <li>
              <strong>Cancellation by customer:</strong> You may cancel your lay-by agreement by notifying Pexpacks in writing (via email). Upon cancellation, you are entitled to a refund of all amounts paid, less the applicable cancellation penalty.
            </li>
            <li>
              <strong>Cancellation penalty:</strong> The cancellation penalty is <strong>1% of the total purchase price</strong> of the stationery pack, as permitted by Section 62(4)(a) of the CPA. This is a statutory maximum and may be adjusted only as permitted by law.
            </li>
            <li>
              <strong>Refund processing:</strong> Refunds will be processed within 14 business days of the cancellation notice. The refund will be paid via EFT to the bank account specified by the customer.
            </li>
            <li>
              <strong>Cancellation by Pexpacks:</strong> Pexpacks reserves the right to cancel a lay-by agreement if the customer fails to make payments in accordance with the agreed schedule, or if the customer provides false or misleading information. In such cases, the same refund and penalty provisions apply.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "non-compliance",
      eyebrow: "7",
      title: "Non-compliance and consequences",
      summary:
        "Failure to adhere to the lay-by terms may result in penalties, loss of deposit, and cancellation of the agreement.",
      content: (
        <>
          <p>
            Customers are expected to meet their payment obligations in accordance with the agreed schedule. The following consequences apply in the event of non-compliance:
          </p>
          <ul>
            <li>
              <strong>Missed payments:</strong> If a scheduled payment is not received within 7 days of the due date, Pexpacks will issue a written reminder (via email or SMS). A grace period of 14 days from the original due date is provided.
            </li>
            <li>
              <strong>Failure to remedy:</strong> If payment is not received within the 14-day grace period, Pexpacks may:
              <ul>
                <li>Suspend the lay-by agreement until payments are brought up to date.</li>
                <li>Charge a reasonable late-payment administration fee, as permitted by the CPA.</li>
                <li>Cancel the agreement and apply the cancellation provisions set out in Section 6 above.</li>
              </ul>
            </li>
            <li>
              <strong>Loss of deposit:</strong> In the event of cancellation due to non-compliance, the customer forfeits the 1% cancellation penalty (deducted from the refund), and any deposit paid is refunded less this penalty, as prescribed by the CPA.
            </li>
            <li>
              <strong>Non-compliance with October 31st deadline:</strong> All lay-by balances must be fully settled by October 31st. If the balance is not settled by this date, the agreement will be considered breached. Pexpacks will cancel the agreement and process a refund of amounts paid, less the 1% cancellation penalty and any applicable administration fees.
            </li>
            <li>
              <strong>No delivery without full payment:</strong> Pexpacks will not dispatch or deliver any stationery pack until the full lay-by balance has been received and cleared. Partial payment does not entitle the customer to delivery of any portion of the pack.
            </li>
            <li>
              <strong>Collection efforts:</strong> If a lay-by agreement is cancelled due to non-compliance and the customer fails to provide valid bank account details for the refund within 30 days, Pexpacks will hold the refundable amount in trust. Pexpacks may attempt reasonable contact via email, phone, or SMS to return the funds. Unclaimed amounts will be dealt with in accordance with the CPA and applicable legislation.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "customer-rights",
      eyebrow: "8",
      title: "Customer rights under the CPA",
      summary:
        "The Consumer Protection Act provides specific protections for lay-by customers, including the right to information, cancellation, and fair treatment.",
      content: (
        <>
          <p>
            The Consumer Protection Act 68 of 2008 provides the following rights to customers entering into lay-by agreements:
          </p>
          <ul>
            <li>
              <strong>Right to information:</strong> You have the right to receive a written agreement that clearly states the total price, deposit amount, installment amounts, number of installments, payment due dates, and the cancellation policy.
            </li>
            <li>
              <strong>Right to cancel:</strong> You may cancel the lay-by agreement at any time before the full price is paid, subject only to the 1% cancellation penalty prescribed by Section 62(4)(a) of the CPA.
            </li>
            <li>
              <strong>Right to delivery:</strong> Once the full lay-by price has been paid, you are entitled to delivery of the stationery pack in accordance with Pexpacks&rsquo; delivery policy.
            </li>
            <li>
              <strong>Right to fair treatment:</strong> Pexpacks will treat all lay-by customers fairly, transparently, and in accordance with the CPA and these terms.
            </li>
            <li>
              <strong>Right to query:</strong> If you have any questions about your lay-by agreement, payment schedule, or these terms, you may contact Pexpacks using the details provided in this document.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "deposit-handling",
      eyebrow: "9",
      title: "Deposit and payment handling",
      summary:
        "All payments are held securely. Deposits and installments are applied to the lay-by balance and refunded in accordance with the CPA if cancelled.",
      content: (
        <>
          <p>
            Pexpacks handles all lay-by payments in accordance with sound financial practices and the CPA:
          </p>
          <ul>
            <li>
              All payments received under a lay-by agreement are held and applied to the customer&rsquo;s lay-by balance.
            </li>
            <li>
              No interest is earned on lay-by payments held by Pexpacks. The lay-by facility is interest-free.
            </li>
            <li>
              Pexpacks does not store credit or debit card details. All payments are processed via cash deposit or EFT directly into the Pexpacks bank account.
            </li>
            <li>
              Customers must retain proof of payment for each installment and provide it to Pexpacks upon request.
            </li>
            <li>
              Payment receipts are issued by Pexpacks via email within 3 business days of payment confirmation.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "limitation",
      eyebrow: "10",
      title: "Limitation of liability",
      summary:
        "Pexpacks&rsquo; liability is limited as set out in these terms and the CPA. No consequential damages are accepted.",
      content: (
        <>
          <p>
            To the fullest extent permitted by law:
          </p>
          <ul>
            <li>
              Pexpacks&rsquo; total liability arising from or in connection with a lay-by agreement is limited to the total amount paid by the customer under that agreement.
            </li>
            <li>
              Pexpacks will not be liable for any indirect, incidental, special, or consequential damages arising from or in connection with the lay-by agreement, including but not limited to the cost of alternative stationery, transportation, or accommodation.
            </li>
            <li>
              Nothing in these terms excludes or limits Pexpacks&rsquo; liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded or limited under South African law.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "governing-law",
      eyebrow: "11",
      title: "Governing law and disputes",
      summary:
        "These terms are governed by South African law. Disputes are resolved through negotiation, mediation, or the relevant magistrate&rsquo;s court.",
      content: (
        <>
          <p>
            These terms and any lay-by agreement entered into under them are governed by and construed in accordance with the laws of the Republic of South Africa.
          </p>
          <p>
            If a dispute arises under or in connection with a lay-by agreement, the following escalation process applies:
          </p>
          <ol>
            <li>
              <strong>Negotiation:</strong> The parties will first attempt to resolve the dispute through good-faith negotiation. The customer should contact Pexpacks via email or phone to initiate this process.
            </li>
            <li>
              <strong>Mediation:</strong> If negotiation does not resolve the dispute within 14 business days, the parties agree to refer the dispute to mediation by a mediator appointed by agreement. The cost of mediation will be shared equally between the parties.
            </li>
            <li>
              <strong>Legal action:</strong> If mediation fails, either party may pursue the matter in the magistrate&rsquo;s court with appropriate jurisdiction. Nothing in this clause prevents either party from approaching a court for urgent or interim relief.
            </li>
          </ol>
          <p>
            Customers may also lodge complaints with the <strong>National Consumer Commission (NCC)</strong> or the applicable consumer protection tribunal in South Africa.
          </p>
        </>
      ),
    },
    {
      id: "amendments",
      eyebrow: "12",
      title: "Amendments and communication",
      summary:
        "Pexpacks may amend these terms from time to time. Customers will be notified of material changes before entering into a new agreement.",
      content: (
        <>
          <p>
            Pexpacks reserves the right to amend these lay-by terms at any time. Amendments will take effect at the start of the next school year cycle, unless required earlier by law.
          </p>
          <p>
            Lay-by agreements already in effect will continue to be governed by the terms in force at the time the agreement was signed.
          </p>
          <p>
            All communications regarding lay-by agreements will be sent to the email address provided by the customer in their application. It is the customer&rsquo;s responsibility to ensure their contact details remain accurate and up to date.
          </p>
        </>
      ),
    },
  ],
  notice: (
    <>
      <div className={legalStyles.noticeBlock}>
        <p className={legalStyles.noticeEyebrow}>Acknowledgment</p>
        <h3 style={{ margin: "8px 0 10px", color: "var(--pex-primary)", fontSize: "clamp(20px, 2.4vw, 26px)", lineHeight: 1.1 }}>By entering into a lay-by agreement, you acknowledge that:</h3>
        <ul>
          <li>You have read, understood, and accept these terms and conditions.</li>
          <li>You are 18 years of age or older.</li>
          <li>The information provided in your application is true and complete.</li>
          <li>You understand that lay-by payments must be made by cash deposit or EFT only (no debit orders).</li>
          <li>You understand that the agreed pack price is sealed at the time of signing and will not change during the payment period.</li>
          <li>You understand that annual price adjustments may apply to new agreements for the following school year.</li>
          <li>You understand that delivery will take place in January of the year following full payment.</li>
          <li>You understand the consequences of non-compliance, including the applicable cancellation penalty.</li>
          <li>You consent to Pexpacks processing your personal information for the purposes of administering the lay-by agreement.</li>
        </ul>
      </div>
      <div className={legalStyles.noticeBlock}>
        <p>
          If you have any questions about these Lay-by Terms or wish to initiate a lay-by agreement, please contact Pexpacks at{" "}
          <a href="mailto:lay-by@pexpacks.co.za">lay-by@pexpacks.co.za</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>. A copy of these terms is available
          on the Pexpacks website at all times.
        </p>
      </div>
    </>
  ),
};

export default function LayByTermsPage() {
  return <LegalDocumentPage {...config} />;
}
