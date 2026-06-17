"use client";

import { useState } from "react";
import styles from "./SavingsFAQ.module.css";

const faqs = [
  {
    question: "Is this a normal lay-by?",
    answer:
      "It works like a pre-purchase savings plan. PexPacks only prepares your pack once your balance is settled or you confirm a value-matched pack. This is not a traditional lay-by where goods are reserved before payment is complete.",
  },
  {
    question: "When can I start saving?",
    answer:
      "The plan opens from June for the next school year\u2019s stationery packs. You can start your savings plan as soon as your child\u2019s pack is available.",
  },
  {
    question: "What happens if I have not paid the full amount by 1 October?",
    answer:
      "You will have until 15 October to pay the balance, customise your pack to match your saved amount, or request a refund according to the Savings Plan terms.",
  },
  {
    question: "Will PexPacks keep my money if I do not finish paying?",
    answer:
      "No. Your balance will be handled according to the Savings Plan terms. You may be able to customise to your saved value or receive a refund subject to the stated cancellation terms.",
  },
  {
    question: "When does PexPacks start packing?",
    answer:
      "Packing starts only after your balance is settled or your value-matched pack is confirmed. We do not purchase or pack goods before your account is ready.",
  },
  {
    question: "Can I use the customisation tray if I am short?",
    answer:
      "Yes. The goal is to help you still receive core essentials by adjusting your pack to match what you saved. You can remove items until the total matches your saved balance.",
  },
];

export function SavingsFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <section className={styles.section} aria-labelledby="savings-faq-heading">
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Got questions?</p>
          <h2 id="savings-faq-heading" className={styles.heading}>
            Savings Plan questions answered
          </h2>
        </div>
        <div className={styles.list}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <article className={styles.item} key={faq.question}>
                <button
                  className={`${styles.question} ${isOpen ? styles.questionOpen : ""}`}
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <svg
                    className={`${styles.icon} ${isOpen ? styles.iconOpen : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                {isOpen ? (
                  <div className={styles.answer}>
                    <p>{faq.answer}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
