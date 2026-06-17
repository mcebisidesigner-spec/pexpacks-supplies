"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FAQ } from "@/data/faqs";
import styles from "./FAQExperience.module.css";

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
  "Savings Plan",
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
    <section className={styles.faqSection} aria-labelledby="faq-heading">
      <div className={styles.inner}>
        <div className={styles.commandPanel}>
          <div className={styles.searchCard}>
            <p className={styles.eyebrow}>FAQ desk</p>
            <h2 id="faq-heading">Get to the right answer faster</h2>
            <label className={styles.searchLabel} htmlFor="faq-search">
              Search common questions
            </label>
            <input
              id="faq-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try delivery, payment, Pexcover, school list..."
              type="search"
            />
          </div>

          <div className={styles.categoryRail} aria-label="FAQ categories">
            {categories.map((category) => {
              const count =
                category === "All"
                  ? faqs.length
                  : faqs.filter((faq) => faq.category === category).length;

              return (
                <button
                  className={
                    category === activeCategory ? styles.activeCategory : ""
                  }
                  key={category}
                  onClick={() => selectCategory(category)}
                  type="button"
                  aria-pressed={category === activeCategory}
                >
                  <span>{category}</span>
                  <strong>{count}</strong>
                </button>
              );
            })}
          </div>

          <div className={styles.quickGrid}>
            {quickPaths.map((path) => (
              <Link className={styles.quickCard} href={path.href} key={path.href}>
                <span>{path.label}</span>
                <p>{path.text}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.answerPanel}>
          <div className={styles.answerMeta}>
            <span>{filteredFaqs.length} answers</span>
            <strong>{activeCategory}</strong>
          </div>

          {filteredFaqs.length ? (
            <div className={styles.accordion}>
              {filteredFaqs.map((faq) => {
                const isOpen = openId === faq.id;

                return (
                  <article
                    className={`${styles.faqItem} ${
                      isOpen ? styles.faqItemOpen : ""
                    }`}
                    key={faq.id}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? "" : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={`${faq.id}-answer`}
                    >
                      <span className={styles.questionText}>{faq.question}</span>
                      <span className={styles.categoryPill}>{faq.category}</span>
                      <span className={styles.toggleIcon} aria-hidden="true" />
                    </button>

                    {isOpen ? (
                      <div className={styles.answer} id={`${faq.id}-answer`}>
                        <p>{faq.answer}</p>
                        {faq.links?.length ? (
                          <div
                            className={styles.faqLinks}
                            aria-label="Related FAQ links"
                          >
                            {faq.links.map((link) => (
                              <Link href={link.href} key={link.href}>
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No FAQ matches that search.</p>
              <button
                type="button"
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
