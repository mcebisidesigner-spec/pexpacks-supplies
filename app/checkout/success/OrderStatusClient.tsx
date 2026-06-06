"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { OrderStatusResponse } from "@/types/orders";
import styles from "./OrderStatusClient.module.css";

type OrderStatusClientProps = {
  orderReference: string | null;
};

function AnimatedCheckmark() {
  return (
    <svg
      className={styles.checkmark}
      viewBox="0 0 52 52"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className={styles.checkmarkCircle}
        cx="26"
        cy="26"
        r="25"
        fill="none"
      />
      <path
        className={styles.checkmarkCheck}
        fill="none"
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
      />
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

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export function OrderStatusClient({
  orderReference,
}: OrderStatusClientProps) {
  const [status, setStatus] = useState<OrderStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [shareFallback, setShareFallback] = useState(false);

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

  const shareUrl = useMemo(() => {
    const text = [
      "I just sorted my child's stationery for Term 1 with Pexpacks.",
      "No queues, no stress.",
      `Check them out at ${typeof window !== "undefined" ? window.location.origin : "https://pexpacks.co.za"}`,
    ].join(" ");
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, []);

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Pexpacks – School Stationery Sorted",
          text: "I just sorted my child's stationery for Term 1 with Pexpacks. No queues, no stress.",
          url: typeof window !== "undefined" ? window.location.origin : "https://pexpacks.co.za",
        });
        return;
      } catch {
        // User cancelled share or Web Share API failed
      }
    }
    window.open(shareUrl, "_blank", "noopener");
  }, [shareUrl]);

  if (!orderReference) {
    return (
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <AlertIcon />
        </div>
        <h1 className={styles.title}>No Order Reference</h1>
        <p className={styles.subtitle}>
          We could not find your order reference. If you completed a payment,
          please check your email for confirmation.
        </p>
        <Link href="/" className={styles.btnPrimary}>Back to Home</Link>
      </div>
    );
  }

  const isPaid = status?.status === "paid";
  const isStillPending =
    status?.status === "pending_payment" || (!status && loading);

  return (
    <div className={styles.card}>
      {isPaid ? (
        <>
          <div className={styles.checkmarkWrap}>
            <AnimatedCheckmark />
          </div>

          <h1 className={styles.title}>
            Stationery sorted.
            <br />
            Deep breath taken.
          </h1>
          <p className={styles.subtitle}>
            Your payment was successful and your order is confirmed.
          </p>

          <div className={styles.receiptBox}>
            <p className={styles.receiptLabel}>Order Reference</p>
            <p className={styles.receiptRef}>{orderReference}</p>
            <p className={styles.receiptNote}>
              We&apos;ve sent your full receipt and order summary to your email.
            </p>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineStep}>
              <div className={styles.stepDot}><BoxIcon /></div>
              <div className={styles.stepBody}>
                <strong>1. We pack your order</strong>
                <p>Our team picks and packs your items exactly to the official school list.</p>
              </div>
            </div>
            <div className={styles.timelineStep}>
              <div className={styles.stepDot}><WhatsAppIcon /></div>
              <div className={styles.stepBody}>
                <strong>2. WhatsApp updates</strong>
                <p>We send you a WhatsApp the moment your box is sealed and ready.</p>
              </div>
            </div>
            <div className={styles.timelineStep}>
              <div className={styles.stepDot}><TruckIcon /></div>
              <div className={styles.stepBody}>
                <strong>3. Delivery</strong>
                <p>Your pack arrives safely before school opens in January.</p>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnShare} onClick={handleShare}>
              <WhatsAppIcon />
              Help another parent skip the queues. Share Pexpacks on WhatsApp.
            </button>
            <Link href="/" className={styles.btnPrimary}>Return to Homepage</Link>
          </div>
        </>
      ) : isStillPending ? (
        <>
          <div className={styles.iconWrap}>
            <SpinnerIcon />
          </div>
          <h1 className={styles.title}>Confirming Your Payment</h1>
          <p className={styles.subtitle}>
            We received your payment request and are waiting for secure payment
            confirmation. This usually takes a few seconds.
          </p>
          <div className={styles.receiptBox}>
            <p className={styles.receiptLabel}>Order Reference</p>
            <p className={styles.receiptRef}>{orderReference}</p>
          </div>
        </>
      ) : (
        <>
          <div className={styles.iconWrap}>
            <AlertIcon />
          </div>
          <h1 className={styles.title}>Payment Pending</h1>
          <p className={styles.subtitle}>
            We could not confirm your payment yet. If you completed payment,
            please check your email for confirmation or contact us.
          </p>
          <div className={styles.receiptBox}>
            <p className={styles.receiptLabel}>Order Reference</p>
            <p className={styles.receiptRef}>{orderReference}</p>
          </div>
          <Link href="/" className={styles.btnPrimary}>Back to Home</Link>
        </>
      )}

      {status && (
        <div className={styles.orderMeta}>
          {status.schoolName && (
            <p>
              {status.schoolName}
              {status.grade ? ` · ${status.grade}` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
