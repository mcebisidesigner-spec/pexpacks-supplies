"use client";

import { useEffect, useRef, useState } from "react";
import { ordersEmail, ordersEmailHref } from "@/data/contact";
import { formatCurrency } from "@/lib/formatCurrency";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { type FulfilmentOption } from "./OrderFormTypes";
import styles from "./Order.module.css";

type OrderSummaryProps = {
  packName: string;
  schoolName?: string;
  gradeName?: string;
  packKind: string;
  itemCount: number;
  estimatedTotal?: number;
  fulfilmentOption: FulfilmentOption;
  supportHref: string;
  summaryOpen: boolean;
  setSummaryOpen: (open: boolean) => void;
  hasPexcover?: boolean;
  pexcoverCount?: number;
};

export function OrderSummary({
  packName,
  schoolName,
  gradeName,
  packKind,
  itemCount,
  estimatedTotal,
  fulfilmentOption,
  supportHref,
  summaryOpen,
  setSummaryOpen,
  hasPexcover,
  pexcoverCount = hasPexcover ? 1 : 0,
}: OrderSummaryProps) {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [summaryPinned, setSummaryPinned] = useState(false);

  useEffect(() => {
    const toggle = toggleRef.current;
    if (!toggle) return;

    let triggerTop = toggle.getBoundingClientRect().top + window.scrollY;
    let lastScrollY = window.scrollY;

    function updateTriggerTop() {
      const currentToggle = toggleRef.current;
      if (!currentToggle) return;
      triggerTop = currentToggle.getBoundingClientRect().top + window.scrollY;
    }

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const hasReachedToggle = currentScrollY >= triggerTop;

      setSummaryPinned(isScrollingDown && hasReachedToggle);
      lastScrollY = Math.max(currentScrollY, 0);
    }

    updateTriggerTop();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateTriggerTop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateTriggerTop);
    };
  }, []);

  return (
    <aside className={styles.summaryColumn} aria-label="Order summary">
      <button
        ref={toggleRef}
        className={`${styles.summaryToggle} ${summaryPinned ? styles.summaryTogglePinned : ""}`}
        type="button"
        aria-expanded={summaryOpen}
        onClick={() => setSummaryOpen(!summaryOpen)}
      >
        <span>
          {gradeName ?? "Pack"} · {itemCount || "Confirming"} items ·{" "}
          {typeof estimatedTotal === "number"
            ? formatCurrency(estimatedTotal)
            : "Total TBC"}
        </span>
        <strong>{summaryOpen ? "Hide" : "View summary"}</strong>
      </button>
      <div
        className={`${styles.summaryCard} ${summaryOpen ? styles.summaryCardOpen : ""}`}
      >
        <p className={styles.confirmKicker}>Your pack</p>
        <h2>{packName}</h2>
        <div className={styles.summaryMeta}>
          <span>{schoolName ?? "School to confirm"}</span>
          <span>{gradeName ?? "Grade to confirm"}</span>
          <span>{packKind}</span>
        </div>
        <dl className={styles.priceSummary}>
          <div>
            <dt>Selected items</dt>
            <dd>{itemCount || "Confirming"}</dd>
          </div>
          <div>
            <dt>Delivery / collection</dt>
            <dd>{fulfilmentOption}</dd>
          </div>
          {pexcoverCount > 0 ? (
            <div>
              <dt>Pexcover ({pexcoverCount} {pexcoverCount === 1 ? "child" : "children"})</dt>
              <dd>{formatCurrency(pexcoverCount * PEXCOVER_PRICE)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Estimated total</dt>
            <dd>
              {typeof estimatedTotal === "number"
                ? formatCurrency(estimatedTotal)
                : "To be confirmed"}
            </dd>
          </div>
        </dl>
        <p className={styles.summaryNote}>
          Final amount will be confirmed before payment. No online payment is
          taken on this page.
        </p>
        <ul className={styles.trustList}>
          <li>Packed according to the school list</li>
          <li>Customisable before submission</li>
          <li>Privacy-aware order request</li>
        </ul>
        {supportHref ? (
          <a className={styles.supportLink} href={supportHref} target="_blank" rel="noopener noreferrer">
            Need help? Chat to Pexpacks
          </a>
        ) : (
          <a className={styles.supportLink} href={ordersEmailHref} target="_blank" rel="noopener noreferrer">
            Need help? Email {ordersEmail}
          </a>
        )}
      </div>
    </aside>
  );
}
