import Link from "next/link";
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import clsx from "clsx";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import styles from "./SuperpowerSection.module.css";

const steps: Array<{
  title: string;
  text: string;
  accent?: boolean;
  href?: string;
  dataConversionEvent?: string;
  icon: ReactNode;
}> = [
  {
    title: "Find Your List",
    text: "We have partnered with schools to digitize the exact grade requirements. Search for your school and select your grade — your official list is ready instantly.",
    href: "/schools",
    dataConversionEvent: "homepage_how_it_works_find_list",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="M11 8v6M8 11h6" />
      </svg>
    ),
  },
  {
    title: "Customise & Save",
    text: "Already have a ruler or scissors? Untick what you have at home and only pay for what you need. No duplicates, no waste — just the missing items.",
    accent: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Delivered to Your Door",
    text: "Securely packed and delivered anywhere in Gauteng and beyond. No queuing, no driving from shop to shop — your stationery arrives before school opens.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h3l4 4v5a1 1 0 0 1-1 1h-1" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="17" cy="19" r="2" />
        <path d="M16 16v-3h4" />
      </svg>
    ),
  },
];

export function SuperpowerSection() {
  return (
    <section className={sectionStyles.section} aria-labelledby="superpower-heading">
      <div className={sectionStyles.inner}>
        <ScrollReveal>
          <SectionHeader
            eyebrow="Skip the scramble"
            title="School lists, simplified."
            text="Skip the stationery scramble. We partner directly with schools so you get the exact list, customise it to what you already own, and have it delivered — no queues, no stress."
            headingId="superpower-heading"
          />
        </ScrollReveal>
        <div className={styles.grid}>
          {steps.map((step, idx) => (
            <ScrollReveal key={step.title} delay={idx * 100} as="article">
              <div className={clsx(styles.card, step.accent && styles.cardAccent)}>
                <div className={styles.iconWrap}>
                  {step.icon}
                </div>
                <div className={styles.number}>{idx + 1}</div>
                {step.href ? (
                  <Link
                    href={step.href}
                    className={styles.titleLink}
                    data-conversion-event={step.dataConversionEvent}
                  >
                    <h3 className={styles.title}>{step.title}</h3>
                  </Link>
                ) : (
                  <h3 className={styles.title}>{step.title}</h3>
                )}
                <p className={styles.text}>{step.text}</p>
                {step.accent ? <div className={styles.badge}>Save money</div> : null}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
