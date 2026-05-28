import type { Metadata } from "next";
import Link from "next/link";

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
    <div
      style={{
        width: "100%",
        padding:
          "64px var(--gutter-desktop) var(--section-padding-y-desktop)",
        background: "var(--pex-body-bg)",
        display: "grid",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          display: "grid",
          gap: 24,
        }}
      >
        <div
          style={{
            border: "var(--card-border)",
            borderRadius: "var(--radius-card-lg)",
            background: "var(--card-bg)",
            boxShadow: "var(--card-shadow)",
            padding: "clamp(28px, 5vw, 44px)",
            display: "grid",
            gap: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "var(--radius-pill)",
              background: "rgba(185, 28, 28, 0.1)",
              color: "var(--pex-error)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto",
              fontSize: 26,
            }}
          >
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

          <h1
            style={{
              margin: 0,
              color: "var(--pex-primary)",
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              lineHeight: 1.08,
            }}
          >
            Payment Cancelled
          </h1>

          <p
            style={{
              margin: 0,
              color: "var(--pex-text-muted)",
              lineHeight: 1.5,
            }}
          >
            Your payment was not completed. Your order has not been charged. You
            can try again or contact us if you need help.
          </p>

          {ref && (
            <div
              style={{
                padding: "12px 16px",
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
                Order Reference: {ref}
              </span>
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
              href={retryHref}
              style={{
                minHeight: 48,
                padding: "0 24px",
                borderRadius: "var(--radius-pill)",
                background: "var(--pex-coral)",
                color: "var(--pex-bg)",
                fontFamily: "var(--font-button)",
                fontSize: 16,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                boxShadow: "0 10px 20px rgba(255, 111, 89, 0.22)",
                transition: "var(--button-transition)",
              }}
            >
              Try Again
            </Link>
            <Link
              href="/"
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
              Back to Home
            </Link>
          </div>

          <p
            style={{
              margin: 0,
              color: "var(--pex-text-muted)",
              fontSize: "0.85rem",
              lineHeight: 1.45,
            }}
          >
            Need help?{" "}
            <a
              href="/contact"
              style={{
                color: "var(--pex-keppel)",
                fontWeight: 800,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
