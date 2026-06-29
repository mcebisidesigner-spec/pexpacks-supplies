"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { usePackTrayStore } from "@/store/usePackTrayStore";
import { calculateTrayTotal } from "@/lib/order/calculateTrayTotal";
import { formatCurrency } from "@/lib/formatCurrency";
import styles from "./GlobalPackTray.module.css";

export function PackTrayFooter() {
  const router = useRouter();
  const packs = usePackTrayStore((s) => s.packs);
  const closeTray = usePackTrayStore((s) => s.closeTray);
  const [showSchoolChoice, setShowSchoolChoice] = useState(false);

  const total = calculateTrayTotal(packs);
  const hasPacks = packs.length > 0;

  const handleCheckout = useCallback(() => {
    if (!hasPacks) return;
    closeTray();
    router.push("/checkout");
  }, [hasPacks, closeTray, router]);

  const handleLayby = useCallback(() => {
    if (!hasPacks) return;
    closeTray();
    router.push("/lay-by/checkout");
  }, [hasPacks, closeTray, router]);

  const handleAddAnotherLearner = useCallback(() => {
    setShowSchoolChoice(true);
  }, []);

  const handleSameSchool = useCallback(() => {
    closeTray();
    setShowSchoolChoice(false);
  }, [closeTray]);

  const handleDifferentSchool = useCallback(() => {
    closeTray();
    setShowSchoolChoice(false);
    router.push("/schools");
  }, [closeTray, router]);

  const handleClearOrder = useCallback(() => {
    usePackTrayStore.getState().clearPacks();
  }, []);

  if (!hasPacks) return null;

  if (showSchoolChoice) {
    return (
      <div className={styles.footer}>
        <div className={styles.schoolChoice}>
          <p>Is the next learner at the same school?</p>
          <div className={styles.schoolChoiceButtons}>
            <button
              type="button"
              className={styles.schoolChoiceButton}
              onClick={handleSameSchool}
            >
              Same school
            </button>
            <button
              type="button"
              className={styles.schoolChoiceButton}
              onClick={handleDifferentSchool}
            >
              Different school
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.footer}>
      <div className={styles.footerTotal}>
        <span className={styles.footerTotalLabel}>
          {packs.length === 1 ? "Total" : "Combined total"}
        </span>
        <span className={styles.footerTotalAmount}>
          {formatCurrency(total)}
        </span>
      </div>
      <div className={styles.footerActions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleCheckout}
        >
          Checkout &amp; Pay Now
        </button>
        <button
          type="button"
          className={styles.laybyButton}
          onClick={handleLayby}
        >
          Start Lay-by Plan
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleAddAnotherLearner}
        >
          Add Another Learner
        </button>
        <button
          type="button"
          className={styles.tertiaryButton}
          onClick={handleClearOrder}
        >
          Clear order
        </button>
      </div>
    </div>
  );
}
