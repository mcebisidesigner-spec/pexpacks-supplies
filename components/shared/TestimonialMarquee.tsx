import Image from "next/image";
import type { Testimonial } from "@/data/testimonials";
import styles from "./Marquee.module.css";

type TestimonialMarqueeProps = {
  items: Testimonial[];
};

export function TestimonialMarquee({ items }: TestimonialMarqueeProps) {
  const loopItems = [...items, ...items];

  return (
    <div className={styles.marquee} aria-label="Pexpacks testimonials">
      <div className={styles.track}>
        {loopItems.map((item, index) => {
          const duplicate = index >= items.length;

          return (
            <article
              className={styles.testimonialCard}
              key={`${item.id}-${index}`}
              tabIndex={duplicate ? -1 : 0}
              aria-hidden={duplicate}
            >
              <div className={styles.testimonialTop}>
                <Image
                  src={item.avatar}
                  width={54}
                  height={54}
                  alt=""
                  className={styles.avatar}
                  loading="lazy"
                />
                <div>
                  <h3 className={styles.testimonialName}>{item.name}</h3>
                  <span className={styles.testimonialRole}>{item.role}</span>
                  <span className={styles.testimonialContext}>{item.schoolOrBusiness}</span>
                </div>
              </div>
              <p className={styles.quote}>&ldquo;{item.quote}&rdquo;</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
