import type { Metadata } from "next";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";

export const metadata: Metadata = buildMetadata(
  "Waiting List | Pexpacks",
  "Join the Pexpacks 2027 waiting list and get 2% off your first school stationery pack.",
  "/waiting-list"
);

export const dynamic = "force-static";

export default function WaitingListPage() {
  return (
    <>
      <section
        className={sectionStyles.section}
        style={{ paddingBottom: 0 }}
      >
        <div
          className={sectionStyles.inner}
          style={{ textAlign: "center", maxWidth: 680, marginInline: "auto" }}
        >
          <p
            className={sectionStyles.sectionEyebrow}
            style={{ justifyContent: "center" }}
          >
            2027 orders
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(36px, 5.6vw, 64px)",
              lineHeight: 1,
              fontWeight: 800,
              color: "var(--pex-primary)",
            }}
          >
            Get notified + <span style={{ color: "var(--pex-coral)" }}>2% off</span>
          </h1>
          <p
            style={{
              margin: "16px auto 0",
              color: "var(--pex-muted)",
              fontSize: 18,
              lineHeight: 1.5,
              maxWidth: 520,
            }}
          >
            2027 orders open September 2026. Join the waiting list and receive a
            unique discount code for <strong>2% off</strong> your first
            pack.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(33, 158, 154, 0.08)",
                border: "1px solid rgba(33, 158, 154, 0.15)",
                color: "var(--pex-primary)",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              No obligation
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(33, 158, 154, 0.08)",
                border: "1px solid rgba(33, 158, 154, 0.15)",
                color: "var(--pex-primary)",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              Cancel anytime
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(33, 158, 154, 0.08)",
                border: "1px solid rgba(33, 158, 154, 0.15)",
                color: "var(--pex-primary)",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              One-time code
            </span>
          </div>
        </div>
      </section>

      <section className={sectionStyles.section}>
        <div className={sectionStyles.inner}>
          <WaitlistForm />
        </div>
      </section>

      <section
        className={sectionStyles.sectionAlt}
        style={{ textAlign: "center" }}
      >
        <div className={sectionStyles.inner}>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(24px, 3.6vw, 40px)",
              fontWeight: 800,
              color: "var(--pex-primary)",
            }}
          >
            Already know your school pack?
          </h2>
          <p
            style={{
              margin: "12px 0 18px",
              color: "var(--pex-muted)",
              fontSize: 16,
              lineHeight: 1.5,
            }}
          >
            While you wait, explore your school&rsquo;s stationery list for when
            orders open.
          </p>
          <Button href="/schools#school-search" variant="primary" size="lg">
            Browse school packs
          </Button>
        </div>
      </section>
    </>
  );
}
