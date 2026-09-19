import Link from "next/link";
import type { ReactNode } from "react";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { cn } from "@/lib/utils";

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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Delivered to Your Door",
    text: "Securely packed and delivered anywhere in Gauteng and beyond. No queuing, no driving from shop to shop — your stationery arrives before school opens.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
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
    <section className="py-12 sm:py-16 md:py-20 bg-transparent" aria-labelledby="superpower-heading">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Skip the scramble"
            title="School lists, simplified."
            text="Skip the stationery scramble. We partner directly with schools so you get the exact list, customise it to what you already own, and have it delivered — no queues, no stress."
            headingId="superpower-heading"
          />
        </ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {steps.map((step, idx) => (
            <ScrollReveal key={step.title} delay={idx * 100} as="article">
              <div
                className={cn(
                  "relative p-6 sm:p-7 md:px-7 md:py-8 rounded-card border border-pex-border bg-card shadow-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 grid gap-3.5 group",
                  step.accent &&
                    "border-pex-keppel shadow-[0_0_0_1px_var(--color-pex-keppel)] bg-[radial-gradient(circle_at_90%_10%,rgba(33,158,154,0.06),transparent_40%)]"
                )}
              >
                <div className="w-14 h-14 rounded-2xl grid place-items-center bg-pex-keppel/10 text-pex-keppel group-hover:bg-pex-keppel group-hover:text-white group-hover:scale-105 transition-all duration-300">
                  {step.icon}
                </div>
                <div className="absolute top-5 sm:top-7 right-5 sm:right-7 w-8 h-8 rounded-full grid place-items-center bg-pex-bg text-pex-muted group-hover:bg-pex-navy group-hover:text-white text-sm font-extrabold transition-colors duration-300">
                  {idx + 1}
                </div>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="no-underline group-hover:underline underline-offset-4"
                    data-conversion-event={step.dataConversionEvent}
                  >
                    <h3 className="m-0 text-pex-navy font-heading text-xl sm:text-[22px] font-extrabold leading-snug group-hover:text-pex-keppel transition-colors">
                      {step.title}
                    </h3>
                  </Link>
                ) : (
                  <h3 className="m-0 text-pex-navy font-heading text-xl sm:text-[22px] font-extrabold leading-snug group-hover:text-pex-keppel transition-colors">
                    {step.title}
                  </h3>
                )}
                <p className="m-0 text-pex-muted text-sm sm:text-[15px] leading-relaxed">
                  {step.text}
                </p>
                {step.accent ? (
                  <div className="w-fit px-3 py-1 rounded-full bg-pex-keppel text-white text-xs font-extrabold uppercase tracking-wide">
                    Save money
                  </div>
                ) : null}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
