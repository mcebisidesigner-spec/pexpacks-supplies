import Image from "next/image";
import type { PartnerLogo } from "@/data/partners";
import styles from "./Marquee.module.css";

type LogoMarqueeProps = {
  partners: PartnerLogo[];
};

export function LogoMarquee({ partners }: LogoMarqueeProps) {
  const loopItems = [...partners, ...partners, ...partners];

  return (
    <div className={styles.logoMarquee} aria-label="Partner logos">
      <div className={styles.logoTrack}>
        {loopItems.map((partner, index) => (
          <div className={styles.logoCard} key={`${partner.id}-${index}`}>
            <Image
              src={partner.logoSrc}
              width={120}
              height={40}
              alt={partner.name}
              style={{
                objectFit: "contain",
                filter: "grayscale(1) brightness(0.4)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
