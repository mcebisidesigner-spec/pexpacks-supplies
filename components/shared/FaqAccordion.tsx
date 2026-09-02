"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import styles from "./FaqAccordion.module.css";
import { FAQ, getFaqLinks } from "@/data/faqs";

type FaqAccordionProps = {
  faqs: FAQ[];
  title?: string;
  subtitle?: string;
  showCategory?: boolean;
};

export function FaqAccordion({
  faqs,
  title = "Frequently Asked Questions",
  subtitle = "Got a question? We've got answers.",
  showCategory = false,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (event: React.MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.dataset.index);
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.accordionContainer}>
      {(title || subtitle) && (
        <div className={styles.accordionHeader}>
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
      <div className={styles.accordionList}>
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const links = getFaqLinks(faq);
          return (
            <div
              key={faq.id}
              className={clsx(styles.accordionItem, isOpen && styles.open)}
            >
              <button
                className={styles.accordionButton}
                data-index={index}
                onClick={toggleAccordion}
                aria-expanded={isOpen}
                aria-controls={`faq-content-${faq.id}`}
              >
                <span className={styles.questionText}>{faq.question}</span>
                <div className={styles.headerRight}>
                  {showCategory && faq.category ? (
                    <span className={styles.categoryPill}>{faq.category}</span>
                  ) : null}
                  <span className={styles.iconContainer}>
                    <span className={styles.plusIcon} aria-hidden="true" />
                  </span>
                </div>
              </button>
              <div
                id={`faq-content-${faq.id}`}
                className={styles.accordionContent}
                hidden={!isOpen}
              >
                <div className={styles.answerInner}>
                  <p>{faq.answer}</p>
                  {links.length > 0 ? (
                    <div
                      className={styles.relatedLinks}
                      aria-label="Related FAQ links"
                    >
                      {links.map((link) => (
                        <Link
                          href={link.href}
                          key={link.href + link.label}
                          className={styles.linkPill}
                        >
                          <span>
                            {link.label
                              .replace(/\s*→\s*$/, "")
                              .replace(/\s*->\s*$/, "")}
                          </span>
                          <span className={styles.pillArrow} aria-hidden="true">
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
