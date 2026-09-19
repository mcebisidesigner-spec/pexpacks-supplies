import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import { buildMetadata } from "@/lib/seo";
import { getFaqs } from "@/lib/cms";
import { FaqMarquee } from "@/components/shared/FaqMarquee";
import type { FAQ } from "@/data/faqs";

export const metadata: Metadata = {
  ...buildMetadata(
    "Split in 2 with Happy Pay | Pexpacks",
    "Split your Pexpacks order into 2 interest-free payments with Happy Pay. Pay 50% today and the rest in 30 days — 0% interest, no application fees.",
    "/happy-pay"
  ),
};

const steps = [
  {
    title: "Choose your packs",
    text: "Select your school and grade packs, or build your own tray. Add Pexcover book covering if you’d like.",
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
    text: "Your second 50% is collected automatically 30 days later. Nothing more to do — your packs are already on their way.",
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
    text: "Two equal payments — 50% today and 50% in 30 days. No lump sum at once.",
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
    text: "Because Happy Pay settles your full order today, your packs are dispatched immediately — you don’t wait for the second payment.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
    ),
  },
];

const fallbackFaqs: FAQ[] = [
  {
    id: "happy-pay-what-is",
    category: "Happy Pay (BNPL)",
    question: "What is Happy Pay?",
    answer:
      "Happy Pay is a South African Buy Now Pay Later (BNPL) provider. With Pexpacks, it lets you split your order total into 2 equal, interest-free payments — 50% today and 50% in 30 days.",
    links: [
      { label: "Learn about Happy Pay", href: "/happy-pay" },
      { label: "Find your school pack", href: "/schools" },
    ],
  },
  {
    id: "happy-pay-how-two-payments",
    category: "Happy Pay (BNPL)",
    question: "How do the two payments work?",
    answer:
      "At checkout you pay your first 50%. Happy Pay settles your full order with Pexpacks immediately, so your packs are dispatched right away. Your second 50% is collected automatically 30 days later.",
    links: [
      { label: "Start an order", href: "/order" },
      { label: "Happy Pay terms", href: "/happy-pay-terms" },
    ],
  },
  {
    id: "happy-pay-interest-charges",
    category: "Happy Pay (BNPL)",
    question: "Are there any interest charges or fees?",
    answer:
      "No. There is 0% interest and no application fee. If a scheduled payment is ever missed, a late fee may apply in line with Happy Pay’s terms — but the price you pay for your packs never increases.",
    links: [
      { label: "Happy Pay terms", href: "/happy-pay-terms" },
      { label: "Terms of use", href: "/terms" },
    ],
  },
  {
    id: "happy-pay-credit-score",
    category: "Happy Pay (BNPL)",
    question: "Will using Happy Pay affect my credit score?",
    answer:
      "No. Checking your eligibility and splitting your payment with Happy Pay does not impact your credit score.",
    links: [
      { label: "Learn about Happy Pay", href: "/happy-pay" },
      { label: "Contact support", href: "/contact" },
    ],
  },
  {
    id: "happy-pay-approval-time",
    category: "Happy Pay (BNPL)",
    question: "How long does approval take?",
    answer:
      "Approval typically takes under 60 seconds. You’ll receive an instant decision at checkout, and if approved, your first instalment is paid immediately.",
    links: [
      { label: "Start an order", href: "/order" },
      { label: "Find your school", href: "/schools" },
    ],
  },
  {
    id: "happy-pay-who-eligible",
    category: "Happy Pay (BNPL)",
    question: "Who can use Happy Pay?",
    answer:
      "You need to be 18 years or older, a South African resident, and pay with a South African bank card. Eligibility is determined by Happy Pay at checkout.",
    links: [
      { label: "Happy Pay terms", href: "/happy-pay-terms" },
      { label: "Find your school pack", href: "/schools" },
    ],
  },
  {
    id: "happy-pay-second-payment",
    category: "Happy Pay (BNPL)",
    question: "What happens if my second payment can’t be processed?",
    answer:
      "Happy Pay will attempt to collect the instalment again and may charge a late fee if it remains unpaid. Your order is never affected — your packs have already been dispatched to you.",
    links: [
      { label: "Track an order", href: "/track-order" },
      { label: "Delivery policy", href: "/delivery-policy" },
    ],
  },
  {
    id: "happy-pay-receive-packs",
    category: "Happy Pay (BNPL)",
    question: "When will I receive my packs?",
    answer:
      "Right away. Because Happy Pay settles your full order with Pexpacks today, your pack is prepared and dispatched as soon as packing is complete — you don’t wait for the second payment.",
    links: [
      { label: "Track an order", href: "/track-order" },
      { label: "Delivery policy", href: "/delivery-policy" },
    ],
  },
  {
    id: "happy-pay-card-safe",
    category: "Happy Pay (BNPL)",
    question: "Is my card and personal information safe?",
    answer:
      "Yes. Payments are processed by Ozow, a PCI DSS compliant payment gateway, so your card details never touch Pexpacks servers. Your personal information is handled in line with POPIA and shared with Happy Pay only to process your split.",
    links: [
      { label: "Terms of use", href: "/terms" },
      { label: "Contact support", href: "/contact" },
    ],
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

export default async function HappyPayPage() {
  const cmsFaqs = await getFaqs("happy_pay");
  const displayFaqs: FAQ[] =
    cmsFaqs && cmsFaqs.length > 0
      ? cmsFaqs.map((faq, index) => ({
          id: faq.id ?? `happy-pay-${index}`,
          category: faq.category ?? "Happy Pay (BNPL)",
          question: faq.question,
          answer: faq.answer,
          links: faq.links && faq.links.length > 0 ? faq.links : undefined,
        }))
      : fallbackFaqs;

  return (
    <>
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28 bg-[radial-gradient(1000px_460px_at_90%_-10%,rgba(255,111,89,0.35),transparent_62%),radial-gradient(800px_460px_at_-10%_115%,rgba(129,212,181,0.2),transparent_58%),linear-gradient(135deg,#135c5a_0%,#1a7a77_46%,#1a2a40_100%)] text-white text-center">
        <span className="absolute w-[420px] h-[420px] -top-[200px] -right-[140px] rounded-full border border-white/15 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-5">
          <p className="m-0 text-[#ffd9d0] text-sm sm:text-[15px] font-extrabold tracking-wider uppercase">Buy Now Pay Later</p>
          <h1 className="m-0 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Split your school shop in 2.
            <span className="text-[#ffd9d0]"> Interest-free.</span>
          </h1>
          <p className="m-0 max-w-2xl text-white/85 text-base sm:text-lg lg:text-[19px] leading-relaxed">
            Pay 50% today and the rest in 30 days with Happy Pay. Your full
            order is settled with Pexpacks right away, so your packs are
            dispatched immediately.
          </p>

          <div className="inline-flex items-center gap-3.5 px-4.5 py-2.5 rounded-full bg-white/10 border border-white/20">
            <HappyPayLogo tone="light" />
            <span className="w-px h-4.5 bg-white/30" aria-hidden="true" />
            <span className="text-white/90 text-xs sm:text-[13px] font-bold">Powered by Ozow</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-1.5 w-full sm:w-auto">
            <Button
              href="/schools"
              variant="primary"
              size="lg"
              iconDirection="right"
              className="w-full sm:w-auto min-h-[48px]"
            >
              Split my pack in 2
            </Button>
            <Button href="#how-it-works" variant="white" size="lg" className="w-full sm:w-auto min-h-[48px]">
              See how it works
            </Button>
          </div>

          <ul className="flex flex-wrap justify-center gap-2 list-none m-0 mt-3 p-0">
            <li className="px-3.5 py-1.5 rounded-full bg-white/12 border border-white/20 text-white text-xs sm:text-[13px] font-bold">0% interest</li>
            <li className="px-3.5 py-1.5 rounded-full bg-white/12 border border-white/20 text-white text-xs sm:text-[13px] font-bold">No application fees</li>
            <li className="px-3.5 py-1.5 rounded-full bg-white/12 border border-white/20 text-white text-xs sm:text-[13px] font-bold">Approval in under 60 seconds</li>
            <li className="px-3.5 py-1.5 rounded-full bg-white/12 border border-white/20 text-white text-xs sm:text-[13px] font-bold">No impact on your credit score</li>
          </ul>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="How it works"
            title={"Two payments. That’s the whole plan."}
            text={
              "From choosing your packs to paying the second instalment — here’s exactly how Happy Pay works."
            }
            headingId="how-it-works"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mt-10">
            {steps.map((step, i) => (
              <article className="relative flex flex-col gap-3.5 p-6 sm:p-7 rounded-[22px] sm:rounded-[24px] border border-slate-200 bg-white shadow-xs" key={step.title}>
                <span className="absolute top-5 right-5 text-slate-400 text-xs font-extrabold tracking-wider" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-teal-600/10 text-teal-600 shrink-0 [&>svg]:w-6.5 [&>svg]:h-6.5">{step.icon}</span>
                <h3 className="m-0 text-[#1a2a40] text-lg font-extrabold leading-snug">{step.title}</h3>
                <p className="m-0 text-slate-500 text-sm leading-relaxed">{step.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-7 mx-auto max-w-2xl text-center text-slate-500 text-sm leading-relaxed">
            {
              "Your packs are dispatched as soon as they’re packed — you don’t wait for the second payment to be collected."
            }
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-20 lg:py-24 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why Happy Pay"
            title="Everything you love about your packs, split in half."
            text="Happy Pay is a smarter way to pay for back-to-school — built for parents, not credit."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-10">
            {benefits.map((benefit) => (
              <article className="flex flex-col gap-3 p-6 sm:p-7 rounded-[22px] sm:rounded-[24px] border border-slate-200 bg-white shadow-xs" key={benefit.title}>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6f59] to-[#e85a44] text-white shrink-0 [&>svg]:w-6 [&>svg]:h-6">{benefit.icon}</span>
                <h3 className="m-0 text-[#1a2a40] text-base sm:text-[17px] font-extrabold">{benefit.title}</h3>
                <p className="m-0 text-slate-500 text-sm leading-relaxed">{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div id="faq">
        <FaqMarquee
          faqs={displayFaqs}
          eyebrow="Questions"
          title="Happy Pay FAQ"
          seeAllHref="/faq"
        />
      </div>

      <section className="py-14 sm:py-20 lg:py-24 bg-slate-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Security &amp; safety"
            title="Your money and data are protected."
            text="We work with established, regulated partners so you can split with confidence."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-10">
            {security.map((item) => (
              <article className="p-6 sm:p-7 rounded-[22px] sm:rounded-[24px] border border-teal-600/20 bg-white shadow-xs" key={item.title}>
                <h3 className="m-0 mb-2.5 text-[#1a2a40] text-base sm:text-[17px] font-extrabold">{item.title}</h3>
                <p className="m-0 text-slate-500 text-sm leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-slate-500 text-sm">
            Full legal detail on how Happy Pay works with Pexpacks is available
            in our{" "}
            <Link href="/happy-pay-terms" className="text-teal-600 font-extrabold underline underline-offset-3 hover:text-teal-700">
              Happy Pay Terms
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-4">
          <h2 className="m-0 text-[#1a2a40] text-2xl sm:text-4xl font-extrabold leading-tight">
            Ready to split your pack in 2?
          </h2>
          <p className="m-0 max-w-lg text-slate-500 text-base leading-relaxed">
            Add your packs to the tray and choose Happy Pay at checkout.
            Interest-free, no fees, approval in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mt-2 w-full sm:w-auto">
            <Button
              href="/schools"
              variant="primary"
              size="lg"
              iconDirection="right"
              className="w-full sm:w-auto min-h-[48px]"
            >
              Split my pack in 2
            </Button>
            <Button href="/schools#schools-search" variant="white" size="lg" className="w-full sm:w-auto min-h-[48px]">
              Find my school pack
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
