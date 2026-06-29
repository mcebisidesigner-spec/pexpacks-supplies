import { Button } from "@/components/ui/Button";
import styles from "./SavingsPlanBanner.module.css";

type Variant = "compact" | "full" | "checkout" | "schoolPage" | "homepage" | "termsNotice";

type SavingsPlanBannerProps = {
  variant?: Variant;
  showActions?: boolean;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  className?: string;
};

const variantStyles: Record<Variant, string> = {
  compact: styles.bannerCompact,
  full: "",
  checkout: styles.bannerCheckout,
  schoolPage: styles.bannerCompact,
  homepage: "",
  termsNotice: styles.bannerCompact,
};

const defaultPrimaryCta = {
  label: "Learn How It Works",
  href: "/lay-by",
};

const defaultSecondaryCta = {
  label: "Lay-by Terms",
  href: "/lay-by-terms",
};

export function SavingsPlanBanner({
  variant = "full",
  showActions = true,
  primaryCta = defaultPrimaryCta,
  secondaryCta = defaultSecondaryCta,
  className = "",
}: SavingsPlanBannerProps) {
  const variantClass = variantStyles[variant];

  return (
    <section
      className={`${styles.banner} ${variantClass} ${className}`}
      aria-labelledby="savings-banner-title"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>PexPacks savings plan</p>
        <h2 id="savings-banner-title" className={styles.title}>
          {variant === "checkout"
            ? "Save toward this pack before January"
            : variant === "schoolPage"
              ? "Want to pay slowly before back-to-school season?"
              : "Start saving for school stationery from June."}
        </h2>
        <p className={styles.text}>
          {variant === "checkout"
            ? "Start with an activation deposit, top up before October, and confirm your final pack before packing begins. Goods are packed only once your balance is settled or your value-matched pack is confirmed."
            : variant === "schoolPage"
              ? "Use the PexPacks Savings Plan to save toward this pack from June. By October, settle the balance or customise the pack to match what you saved."
              : variant === "termsNotice"
                ? "This is not instant delivery. Your pack is prepared after your balance is settled or after you confirm a value-matched pack."
                : "Top up your PexPacks balance before October and avoid the January stationery rush. Once your balance is ready, we prepare your pack."}
        </p>

        <div className={styles.chips}>
          <span className={`${styles.chip} ${styles.chipCoral}`}>June: Start</span>
          <span className={`${styles.chip} ${styles.chipTeal}`}>Jul–Sep: Top up</span>
          <span className={`${styles.chip} ${styles.chipNavy}`}>1 Oct: Balance check</span>
          <span className={`${styles.chip} ${styles.chipCoral}`}>15 Oct: Final decision</span>
        </div>

        {showActions ? (
          <div className={styles.actions}>
            <Button href={primaryCta.href} variant="primary" size="md">
              {primaryCta.label}
            </Button>
            <Button href={secondaryCta.href} variant="outline" size="md">
              {secondaryCta.label}
            </Button>
          </div>
        ) : null}

        {variant === "checkout" || variant === "termsNotice" ? (
          <div className={styles.notice}>
            <strong>Not instant delivery.</strong> Your pack is prepared after your balance is
            settled or after you confirm a value-matched pack.
          </div>
        ) : null}
      </div>
    </section>
  );
}
