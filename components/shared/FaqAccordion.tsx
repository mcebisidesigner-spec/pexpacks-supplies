"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FAQ, getFaqLinks } from "@/data/faqs";
import { trackFaqOpened } from "@/lib/analytics";

type FaqAccordionProps = {
  faqs: FAQ[];
  title?: string;
  subtitle?: string;
  showCategory?: boolean;
  trackSection?: string;
};

export function FaqAccordion({
  faqs,
  title = "Frequently Asked Questions",
  subtitle = "Got a question? We've got answers.",
  showCategory = false,
  trackSection,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (event: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.dataset.index);
    const next = openIndex === index ? null : index;
    setOpenIndex(next);
    if (next !== null && trackSection) {
      trackFaqOpened({ faqId: faqs[next].id, section: trackSection });
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto">
      {(title || subtitle) && (
        <div className="text-center mb-10">
          {title && (
            <h2 className="m-0 mb-3 text-pex-navy font-heading text-[clamp(24px,4vw,32px)] font-extrabold">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="m-0 text-pex-navy/80 text-base font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-3.5">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const links = getFaqLinks(faq);
          return (
            <div
              key={faq.id}
              className={cn(
                "bg-white rounded-[20px] border transition-all duration-200 overflow-hidden",
                isOpen
                  ? "border-pex-keppel/40 shadow-[0_12px_36px_rgba(26,122,119,0.08)]"
                  : "border-slate-200/80 shadow-[0_4px_18px_rgba(26,42,64,0.04)] hover:border-pex-keppel/25 hover:shadow-[0_8px_26px_rgba(26,42,64,0.07)]"
              )}
            >
              <button
                className="w-full min-h-[64px] flex items-center justify-between gap-4 p-4.5 sm:px-6.5 sm:py-5.5 bg-transparent border-0 cursor-pointer text-left font-inherit select-none"
                data-index={index}
                onClick={toggleAccordion}
                aria-expanded={isOpen}
                aria-controls={`faq-content-${faq.id}`}
              >
                <span className="text-pex-navy text-[15px] sm:text-[16.5px] font-extrabold leading-snug tracking-tight">
                  {faq.question}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  {showCategory && faq.category ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-pex-keppel/10 text-pex-keppel text-xs font-bold whitespace-nowrap tracking-tight">
                      {faq.category}
                    </span>
                  ) : null}
                  <span className="relative w-[22px] h-[22px] shrink-0 text-pex-navy flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className={cn(
                        "w-5 h-5 transition-transform duration-200 stroke-current stroke-[2.5]",
                        isOpen && "rotate-45"
                      )}
                      fill="none"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </div>
              </button>
              <div
                id={`faq-content-${faq.id}`}
                className={cn(isOpen ? "block" : "hidden")}
                hidden={!isOpen}
              >
                <div className="px-5 pb-5 sm:px-6.5 sm:pb-6 text-slate-700 text-[15px] leading-relaxed font-normal">
                  <p className="m-0">{faq.answer}</p>
                  {links.length > 0 ? (
                    <div
                      className="flex flex-wrap items-center gap-2.5 mt-4.5"
                      aria-label="Related FAQ links"
                    >
                      {links.map((link) => (
                        <Link
                          href={link.href}
                          key={link.href + link.label}
                          className="inline-flex items-center gap-1.5 min-h-[34px] px-4 py-1.5 rounded-full bg-pex-keppel/10 border border-pex-keppel/25 text-pex-keppel text-[13px] font-bold no-underline transition-all hover:bg-pex-keppel hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(26,122,119,0.25)] group"
                        >
                          <span>
                            {link.label
                              .replace(/\s*→\s*$/, "")
                              .replace(/\s*->\s*$/, "")}
                          </span>
                          <span
                            className="text-sm leading-none inline-block transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden="true"
                          >
                            &rarr;
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
