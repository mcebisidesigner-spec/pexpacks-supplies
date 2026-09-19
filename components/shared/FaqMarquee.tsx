import Link from "next/link";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { FAQ } from "@/data/faqs";

type FaqMarqueeProps = {
  faqs: FAQ[];
  eyebrow?: string;
  title?: string;
  seeAllHref?: string;
  trackSection?: string;
};

export function FaqMarquee({
  faqs,
  eyebrow = "Quick answers",
  title = "Frequently asked questions",
  seeAllHref = "/faq",
  trackSection,
}: FaqMarqueeProps) {
  if (faqs.length === 0) return null;

  return (
    <section
      className="py-[var(--section-padding-y-desktop)] bg-transparent max-lg:py-[var(--section-padding-y-tablet)] max-[480px]:py-[var(--section-padding-y-mobile)]"
      aria-labelledby="faq-marquee-heading"
    >
      <div className="w-full max-w-[var(--layout-max-width)] mx-auto px-[var(--gutter-desktop)] max-lg:px-[var(--gutter-mobile)]">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          headingId="faq-marquee-heading"
        />
        <FaqAccordion
          faqs={faqs}
          title=""
          subtitle=""
          trackSection={trackSection}
        />
        {seeAllHref ? (
          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <Link
              href={seeAllHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 22px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(33, 158, 154, 0.1)",
                color: "var(--pex-keppel)",
                fontWeight: 800,
                fontSize: "15px",
                textDecoration: "none",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              Read all FAQs &rarr;
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
