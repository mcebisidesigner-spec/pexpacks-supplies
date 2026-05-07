import { Button } from "@/components/ui/Button";
import type { Pack } from "@/data/packs";
import styles from "./Marketing.module.css";

function mediaClass(pack: Pack) {
  if (pack.category === "School") {
    return styles.packMediaBlue;
  }

  if (pack.category === "Pexpacks") {
    return styles.packMediaGreen;
  }

  return "";
}

export function PackCard({ pack }: { pack: Pack }) {
  return (
    <article className={styles.packCard}>
      <div className={[styles.packMedia, mediaClass(pack)].filter(Boolean).join(" ")} aria-hidden="true">
        <span>{pack.subcategory ?? pack.category}</span>
      </div>
      <div className={styles.packBody}>
        <p className={styles.packMeta}>Best for: {pack.bestFor}</p>
        <h3>{pack.name}</h3>
        <p>{pack.description}</p>
        <ul className={styles.packList}>
          {pack.includes.slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {pack.benefits?.length ? (
          <ul className={styles.packList} aria-label={`${pack.name} benefits`}>
            {pack.benefits.slice(0, 3).map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        ) : null}
        <div className={styles.packFooter}>
          <span className={styles.priceLabel}>{pack.priceLabel}</span>
          <Button href={pack.href} size="sm">
            {pack.cta}
          </Button>
        </div>
      </div>
    </article>
  );
}
