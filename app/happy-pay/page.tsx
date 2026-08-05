import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import { buildMetadata } from "@/lib/seo";
import styles from "./HappyPayPage.module.css";

export const metadata: Metadata = {
  ...buildMetadata(
    "Split in 2 with Happy Pay | Pexpacks",
    "Split your Pexpacks order into 2 interest-free payments with Happy Pay. Pay 50% today and the rest in 30 days \u2014 0% interest, no application fees.",
    "/happy-pay"
  ),
};

const steps = [
  {
    title: "Choose your packs",
    text: "Select your school and grade packs, or build your own tray. Add Pexcover book covering if you\u2019d like.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
  },
  {
    title: "Go to checkout",
    text: "Review your order and choose Happy Pay as your payment option when you reach checkout.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    title: "Pay 50% today",
    text: "Approve the split in under 60 seconds. Happy Pay settles your full order with Pexpacks instantly, so your packs are booked in.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <path d="M1 10h22" />
        <path d="M9 6v4" />
      </svg>
    ),
  },
  {
    title: "Pay the rest in 30 days",
    text: "Your second 50% is collected automatically 30 days later. Nothing more to do \u2014 your packs are already on their way.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

const benefits = [
  {
    title: "Split in 2",
    text: "Two equal payments \u2014 50% today and 50% in 30 days. No lump sum at once.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20" />
        <path d="M17 6l-5-4-5 4" />
        <path d="M7 18l5 4 5-4" />
      </svg>
    ),
  },
  {
    title: "0% interest",
    text: "No interest, ever. You pay exactly the same price, just split in half.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 2v14a2 2 0 002 2h14" />
        <path d="M18 22V8a2 2 0 00-2-2H2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "No application fees",
    text: "Setting up Happy Pay is completely free. No hidden charges, no surprises.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
  },
  {
    title: "Instant approval",
    text: "You get a decision in under 60 seconds, right at checkout. No paperwork.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: "No credit impact",
    text: "Checking your eligibility and splitting your payment does not affect your credit score.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Packs ship right away",
    text: "Because Happy Pay settles your full order today, your packs are dispatched immediately \u2014 you don\u2019t wait for the second payment.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
    ),
  },
];

const faqs = [
  {
    question: "What is Happy Pay?",
    answer:
      "Happy Pay is a South African Buy Now Pay Later (BNPL) provider. With Pexpacks, it lets you split your order total into 2 equal, interest-free payments \u2014 50% today and 50% in 30 days.",
  },
  {
    question: "How do the two payments work?",
    answer:
      "At checkout you pay your first 50%. Happy Pay settles your full order with Pexpacks immediately, so your packs are dispatched right away. Your second 50% is collected automatically 30 days later.",
  },
  {
    question: "Are there any interest charges or fees?",
    answer:
      "No. There is 0% interest and no application fee. If a scheduled payment is ever missed, a late fee may apply in line with Happy Pay\u2019s terms \u2014 but the price you pay for your packs never increases.",
  },
  {
    question: "Will using Happy Pay affect my credit score?",
    answer:
      "No. Checking your eligibility and splitting your payment with Happy Pay does not impact your credit score.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Approval typically takes under 60 seconds. You\u2019ll receive an instant decision at checkout, and if approved, your first instalment is paid immediately.",
  },
  {
    question: "Who can use Happy Pay?",
    answer:
      "You need to be 18 years or older, a South African resident, and pay with a South African bank card. Eligibility is determined by Happy Pay at checkout.",
  },
  {
    question: "What happens if my second payment can\u2019t be processed?",
    answer:
      "Happy Pay will attempt to collect the instalment again and may charge a late fee if it remains unpaid. Your order is never affected \u2014 your packs have already been dispatched to you.",
  },
  {
    question: "When will I receive my packs?",
    answer:
      "Right away. Because Happy Pay settles your full order with Pexpacks today, your pack is prepared and dispatched as soon as packing is complete \u2014 you don\u2019t wait for the second payment.",
  },
  {
    question: "Is my card and personal information safe?",
    answer:
      "Yes. Payments are processed by Ozow, a PCI DSS compliant payment gateway, so your card details never touch Pexpacks servers. Your personal information is handled in line with POPIA and shared with Happy Pay only to process your split.",
  },
];

const security = [
  {
    title: "Bank-grade encryption",
    text: "Payments are encrypted and processed by Ozow, our PCI DSS compliant gateway. Your card details never reach Pexpacks servers.",
  },
  {
    title: "POPIA-compliant",
    text: "Your personal information is used only to complete your order and is shared with Happy Pay solely to process your split payment.",
  },
  {
    title: "A regulated provider",
    text: "Happy Pay is the credit provider for your BNPL plan. Pexpacks acts as a referral consultant and confirms your goods with them on your behalf.",
  },
];

export default function HappyPayPage() {
  return (
    <>
      <section className={styles.hero}>
        <span className={styles.heroRing} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>Buy Now Pay Later</p>
          <h1 className={styles.heroTitle}>
            Split your school shop in 2.
            <span className={styles.heroTitleAccent}> Interest-free.</span>
          </h1>
          <p className={styles.heroLead}>
            Pay 50% today and the rest in 30 days with Happy Pay. Your full
            order is settled with Pexpacks right away, so your packs are
            dispatched immediately.
          </p>

          <div className={styles.heroLogoRow}>
            <HappyPayLogo tone="light" />
            <span className={styles.heroLogoDivider} aria-hidden="true" />
            <span className={styles.heroLogoNote}>Powered by Ozow</span>
          </div>

          <div className={styles.heroActions}>
            <Button
              href="/checkout/happypay"
              variant="primary"
              size="lg"
              iconDirection="right"
            >
              Split my pack in 2
            </Button>
            <Button href="#how-it-works" variant="white" size="lg">
              See how it works
            </Button>
          </div>

          <ul className={styles.heroBadges}>
            <li>0% interest</li>
            <li>No application fees</li>
            <li>Approval in under 60 seconds</li>
            <li>No impact on your credit score</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader
            eyebrow="How it works"
            title={"Two payments. That\u2019s the whole plan."}
            text={
              "From choosing your packs to paying the second instalment \u2014 here\u2019s exactly how Happy Pay works."
            }
            headingId="how-it-works"
          />
          <div className={styles.stepGrid}>
            {steps.map((step, i) => (
              <article className={styles.stepCard} key={step.title}>
                <span className={styles.stepBadge} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.stepIcon}>{step.icon}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </article>
            ))}
          </div>
          <p className={styles.sectionNote}>
            {
              "Your packs are dispatched as soon as they\u2019re packed \u2014 you don\u2019t wait for the second payment to be collected."
            }
          </p>        </div>
      </section>

      <section className={styles.sectionSoft}>
        <div className={styles.sectionInner}>
          <SectionHeader
            eyebrow="Why Happy Pay"
            title="Everything you love about your packs, split in half."
            text="Happy Pay is a smarter way to pay for back-to-school \u2014 built for parents, not credit."
          />
          <div className={styles.benefitGrid}>
            {benefits.map((benefit) => (
              <article className={styles.benefitCard} key={benefit.title}>
                <span className={styles.benefitIcon}>{benefit.icon}</span>
                <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                <p className={styles.benefitText}>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <SectionHeader
            eyebrow="Questions"
            title="Happy Pay FAQ"
            text="Answers to the questions parents ask us most about splitting their payment."
            headingId="faq"
          />
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details className={styles.faqItem} key={faq.question}>
                <summary className={styles.faqQuestion}>
                  <span>{faq.question}</span>
                  <span className={styles.faqChevron} aria-hidden="true" />
                </summary>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionSoft}>
        <div className={styles.sectionInner}>
          <SectionHeader
            eyebrow="Security &amp; safety"
            title="Your money and data are protected."
            text="We work with established, regulated partners so you can split with confidence."
          />
          <div className={styles.securityGrid}>
            {security.map((item) => (
              <article className={styles.securityCard} key={item.title}>
                <h3 className={styles.securityTitle}>{item.title}</h3>
                <p className={styles.securityText}>{item.text}</p>
              </article>
            ))}
          </div>
          <p className={styles.termsLink}>
            Full legal detail on how Happy Pay works with Pexpacks is available
            in our{" "}
            <Link href="/happy-pay-terms" className={styles.termsLinkAnchor}>
              Happy Pay Terms
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>
            Ready to split your pack in 2?
          </h2>
          <p className={styles.ctaText}>
            Add your packs to the tray and choose Happy Pay at checkout.
            Interest-free, no fees, approval in seconds.
          </p>
          <div className={styles.ctaActions}>
            <Button
              href="/checkout/happypay"
              variant="primary"
              size="lg"
              iconDirection="right"
            >
              Split my pack in 2
            </Button>
            <Button href="/schools#schools-search" variant="white" size="lg">
              Find my school pack
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
