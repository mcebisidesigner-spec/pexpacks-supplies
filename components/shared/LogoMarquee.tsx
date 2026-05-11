import Image from "next/image";
import type { PartnerLogo } from "@/data/partners";
import styles from "./Marquee.module.css";

type LogoMarqueeProps = {
  partners: PartnerLogo[];
};

export function LogoMarquee({ partners }: LogoMarqueeProps) {
  const loopItems = [...partners, ...partners];

  return (
    <div className={styles.marquee} aria-label="Pexpacks partner logo banner">
      <div className={styles.track}>
        {loopItems.map((partner, index) => {
          const duplicate = index >= partners.length;

          return (
            <div className={styles.logoCard} key={`${partner.id}-${index}`} aria-hidden={duplicate}>
              <Image src={partner.logoSrc} width={42} height={42} alt={duplicate ? "" : partner.name} loading="lazy" />
              <span>{partner.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
