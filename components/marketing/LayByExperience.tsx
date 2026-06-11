"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { endpointPathForFormType } from "@/lib/forms/types";
import { IMAGE_BLUR_DATA_URL } from "@/lib/constants";
import styles from "./LayByExperience.module.css";

type IconName = "cart" | "checkout" | "deposit" | "calendar" | "box" | "shield";

type Step = {
  title: string;
  text: string;
  icon: IconName;
};

type Detail = {
  title: string;
  text: string;
  tone: "positive" | "secure" | "notice";
};

type FAQ = {
  question: string;
  answer: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

const steps: Step[] = [
  {
    title: "Choose Your Pack",
    text: "Browse our official school lists or Baseline Combos and add your child's pack to the cart. You can add Pexcover too.",
    icon: "cart",
  },
  {
    title: "Select Lay-by at Checkout",
    text: 'Choose the "Lay-by / Pay Monthly" option during checkout.',
    icon: "checkout",
  },
  {
    title: "Pay Your Deposit",
    text: "Secure your order with a deposit equal to one month\u2019s installment. For a 5-month term, that\u2019s one-fifth of the total price.",
    icon: "deposit",
  },
  {
    title: "Spread the Payments",
    text: "Pay the remaining balance over 3 to 5 months via our secure automated payment portal.",
    icon: "calendar",
  },
  {
    title: "Ready for January",
    text: "Once your final payment clears, your pack moves to our Primrose assembly line for packing, checking, and delivery directly to your school.",
    icon: "box",
  },
];

const details: Detail[] = [
  {
    title: "0% Interest & Zero Fees",
    text: "You pay the exact retail price of the stationery pack. There are no hidden admin fees, initiation fees, or interest charges.",
    tone: "positive",
  },
  {
    title: "100% CPA Compliant",
    text: "Our lay-by system fully complies with Section 62 of the South African Consumer Protection Act, ensuring your funds are protected.",
    tone: "secure",
  },
  {
    title: "Cancellation Policy",
    text: "If your circumstances change before completion, you are legally entitled to a full refund of paid installments, minus a standard 1% cancellation penalty as permitted by law.",
    tone: "notice",
  },
  {
    title: "Strict Cut-off Dates",
    text: "To give us enough time to perfectly pack and cover your books, all lay-by accounts must be fully settled by October 31st.",
    tone: "notice",
  },
  {
    title: "Secure Payments",
    text: "All transactions are processed through trusted South African payment gateways. We do not store your credit card details.",
    tone: "secure",
  },
];

const faqs: FAQ[] = [
  {
    question: "What happens if I miss a payment?",
    answer:
      "Your pack stays reserved while the team helps you catch up. The key requirement is that the full lay-by balance must be settled by October 31st so packing and delivery can be completed in time.",
  },
  {
    question: "Are my card details secure?",
    answer:
      "Yes. Payments are processed through trusted South African payment gateways, and Pexpacks does not store your credit card details.",
  },
  {
    question: "Can I cancel my lay-by?",
    answer:
      "Yes. If you cancel before the lay-by is completed, you are entitled to a refund of paid installments, less the standard 1% cancellation penalty permitted by law.",
  },
];

function value(data: FormData, key: string) {
  const field = data.get(key);
  return typeof field === "string" ? field.trim() : "";
}

function formatLayByMessage(data: FormData) {
  const lines = [
    "Lay-by application request",
    "",
    "Applicant / payer",
    `Full name: ${value(data, "fullName")}`,
    `SA ID or passport: ${value(data, "idNumber")}`,
    `Phone: ${value(data, "phone")}`,
    `Email: ${value(data, "email")}`,
    `Preferred contact method: ${value(data, "preferredContactMethod")}`,
    `Residential address: ${value(data, "address")}`,
    "",
    "Learner and pack",
    `Learner full name: ${value(data, "learnerName")}`,
    `School: ${value(data, "schoolName")}`,
    `Grade: ${value(data, "grade")}`,
    `Pack or list required: ${value(data, "packName")}`,
    `Pexcover requested: ${value(data, "pexcoverRequested")}`,
    "",
    "Lay-by payment plan",
    `Estimated pack total: ${value(data, "estimatedTotal")}`,
    `Deposit amount: ${value(data, "depositAmount")}`,
    `Payment term: ${value(data, "paymentTerm")}`,
    `Preferred monthly debit date: ${value(data, "debitDate")}`,
    `Delivery / collection preference: ${value(data, "deliveryMethod")}`,
    "",
    "Signing details",
    `Signature full name: ${value(data, "signatureName")}`,
    `Signature date: ${value(data, "signatureDate")}`,
    "",
    "Additional notes",
    value(data, "notes") || "None provided",
  ];

  return lines.join("\n");
}

function LayByIcon({ name }: { name: IconName }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "cart") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
      </svg>
    );
  }

  if (name === "checkout") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
        <path d="M15 15l1.5 1.5L20 13" />
      </svg>
    );
  }

  if (name === "deposit") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 3v18" />
        <path d="M17 7.5c-.8-1.2-2.2-2-4.4-2-2.4 0-4.1 1.1-4.1 2.8 0 4 9 1.8 9 6.2 0 1.9-1.8 3.2-4.6 3.2-2.1 0-3.9-.8-4.9-2.2" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="4" y="5" width="16" height="15" rx="3" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 10h16" />
        <path d="M8 14h2" />
        <path d="M14 14h2" />
      </svg>
    );
  }

  if (name === "box") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.7l-6-3.4a4 4 0 0 0-4 0L4 6.3A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l6 3.4a4 4 0 0 0 4 0l6-3.4a2 2 0 0 0 1-1.7Z" />
        <path d="M3.3 7.3 12 12l8.7-4.7" />
        <path d="M12 22V12" />
      </svg>
    );
  }

  return (
    <svg {...common} aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function LayByExperience() {
  const [activeStep, setActiveStep] = useState(0);
  const [openDetail, setOpenDetail] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);

  const progress = useMemo(
    () => `${Math.round(((activeStep + 1) / steps.length) * 100)}%`,
    [activeStep]
  );
  const selectedStep = steps[activeStep];

  async function handleApplicationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setStatus(null);

    const payload = {
      formType: "contact",
      fullName: value(data, "fullName"),
      phone: value(data, "phone"),
      email: value(data, "email") || undefined,
      preferredContactMethod: value(data, "preferredContactMethod"),
      enquiryType: "Lay-by application",
      customerType: "Parent / guardian",
      parentName: value(data, "fullName"),
      learnerName: value(data, "learnerName"),
      schoolName: value(data, "schoolName"),
      grade: value(data, "grade"),
      packName: value(data, "packName"),
      estimatedTotal: Number(value(data, "estimatedTotal")) || undefined,
      deliveryMethod: value(data, "deliveryMethod"),
      address: value(data, "address"),
      notes: `Lay-by term: ${value(data, "paymentTerm")}. Deposit: ${value(
        data,
        "depositAmount"
      )}. Preferred debit date: ${value(data, "debitDate")}.`,
      message: formatLayByMessage(data),
      consent: data.get("privacyConsent") === "on",
      companyWebsite: value(data, "companyWebsite"),
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch(endpointPathForFormType("contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      if (result.success) {
        form.reset();
      }

      setStatus(result);
    } catch {
      setStatus({
        success: false,
        message:
          "We could not submit your lay-by application right now. Please try again or contact Pexpacks directly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <section className={styles.introSection} aria-labelledby="layby-intro">
        <div className={styles.inner}>
          <div className={styles.introGrid}>
            <div className={styles.introCopy}>
              <p className={styles.eyebrow}>Pay over time</p>
              <h2 id="layby-intro">January is stressful enough.</h2>
              <p>
                At Pexpacks Supplies, we believe preparing your child for the
                school year should not break the bank all at once. Our secure,
                flexible Lay-by and Pre-pay options let you secure your
                grade-specific stationery pack today and spread payments over a
                few months, completely interest-free.
              </p>
              <div className={styles.trustRail} aria-label="Lay-by benefits">
                <span>Zero interest</span>
                <span>3 to 5 months</span>
                <span>School-year ready</span>
              </div>
            </div>
            <div className={styles.imageCard}>
              <Image
                src="/images/hero-school-delivery.webp"
                alt="Packed Pexpacks stationery ready for school delivery"
                fill
                sizes="(min-width: 900px) 44vw, 92vw"
                placeholder="blur"
                blurDataURL={IMAGE_BLUR_DATA_URL}
                priority
              />
              <div className={styles.imageOverlay}>
                <span>Primrose assembly line</span>
                <strong>Packed, checked, delivered.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.stepsSection} aria-labelledby="layby-steps">
        <div className={styles.inner}>
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="layby-steps">Five calm steps from pack to delivery</h2>
            <p>
              Tap each step to see what happens next. The process is designed
              for parents who want certainty before the January rush starts.
            </p>
          </div>

          <div className={styles.stepExperience}>
            <div className={styles.timeline} aria-label="Lay-by steps">
              {steps.map((step, index) => (
                <button
                  className={`${styles.stepCard} ${
                    activeStep === index ? styles.stepCardActive : ""
                  }`}
                  key={step.title}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  aria-pressed={activeStep === index}
                >
                  <span className={styles.stepNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.iconBadge}>
                    <LayByIcon name={step.icon} />
                  </span>
                  <strong>{step.title}</strong>
                </button>
              ))}
            </div>

            <aside className={styles.stepDetail} aria-live="polite">
              <div className={styles.progressTrack}>
                <span style={{ width: progress }} />
              </div>
              <span className={styles.stepKicker}>
                Step {activeStep + 1} of {steps.length}
              </span>
              <h3>{selectedStep.title}</h3>
              <p>{selectedStep.text}</p>
              <div className={styles.stepVisual}>
                <LayByIcon name={selectedStep.icon} />
                <span>Lay-by / Pay Monthly</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section
        className={styles.detailsSection}
        id="layby-details"
        aria-labelledby="layby-details-heading"
      >
        <div className={styles.inner}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailsCopy}>
              <p className={styles.eyebrow}>Clear terms</p>
              <h2 id="layby-details-heading">Clear terms, protected funds.</h2>
              <p>
                We make the financial details easy to understand so parents can
                plan with confidence. Open each point for the plain-English
                explanation.
              </p>
              <div className={styles.securityCard}>
                <span className={styles.securityIcon}>
                  <LayByIcon name="shield" />
                </span>
                <div>
                  <strong>Secure payment processing</strong>
                  <p>
                    Trusted South African payment gateways process transactions.
                    Pexpacks does not store your card details.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.accordionList}>
              {details.map((detail, index) => {
                const isOpen = openDetail === index;

                return (
                  <article
                    className={`${styles.detailItem} ${
                      isOpen ? styles.detailItemOpen : ""
                    }`}
                    data-tone={detail.tone}
                    key={detail.title}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDetail(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.checkMark}>
                        <CheckIcon />
                      </span>
                      <span>{detail.title}</span>
                      <span className={styles.toggleIcon} aria-hidden="true" />
                    </button>
                    {isOpen ? <p>{detail.text}</p> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section
        className={styles.applicationSection}
        id="layby-application"
        aria-labelledby="layby-application-heading"
      >
        <div className={styles.inner}>
          <div className={styles.applicationLayout}>
            <aside className={styles.applicationSummary}>
              <p className={styles.eyebrow}>Apply now</p>
              <h2 id="layby-application-heading">
                Apply with the details needed to sign.
              </h2>
              <p>
                Complete this form when you are ready for Pexpacks to prepare a
                lay-by agreement for your school pack. We collect the payer,
                learner, pack, payment plan, delivery, and signature details
                needed to draft the agreement.
              </p>
              <ul className={styles.applicationChecklist}>
                <li>No card details are collected on this form.</li>
                <li>Your deposit is equal to one month\u2019s installment. The final balance must be settled by October 31st.</li>
                <li>The typed signature confirms the applicant is 18 or older.</li>
                <li>Pexpacks will confirm pricing before activation.</li>
              </ul>
            </aside>

            <div className={styles.applicationFormCard}>
              <form onSubmit={handleApplicationSubmit}>
                <div className={styles.formHeader}>
                  <span>Secure application</span>
                  <h3>Lay-by agreement details</h3>
                  <p>
                    Use the applicant or payer details exactly as they should
                    appear on the lay-by agreement.
                  </p>
                </div>

                <fieldset className={styles.formSection}>
                  <legend>Applicant / payer details</legend>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Full legal name</span>
                      <input
                        name="fullName"
                        autoComplete="name"
                        placeholder="Parent or guardian name"
                        required
                      />
                    </label>
                    <label className={styles.field}>
                      <span>SA ID or passport number</span>
                      <input
                        name="idNumber"
                        inputMode="text"
                        placeholder="ID or passport number"
                        required
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Mobile number</span>
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="078 003 6048"
                        required
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Email address</span>
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@example.com"
                        required
                      />
                    </label>
                    <Select
                      name="preferredContactMethod"
                      label="Preferred contact method"
                      defaultValue="whatsapp"
                      options={[
                        { value: "whatsapp", label: "WhatsApp" },
                        { value: "phone", label: "Phone call" },
                        { value: "email", label: "Email" },
                      ]}
                    />
                    <label className={`${styles.field} ${styles.formWide}`}>
                      <span>Residential address</span>
                      <input
                        name="address"
                        autoComplete="street-address"
                        placeholder="Street, suburb, city, province"
                        required
                      />
                    </label>
                  </div>
                </fieldset>

                <fieldset className={styles.formSection}>
                  <legend>Learner and pack details</legend>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Learner full name</span>
                      <input name="learnerName" placeholder="Learner name" required />
                    </label>
                    <label className={styles.field}>
                      <span>School name</span>
                      <input name="schoolName" placeholder="School name" required />
                    </label>
                    <label className={styles.field}>
                      <span>Grade for next year</span>
                      <input name="grade" placeholder="Grade R, Grade 4..." required />
                    </label>
                    <label className={styles.field}>
                      <span>Pack or list required</span>
                      <input
                        name="packName"
                        placeholder="Official school list or Baseline Combo"
                        required
                      />
                    </label>
                    <Select
                      name="pexcoverRequested"
                      label="Add Pexcover?"
                      defaultValue="yes"
                      options={[
                        { value: "yes", label: "Yes, include book covering" },
                        { value: "no", label: "No, stationery only" },
                        { value: "confirm", label: "Please confirm options" },
                      ]}
                    />
                    <Select
                      name="deliveryMethod"
                      label="Delivery / collection preference"
                      defaultValue="school-delivery"
                      options={[
                        { value: "school-delivery", label: "Deliver to school" },
                        { value: "home-delivery", label: "Home delivery" },
                        { value: "collection", label: "Collection" },
                        { value: "confirm", label: "Confirm with me" },
                      ]}
                    />
                  </div>
                </fieldset>

                <fieldset className={styles.formSection}>
                  <legend>Payment plan</legend>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Estimated pack total</span>
                      <input
                        name="estimatedTotal"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="899.00"
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Deposit amount (one month\u2019s installment)</span>
                      <input
                        name="depositAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 132.00"
                        required
                      />
                    </label>
                    <Select
                      name="paymentTerm"
                      label="Preferred payment term"
                      defaultValue="5 months"
                      options={["3 months", "4 months", "5 months"]}
                    />
                    <Select
                      name="debitDate"
                      label="Preferred monthly payment date"
                      defaultValue="25th"
                      options={["1st", "15th", "25th", "Last working day"]}
                    />
                    <label className={`${styles.field} ${styles.formWide}`}>
                      <span>Notes for Pexpacks</span>
                      <textarea
                        name="notes"
                        placeholder="Anything we should know about the pack, timing, siblings, delivery, or payment plan?"
                      />
                    </label>
                  </div>
                </fieldset>

                <fieldset className={styles.formSection}>
                  <legend>Declarations and signature</legend>
                  <div className={styles.signatureGrid}>
                    <label className={styles.checkField}>
                      <input name="ageConfirmation" type="checkbox" required />
                      <span>
                        I confirm that I am 18 years or older and authorised to
                        enter into this lay-by agreement.
                      </span>
                    </label>
                    <label className={styles.checkField}>
                      <input name="cutoffConfirmation" type="checkbox" required />
                      <span>
                        I understand that the lay-by must be fully settled by
                        October 31st for January packing and delivery.
                      </span>
                    </label>
                    <label className={styles.checkField}>
                      <input name="cancellationConfirmation" type="checkbox" required />
                      <span>
                        I understand that cancellation before completion allows
                        a refund of installments paid, less the standard 1%
                        cancellation penalty permitted by law.
                      </span>
                    </label>
                    <label className={styles.checkField}>
                      <input name="privacyConsent" type="checkbox" required />
                      <span>
                        I consent to Pexpacks processing this information to
                        prepare and manage my lay-by application, in line with
                        the{" "}
                        <Link href="/privacy-policy">privacy policy</Link>.
                      </span>
                    </label>
                  </div>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Typed signature</span>
                      <input
                        name="signatureName"
                        placeholder="Type your full legal name"
                        required
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Signature date</span>
                      <input name="signatureDate" type="date" required />
                    </label>
                  </div>
                </fieldset>

                <label className={styles.honeypot} aria-hidden="true">
                  Company website
                  <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
                </label>

                <div className={styles.formFooter}>
                  <Button type="submit" disabled={pending}>
                    {pending ? "Submitting..." : "Submit Lay-by Application"}
                  </Button>
                  <p>
                    Submitting this form does not collect payment. Pexpacks will
                    confirm pack pricing and send the secure payment next step.
                  </p>
                </div>

                {status ? (
                  <p
                    className={
                      status.success ? styles.statusMessage : styles.statusError
                    }
                    role={status.success ? "status" : "alert"}
                    aria-live="polite"
                  >
                    {status.message}
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="layby-faq">
        <div className={styles.inner}>
          <div className={styles.faqLayout}>
            <div>
              <p className={styles.eyebrow}>Got questions?</p>
              <h2 id="layby-faq">Quick answers before checkout</h2>
              <p>
                These are the questions parents usually ask before choosing the
                Lay-by / Pay Monthly option.
              </p>
              <div className={styles.faqActions}>
                <Button href="/schools">Start Shopping Packs</Button>
                <Button href="/contact" variant="outline">
                  Contact Pexpacks
                </Button>
              </div>
            </div>

            <div className={styles.faqList}>
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <article
                    className={`${styles.faqItem} ${
                      isOpen ? styles.faqItemOpen : ""
                    }`}
                    key={faq.question}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.question}</span>
                      <span className={styles.toggleIcon} aria-hidden="true" />
                    </button>
                    {isOpen ? <p>{faq.answer}</p> : null}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
