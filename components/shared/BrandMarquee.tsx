import Image from "next/image";
import styles from "./BrandMarquee.module.css";

const MOCK_BRANDS = [
  "Acme Corp",
  "Globex Inc",
  "Soylent Corp",
  "Initech",
  "Umbrella Corp",
  "Stark Industries",
  "Wayne Enterprises",
  "Massive Dynamic",
];

export function BrandMarquee() {
  return (
    <div className={styles.marqueeContainer} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        {/* Double the list to create an infinite loop effect */}
        {[...MOCK_BRANDS, ...MOCK_BRANDS].map((brand, index) => (
          <div key={`${brand}-${index}`} className={styles.brandCard}>
            <Image
              src="/images/school-logo-placeholder.svg"
              alt={`${brand} logo placeholder`}
              width={100}
              height={40}
              className={styles.brandLogo}
              priority={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
