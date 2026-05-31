import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./CancelledPage.module.css";

type CancelledPageProps = {
  searchParams: Promise<{ ref?: string; school?: string; grade?: string }>;
};

export const metadata: Metadata = {
  title: "Payment Cancelled | Pexpacks",
  description:
    "Your payment was cancelled. You can retry or contact us for assistance.",
};

export default async function CancelledPage({
  searchParams,
}: CancelledPageProps) {
  const { ref, school, grade } = await searchParams;

  const retryHref =
    school && grade
      ? `/checkout/${encodeURIComponent(school)}+${encodeURIComponent(grade)}`
      : "/schools";

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Card padding="spacious" style={{ textAlign: "center", gap: 20 }}>
          <div className={styles.iconBox}>
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <h1 className={styles.heading}>
            Payment was not completed
          </h1>

          <p className={styles.bodyText}>
            Your payment was not completed. Your order has not been charged. You
            can try again or contact us if you need help.
          </p>

          {ref && (
            <div className={styles.refBanner}>
              <span className={styles.refLabel}>
                Order Reference: {ref}
              </span>
            </div>
          )}

          <div className={styles.buttonRow}>
            <Button href={retryHref} variant="primary">
              Try Again
            </Button>
            <Button href="/" variant="outline">
              Back to Home
            </Button>
          </div>

          <p className={styles.bodyText} style={{ fontSize: "0.85rem" }}>
            Need help?{" "}
            <Link href="/contact" className={styles.contactLink}>
              Contact us
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
