import { Button } from "@/components/ui/Button";
import { HappyPayLogo } from "@/components/bnpl/HappyPayLogo";
import clsx from "clsx";
import styles from "./HappyPayBanner.module.css";

type HappyPayBannerProps = {
  variant?: "homepage" | "schoolPage";
  className?: string;
};

const copy = {
  homepage: {
    eyebrow: "Happy Pay \u00b7 Buy Now Pay Later",
    title: "Split your school shop in 2. Pay 50% today, the rest in 30 days.",
    text: "Get your child\u2019s full stationery pack now and pay half today. Happy Pay settles your order with Pexpacks straight away \u2014 interest-free and no application fees.",
  },
  schoolPage: {
    eyebrow: "Happy Pay \u00b7 Buy Now Pay Later",
    title: "Pay for this pack in 2 easy, interest-free payments.",
    text: "Order your child\u2019s school pack now and pay just 50% today. Happy Pay covers the balance, and you settle the rest in 30 days \u2014 no fees, no impact on your credit score.",
  },
} as const;

const badges = [
  "0% interest",
  "No application fees",
  "Approval in under 60 seconds",
  "No impact on your credit score",
] as const;

export function HappyPayBanner({
  variant = "homepage",
  className = "",
}: HappyPayBannerProps) {
  const content = copy[variant];

  return (
    <section
      id="happy-pay-banner"
      className={clsx(styles.banner, className)}
      aria-labelledby="happy-pay-banner-title"
    >
      <span className={styles.ringTop} aria-hidden="true" />
      <span className={styles.ringBottom} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h2 id="happy-pay-banner-title" className={styles.title}>
            {content.title}
          </h2>
          <p className={styles.text}>{content.text}</p>

          <ul className={styles.badges}>
            {badges.map((badge) => (
              <li key={badge} className={styles.badge}>
                <span className={styles.badgeCheck} aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {badge}
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Button
              href="/happy-pay"
              variant="primary"
              size="md"
              iconDirection="right"
              data-conversion-event={`${variant === "homepage" ? "homepage" : "school"}_happy_pay_learn_more`}
            >
              Learn How It Works
            </Button>
            <Button
              href="/checkout"
              variant="white"
              size="md"
              data-conversion-event={`${variant === "homepage" ? "homepage" : "school"}_happy_pay_split`}
            >
              Split my pack in 2
            </Button>
          </div>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <span className={styles.visualHalo} />
          <div className={styles.splitCard}>
            <div className={styles.splitCardHeader}>
              <HappyPayLogo tone="dark" />
              <span className={styles.splitCardTag}>BNPL</span>
            </div>

            <div className={styles.splitRow}>
              <span className={styles.splitLabel}>Payment 1</span>
              <span className={styles.splitMeta}>
                <strong>Today</strong>
                <em>50%</em>
              </span>
            </div>

            <div className={styles.splitDivider} />

            <div className={styles.splitRow}>
              <span className={styles.splitLabel}>Payment 2</span>
              <span className={styles.splitMeta}>
                <strong>In 30 days</strong>
                <em>50%</em>
              </span>
            </div>

            <div className={styles.splitCardFooter}>
              <svg
                className={styles.shieldIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Secure checkout powered by Ozow
            </div>
          </div>

          <span className={clsx(styles.floatingChip, styles.floatingChipCoral)}>
            0% interest
          </span>
          <span className={clsx(styles.floatingChip, styles.floatingChipTeal)}>
            No fees
          </span>
        </div>
      </div>
    </section>
  );
}
