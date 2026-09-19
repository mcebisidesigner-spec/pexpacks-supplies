"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { FAQ } from "@/data/faqs";
import { getFaqLinks } from "@/data/faqs";

type FAQExperienceProps = {
  faqs: FAQ[];
};

const categories = [
  "All",
  "School packs",
  "Orders",
  "Delivery",
  "Payment",
  "Schools",
  "Happy Pay (BNPL)",
] as const;

type Category = (typeof categories)[number];

const quickPaths = [
  {
    label: "Find a school pack",
    text: "Search by school and grade, then start with the closest ready pack.",
    href: "/schools",
  },
  {
    label: "Track an order",
    text: "Already submitted? Check your order progress or follow up.",
    href: "/track-order",
  },
  {
    label: "Talk to Pexpacks",
    text: "Still stuck? Send the team your school or grade details.",
    href: "/contact",
  },
];

export function FAQExperience({ faqs }: FAQExperienceProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(faqs[0]?.id ?? "");

  const filteredFaqs = useMemo(() => {
    const search = query.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" || faq.category === activeCategory;
      const matchesSearch =
        !search ||
        faq.question.toLowerCase().includes(search) ||
        faq.answer.toLowerCase().includes(search) ||
        faq.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, faqs, query]);

  function selectCategory(category: Category) {
    setActiveCategory(category);
    const firstMatch = faqs.find(
      (faq) => category === "All" || faq.category === category
    );
    setOpenId(firstMatch?.id ?? "");
  }

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-[linear-gradient(180deg,rgba(244,245,247,0.74),rgba(255,255,255,0))] bg-pex-bg" aria-labelledby="faq-heading">
      <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[minmax(280px,0.42fr)_minmax(0,0.58fr)] gap-6 sm:gap-8 lg:gap-11 items-start">
        <div className="static lg:sticky lg:top-24 grid gap-4">
          <div className="border border-slate-200/80 rounded-[22px] p-5 sm:p-7 bg-gradient-to-br from-white/95 to-slate-50 shadow-[0_20px_52px_rgba(26,42,64,0.1)]">
            <p className="m-0 mb-2 text-pex-coral text-xs sm:text-sm font-extrabold uppercase tracking-wider">FAQ desk</p>
            <h2 id="faq-heading" className="m-0 mb-4.5 text-pex-navy font-heading text-2xl sm:text-3xl lg:text-[40px] font-extrabold leading-none">Get to the right answer faster</h2>
            <label className="block mb-2 text-xs font-semibold text-slate-700" htmlFor="faq-search">
              Search common questions
            </label>
            <input
              id="faq-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try delivery, payment, Pexcover, school list..."
              type="search"
              className="w-full min-h-[48px] border border-pex-border hover:border-pex-border-focus focus:border-pex-keppel rounded-xl px-3.5 bg-white text-pex-navy font-inherit text-sm outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-pex-keppel/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2" aria-label="FAQ categories">
            {categories.map((category) => {
              const count =
                category === "All"
                  ? faqs.length
                  : faqs.filter((faq) => faq.category === category).length;
              const isActive = category === activeCategory;

              return (
                <button
                  className={cn(
                    "flex items-center justify-between min-h-[48px] border rounded-full px-3.5 py-2.5 text-sm font-extrabold cursor-pointer transition-all",
                    isActive
                      ? "bg-pex-navy text-white border-transparent shadow-sm"
                      : "bg-white text-pex-navy border-slate-200 hover:border-pex-keppel/40 hover:shadow-sm"
                  )}
                  key={category}
                  onClick={() => selectCategory(category)}
                  type="button"
                  aria-pressed={isActive}
                >
                  <span>{category}</span>
                  <strong
                    className={cn(
                      "inline-grid min-w-[30px] h-[30px] place-items-center rounded-full text-xs font-bold",
                      isActive
                        ? "bg-white/15 text-white"
                        : "bg-pex-keppel/10 text-pex-keppel"
                    )}
                  >
                    {count}
                  </strong>
                </button>
              );
            })}
          </div>

          <div className="grid gap-2.5">
            {quickPaths.map((path) => (
              <Link className="grid gap-1 border border-pex-keppel/15 hover:border-pex-keppel rounded-xl p-3.5 sm:p-4 bg-pex-keppel/5 hover:bg-pex-keppel/10 text-pex-navy no-underline transition-all hover:-translate-y-0.5" href={path.href} key={path.href}>
                <span className="font-black text-sm text-pex-navy">{path.label}</span>
                <p className="m-0 text-slate-500 text-xs font-semibold leading-snug">{path.text}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3 mb-3.5 text-slate-500 text-sm font-extrabold">
            <span>{filteredFaqs.length} answers</span>
            <strong className="text-pex-keppel">{activeCategory}</strong>
          </div>

          {filteredFaqs.length ? (
            <div className="grid gap-3.5">
              {filteredFaqs.map((faq) => {
                const isOpen = openId === faq.id;

                return (
                  <article
                    className={cn(
                      "overflow-hidden rounded-[20px] bg-white transition-all duration-200",
                      isOpen
                        ? "border-[1.5px] border-pex-keppel/45 shadow-[0_12px_36px_rgba(26,122,119,0.08)]"
                        : "border border-slate-200/80 shadow-[0_4px_18px_rgba(26,42,64,0.04)] hover:border-pex-keppel/25 hover:shadow-[0_8px_26px_rgba(26,42,64,0.07)]"
                    )}
                    key={faq.id}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? "" : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`${faq.id}-answer`}
                      className="w-full min-h-[64px] flex items-center justify-between gap-4 p-4.5 sm:px-6.5 sm:py-5.5 bg-transparent border-0 cursor-pointer text-left font-inherit select-none text-pex-navy"
                    >
                      <span className="text-pex-navy text-[15px] sm:text-[16.5px] font-extrabold leading-snug tracking-tight">{faq.question}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        {faq.category ? (
                          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-pex-keppel/10 text-pex-keppel text-xs font-bold whitespace-nowrap tracking-tight">{faq.category}</span>
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

                    {isOpen ? (
                      <div className="px-4.5 pb-4.5 sm:px-6.5 sm:pb-6 text-slate-700 text-[15px] leading-relaxed font-normal" id={`${faq.id}-answer`}>
                        <p className="max-w-[760px] m-0">{faq.answer}</p>
                        {(() => {
                          const links = getFaqLinks(faq);
                          return links.length > 0 ? (
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
                                  <span className="text-sm leading-none inline-block transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                                    &rarr;
                                  </span>
                                </Link>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-300 rounded-2xl p-7 bg-white text-center">
              <p className="m-0 mb-3.5 text-pex-navy font-extrabold text-base">No FAQ matches that search.</p>
              <button
                type="button"
                className="min-h-[42px] border-0 rounded-full px-5 bg-pex-navy text-white font-extrabold cursor-pointer transition-all hover:bg-pex-navy/90"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("All");
                  setOpenId(faqs[0]?.id ?? "");
                }}
              >
                Reset questions
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
