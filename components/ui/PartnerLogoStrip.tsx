import Image from "next/image";
import styles from "./PartnerLogoStrip.module.css";

const logos = ["Northview", "College", "Academy", "Primary", "School"];

export function PartnerLogoStrip() {
  return (
    <div className={styles.logoStrip} aria-label="Partner school logos">
      {logos.map((name, index) => (
        <div className={styles.logoItem} key={`${name}-${index}`}>
          <Image src="/images/school-logo-placeholder.svg" alt={`${name} partner school crest`} width={100} height={100} />
        </div>
      ))}
    </div>
  );
}
