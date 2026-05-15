import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import styles from "./ImmersiveUnboxing.module.css";

const boxFeatures = [
  "Brand-name stationery exactly matching the list",
  "Exercise books pre-covered with Pexcover",
  "Colour-coded subject labels",
  "Sturdy, protective eco-friendly packaging"
];

export function ImmersiveUnboxing() {
  return (
    <section className={styles.banner} aria-label="Unboxing Experience">
      <div className={styles.bgImageWrap}>
        <Image
          src="/images/unboxing-items.webp"
          alt="Overhead view of perfectly packed Pexpacks stationery box"
          fill
          priority
          className={styles.bgImage}
          sizes="100vw"
        />
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      <div className={styles.inner}>
        <div className={styles.glassCard}>
          <SectionHeader
            eyebrow="The unboxing experience"
            title="What's in the box?"
            text="Each Pexpacks stationery pack is prepared to help learners start ready, with essential school supplies according to school lists."
          />
          
          <ul className={styles.checklist}>
            {boxFeatures.map((feature, index) => (
              <li key={index}>
                <span className={styles.checkIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Button href="/schools">Find Your School Pack</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
