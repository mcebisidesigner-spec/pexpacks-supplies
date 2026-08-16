import { Button } from "@/components/ui/Button";
import styles from "./CTASection.module.css";

type CTASectionProps = {
  eyebrow?: string;
  title: string;
  text: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function CTASection({
  eyebrow,
  title,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: CTASectionProps) {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaInner}>
        <div>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className={styles.buttonRow}>
          <Button
            href={primaryHref}
            variant="white"
            size="lg"
            data-conversion-event={`cta_${primaryLabel.toLowerCase().replaceAll(" ", "_")}`}
          >
            {primaryLabel}
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button
              href={secondaryHref}
              variant="primary"
              size="lg"
              data-conversion-event={`cta_${secondaryLabel.toLowerCase().replaceAll(" ", "_")}`}
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
