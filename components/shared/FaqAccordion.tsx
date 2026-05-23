"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./FaqAccordion.module.css";
import { FAQ } from "@/data/faqs";

type FaqAccordionProps = {
  faqs: FAQ[];
  title?: string;
  subtitle?: string;
};

export function FaqAccordion({
  faqs,
  title = "Frequently Asked Questions",
  subtitle = "Got a question? We've got answers.",
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
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
          return (
            <div
              key={faq.id}
              className={`${styles.accordionItem} ${isOpen ? styles.open : ""}`}
            >
              <button
                className={styles.accordionButton}
                onClick={() => toggleAccordion(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-content-${faq.id}`}
              >
                <span className={styles.questionText}>{faq.question}</span>
                <span className={styles.iconContainer}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </button>
              <div
                id={`faq-content-${faq.id}`}
                className={styles.accordionContent}
                hidden={!isOpen}
              >
                <div className={styles.answerInner}>
                  <p>{faq.answer}</p>
                  {faq.links?.length ? (
                    <div
                      className={styles.relatedLinks}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
