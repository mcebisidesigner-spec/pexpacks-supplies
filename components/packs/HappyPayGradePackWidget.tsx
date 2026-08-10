"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { GradePackForCustomisation } from "@/lib/packs/types";
import { formatInstalment, happyPayInstalment } from "@/lib/order/happyPay";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import styles from "./HappyPayGradePackWidget.module.css";

type HappyPayGradePackWidgetProps = {
  pack: GradePackForCustomisation;
  amount: number;
};

const HOW_IT_WORKS_STEPS = [
  {
    title: "Proceed to checkout",
    body: "Add your pack to cart and proceed to the unified checkout page.",
  },
  {
    title: "Select Happy Pay in Ozow modal",
    body: "On the secure Ozow checkout screen, choose Happy Pay (Pay in 2).",
  },
  {
    title: "Pay 50% today, 50% in 30 days",
    body: "Pay half today and the rest next month. 0% interest, no application fees, no impact on credit score.",
  },
];

export function HappyPayGradePackWidget({
  amount,
}: HappyPayGradePackWidgetProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const instalment = happyPayInstalment(amount);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const modal = isMounted && isOpen ? (
    createPortal(
      <div
        className={styles.overlay}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setIsOpen(false);
          }
        }}
      >
        <section
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="happy-pay-how-it-works-title"
        >
          <div className={styles.modalHeader}>
            <HappyPayLogo tone="dark" />
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close How it works"
              ref={closeButtonRef}
            >
              &times;
            </button>
          </div>
          <h2 id="happy-pay-how-it-works-title">How Happy Pay via Ozow works</h2>
          <ol className={styles.steps}>
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.modalNote}>
            0% interest. No application fees. Select Happy Pay directly inside the Ozow payment modal.
          </p>
          <button
            type="button"
            className={styles.modalCta}
            onClick={() => setIsOpen(false)}
          >
            Got it, thanks!
          </button>
        </section>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className={styles.widget}>
      <div className={styles.logoRow}>
        <HappyPayLogo tone="dark" />
        <span className={styles.payLabel}>
          Pay 2 x {formatInstalment(instalment)} via Ozow
        </span>
      </div>
      <button
        type="button"
        className={styles.howItWorksButton}
        onClick={() => setIsOpen(true)}
      >
        How it works?
      </button>
      {modal}
    </div>
  );
}
