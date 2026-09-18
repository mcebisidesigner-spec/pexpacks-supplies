import type { Testimonial } from "@/data/testimonials";
import { SectionHeader } from "./SectionHeader";
import { TestimonialMarquee } from "@/components/shared/TestimonialMarquee";

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
    <section
      className="w-full max-w-[var(--layout-max-width)] mx-auto px-4 md:px-8 pt-[clamp(40px,5vw,64px)]"
      aria-labelledby="trust-heading"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_POINTS.map((point) => (
          <div
            className="flex items-start gap-3 p-4 border border-[var(--color-navy-subtle)] rounded-[var(--radius-card-compact)] bg-[var(--color-teal-subtle)]"
            key={point.key}
          >
            <span
              className="shrink-0 w-7 h-7 mt-0.5 rounded-full bg-[var(--pex-keppel)] text-white inline-flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <div>
              <h3 className="m-0 text-[var(--pex-navy)] font-[family-name:var(--font-heading)] font-extrabold text-base leading-[1.25]">
                {point.title}
              </h3>
              <p className="mt-1 mb-0 text-[var(--pex-text-muted)] text-sm leading-[var(--line-body)]">
                {point.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length > 0 ? (
        <div className="mt-[clamp(40px,5vw,64px)]">
          <div className="mb-5">
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

