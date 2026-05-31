"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderStatusResponse } from "@/types/orders";
import { formatCurrency } from "@/lib/formatCurrency";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./OrderStatusClient.module.css";

type OrderStatusClientProps = {
  orderReference: string | null;
};

function CheckIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.spinner}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconBox({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <div className={styles.iconBox} style={{ background: bg, color }}>
      {children}
    </div>
  );
}

export function OrderStatusClient({
  orderReference,
}: OrderStatusClientProps) {
  const [status, setStatus] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  const checkStatus = useCallback(async () => {
    if (!orderReference) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/orders/status?ref=${encodeURIComponent(orderReference)}`
      );
      const data: OrderStatusResponse = await res.json();
      setStatus(data);

      if (data.status === "paid") {
        setLoading(false);
        return;
      }
    } catch {
      // Will retry
    }

    if (pollCount < 6) {
      const delay = [1000, 2000, 3000, 5000, 8000, 12000][pollCount] || 5000;
      setTimeout(() => {
        setPollCount((c) => c + 1);
      }, delay);
    } else {
      setLoading(false);
    }
  }, [orderReference, pollCount]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  if (!orderReference) {
    return (
      <Card padding="spacious" style={{ textAlign: "center", gap: 20 }}>
        <IconBox bg="var(--pex-bg-soft)" color="var(--pex-text-muted)">
          <AlertIcon />
        </IconBox>
        <h1 className={styles.heading}>No Order Reference</h1>
        <p className={styles.bodyText}>
          We could not find your order reference. If you completed a payment,
          please check your email for confirmation.
        </p>
        <div className={styles.buttonRow}>
          <Button href="/" variant="navy">
            Back to Home
          </Button>
        </div>
      </Card>
    );
  }

  const isPaid = status?.status === "paid";
  const isStillPending =
    status?.status === "pending_payment" || (!status && loading);
  const iconBg = isPaid
    ? "var(--pex-success)"
    : isStillPending
      ? "var(--pex-bg-soft)"
      : "var(--color-error-bg)";
  const iconColor = isPaid
    ? "var(--pex-bg)"
    : isStillPending
      ? "var(--pex-text-muted)"
      : "var(--pex-error)";

  return (
    <Card padding="spacious" style={{ textAlign: "center", gap: 20 }}>
      <IconBox bg={iconBg} color={iconColor}>
        {isPaid ? <CheckIcon /> : isStillPending ? <SpinnerIcon /> : <AlertIcon />}
      </IconBox>

      <h1 className={styles.heading}>
        {isPaid
          ? "Payment received"
          : isStillPending
            ? "Confirming Your Payment"
            : "Payment Pending"}
      </h1>

      <p className={styles.bodyText}>
        {isPaid
          ? `Your payment of ${status?.estimatedTotal ? formatCurrency(Number(status.estimatedTotal)) : ""} has been received. Your order is being confirmed and prepared.`
          : isStillPending
            ? "We received your payment request and are waiting for secure payment confirmation. This usually takes a few seconds."
            : "We could not confirm your payment yet. If you completed payment, please check your email for confirmation or contact us."}
      </p>

      <div className={styles.refBanner}>
        <span className={styles.refLabel}>Order Reference</span>
        <strong className={styles.refValue}>{orderReference}</strong>
      </div>

      {status && (
        <div className={styles.orderInfo}>
          {status.schoolName && (
            <p className={styles.orderInfoText}>
              {status.schoolName}
              {status.grade ? ` - ${status.grade}` : ""}
            </p>
          )}
        </div>
      )}

      <div className={styles.buttonRow}>
        <Button href="/" variant="navy">
          Back to Home
        </Button>
        <Button href="/schools" variant="outline">
          Browse Schools
        </Button>
      </div>
    </Card>
  );
}
