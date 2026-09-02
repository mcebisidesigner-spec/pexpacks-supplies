import type { Testimonial } from "@/data/testimonials";
import { SectionHeader } from "./SectionHeader";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";
import styles from "./SchoolsTrustSection.module.css";

type SchoolsTrustSectionProps = {
  testimonials: Testimonial[];
};

const TRUST_POINTS = [
  {
    key: "match",
    title: "Exact 100% match",
    text: "Every pack is packed to your school's official stationery list.",
  },
  {
    key: "quality",
    title: "Teacher-approved brands",
    text: "Croxley, BIC, Pritt, Staedtler and Pilot — brands your school relies on.",
  },
  {
    key: "delivery",
    title: "Term-ready delivery",
    text: "We pack, cover and deliver so your child is first-day ready.",
  },
  {
    key: "support",
    title: "Human help, always",
    text: "Upload any list or chat to us on WhatsApp and we'll handle the rest.",
  },
];

export function SchoolsTrustSection({
  testimonials,
}: SchoolsTrustSectionProps) {
  return (
    <section className={styles.trustSection} aria-labelledby="trust-heading">
      <div className={styles.trustBand}>
        {TRUST_POINTS.map((point) => (
          <div className={styles.trustPoint} key={point.key}>
            <span className={styles.trustCheck} aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <div>
              <h3 className={styles.trustTitle}>{point.title}</h3>
              <p className={styles.trustText}>{point.text}</p>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length > 0 ? (
        <div className={styles.testimonialsBlock}>
          <div className={styles.testimonialsHeader}>
            <SectionHeader
              eyebrow="Parents trust Pexpacks"
              title="Ready before the first day of school"
              text="See why parents and teachers order their school stationery through Pexpacks year after year."
              headingId="trust-heading"
            />
          </div>
          <TestimonialMarquee items={testimonials} />
        </div>
      ) : null}
    </section>
  );
}
