"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { OrderStatusResponse } from "@/types/orders";
import { formatCurrency } from "@/lib/formatCurrency";

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
      style={{ animation: "spin 0.8s linear infinite" }}
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

  const cardStyle: React.CSSProperties = {
    border: "var(--card-border)",
    borderRadius: "var(--radius-card-lg)",
    background: "radial-gradient(circle at 90% 10%, rgba(33, 158, 154, 0.12), transparent 40%), var(--card-bg)",
    boxShadow: "var(--card-shadow)",
    padding: "clamp(28px, 5vw, 44px)",
    display: "grid",
    gap: 20,
    textAlign: "center",
  };

  const iconBoxStyle: React.CSSProperties = {
    width: 60,
    height: 60,
    borderRadius: "var(--radius-pill)",
    display: "grid",
    placeItems: "center",
    margin: "0 auto",
    fontSize: 26,
  };

  if (!orderReference) {
    return (
      <div style={cardStyle}>
        <div
          style={{
            ...iconBoxStyle,
            background: "var(--pex-bg-soft)",
            color: "var(--pex-text-muted)",
          }}
        >
          <AlertIcon />
        </div>
        <h1
          style={{
            margin: 0,
            color: "var(--pex-primary)",
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            lineHeight: 1.08,
          }}
        >
          No Order Reference
        </h1>
        <p
          style={{
            margin: 0,
            color: "var(--pex-text-muted)",
            lineHeight: 1.5,
          }}
        >
          We could not find your order reference. If you completed a payment,
          please check your email for confirmation.
        </p>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Link
            href="/"
            style={{
              minHeight: 48,
              padding: "0 24px",
              borderRadius: "var(--radius-pill)",
              background: "var(--pex-navy)",
              color: "var(--pex-bg)",
              fontFamily: "var(--font-button)",
              fontSize: 16,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = status?.status === "paid";
  const isStillPending =
    status?.status === "pending_payment" || (!status && loading);

  return (
    <>
      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
      <div style={cardStyle}>
        <div
          style={{
            ...iconBoxStyle,
            background: isPaid
              ? "var(--pex-success)"
              : isStillPending
                ? "var(--pex-bg-soft)"
                : "var(--color-error-bg)",
            color: isPaid
              ? "var(--pex-bg)"
              : isStillPending
                ? "var(--pex-text-muted)"
                : "var(--pex-error)",
          }}
        >
          {isPaid ? <CheckIcon /> : isStillPending ? <SpinnerIcon /> : <AlertIcon />}
        </div>

        <h1
          style={{
            margin: 0,
            color: "var(--pex-primary)",
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(1.4rem, 3vw, 2rem)",
            lineHeight: 1.08,
          }}
        >
          {isPaid
            ? "Payment Received!"
            : isStillPending
              ? "Confirming Your Payment"
              : "Payment Pending"}
        </h1>

        <p
          style={{
            margin: 0,
            color: "var(--pex-text-muted)",
            lineHeight: 1.5,
            maxWidth: 420,
            marginInline: "auto",
          }}
        >
          {isPaid
            ? `Thank you! Your payment of ${status?.estimatedTotal ? formatCurrency(Number(status.estimatedTotal)) : ""} has been received. Your order is now being prepared.`
            : isStillPending
              ? "We received your payment request and are waiting for confirmation from Paystack. This usually takes a few seconds."
              : "We could not confirm your payment yet. If you completed payment, please check your email for confirmation or contact us."}
        </p>

        <div
          style={{
            display: "grid",
            gap: 8,
            padding: "16px 20px",
            borderRadius: "var(--radius-card-compact)",
            background: "var(--pex-bg-soft)",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "var(--pex-text-muted)",
              fontSize: "0.85rem",
              fontWeight: 800,
            }}
          >
            Order Reference
          </span>
          <strong
            style={{
              color: "var(--pex-primary)",
              fontSize: "1.1rem",
              fontFamily: "var(--font-heading)",
            }}
          >
            {orderReference}
          </strong>
        </div>

        {status && (
          <div
            style={{
              display: "grid",
              gap: 8,
              textAlign: "center",
            }}
          >
            {status.schoolName && (
              <p
                style={{
                  margin: 0,
                  color: "var(--pex-text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                {status.schoolName}
                {status.grade ? ` — ${status.grade}` : ""}
              </p>
            )}
          </div>
        )}

        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Link
            href="/"
            style={{
              minHeight: 48,
              padding: "0 24px",
              borderRadius: "var(--radius-pill)",
              background: "var(--pex-navy)",
              color: "var(--pex-bg)",
              fontFamily: "var(--font-button)",
              fontSize: 16,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              transition: "var(--button-transition)",
            }}
          >
            Back to Home
          </Link>
          <Link
            href="/schools"
            style={{
              minHeight: 48,
              padding: "0 24px",
              borderRadius: "var(--radius-pill)",
              background: "var(--pex-bg)",
              color: "var(--pex-primary)",
              fontFamily: "var(--font-button)",
              fontSize: 16,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              border: "1px solid var(--pex-border)",
              transition: "var(--button-transition)",
            }}
          >
            Browse Schools
          </Link>
        </div>
      </div>
    </>
  );
}
