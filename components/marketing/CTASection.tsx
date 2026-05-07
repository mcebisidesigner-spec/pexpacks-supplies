import { Button } from "@/components/ui/Button";
import styles from "./Marketing.module.css";

type CTASectionProps = {
  title: string;
  text: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function CTASection({ title, text, primaryHref, primaryLabel, secondaryHref, secondaryLabel }: CTASectionProps) {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaInner}>
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className={styles.buttonRow}>
          <Button href={primaryHref} variant="white" size="lg">
            {primaryLabel}
          </Button>
          {secondaryHref && secondaryLabel ? (
            <Button href={secondaryHref} variant="outline" size="lg">
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
