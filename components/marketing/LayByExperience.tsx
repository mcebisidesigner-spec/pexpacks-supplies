"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
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
    text: "Secure your order with a small upfront deposit today.",
    icon: "deposit",
  },
  {
    title: "Spread the Payments",
    text: "Pay the remaining balance over 3 to 6 months via our secure automated payment portal.",
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
    text: "To give us enough time to perfectly pack and cover your books, all lay-by accounts must be fully settled by November 30th.",
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
      "Your pack stays reserved while the team helps you catch up. The key requirement is that the full lay-by balance must be settled by November 30th so packing and delivery can be completed in time.",
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

  const progress = useMemo(
    () => `${Math.round(((activeStep + 1) / steps.length) * 100)}%`,
    [activeStep]
  );
  const selectedStep = steps[activeStep];

  return (
    <>
      <section className={styles.introSection} aria-labelledby="layby-intro">
        <div className={styles.inner}>
          <div className={styles.introGrid}>
            <div className={styles.introCopy}>
              <p className={styles.eyebrow}>Why parents use it</p>
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
                <span>3 to 6 months</span>
                <span>School-year ready</span>
              </div>
            </div>
            <div className={styles.imageCard}>
              <Image
                src="/images/hero-school-delivery.webp"
                alt="Packed Pexpacks stationery ready for school delivery"
                fill
                sizes="(min-width: 900px) 44vw, 92vw"
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
              <p className={styles.eyebrow}>Fine print made simple</p>
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

      <section className={styles.faqSection} aria-labelledby="layby-faq">
        <div className={styles.inner}>
          <div className={styles.faqLayout}>
            <div>
              <p className={styles.eyebrow}>Parent questions</p>
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
