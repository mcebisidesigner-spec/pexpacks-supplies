"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { GradePackForCustomisation } from "@/lib/packs/types";
import { createFullTrayPack } from "@/lib/order/createTrayPack";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { formatInstalment, happyPayInstalment } from "@/lib/order/happyPay";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import styles from "./HappyPayGradePackWidget.module.css";

type HappyPayGradePackWidgetProps = {
  pack: GradePackForCustomisation;
  amount: number;
};

const HOW_IT_WORKS_STEPS = [
  {
    title: "Choose Happy Pay at checkout",
    body: "Select Happy Pay when you confirm your order. Approval takes less than 60 seconds.",
  },
  {
    title: "Pay 50% today",
    body: "Your first payment covers half the pack. Your pack is reserved and prepared for dispatch.",
  },
  {
    title: "Pay the rest in 30 days",
    body: "The remaining 50% is taken automatically next month. 0% interest, no hidden fees.",
  },
];

export function HappyPayGradePackWidget({
  pack,
  amount,
}: HappyPayGradePackWidgetProps) {
  const router = useRouter();
  const addPack = usePackTrayStore((s) => s.addPack);
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

  const handleSplitNow = useCallback(() => {
    const trayPack = createFullTrayPack({
      packId: pack.id,
      basePackId: pack.id,
      packName: pack.packName || `${pack.grade} Stationery Pack`,
      schoolId: pack.schoolId,
      schoolSlug: pack.schoolSlug,
      schoolName: pack.schoolName,
      grade: pack.grade,
      gradeSlug: pack.gradeSlug,
      items: pack.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.requiredQuantity,
        unitPrice: item.unitPrice,
      })),
      totalPrice: pack.fullPackPrice ?? 0,
      sourcePath: window.location.pathname,
    });
    addPack(trayPack);
    router.push("/checkout/happypay");
  }, [pack, addPack, router]);

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
          <h2 id="happy-pay-how-it-works-title">How Happy Pay works</h2>
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
            0% interest. No application fees. No impact on your credit score.
          </p>
          <button
            type="button"
            className={styles.modalCta}
            onClick={() => {
              setIsOpen(false);
              handleSplitNow();
            }}
          >
            Split my pack in 2
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
          Pay 2 x {formatInstalment(instalment)}
        </span>
      </div>
      <button type="button" className={styles.splitButton} onClick={handleSplitNow}>
        Split in 2 with Happy Pay
      </button>
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
