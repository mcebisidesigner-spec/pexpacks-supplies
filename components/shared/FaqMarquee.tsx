import Link from "next/link";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { FAQ } from "@/data/faqs";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";

type FaqMarqueeProps = {
  faqs: FAQ[];
  eyebrow?: string;
  title?: string;
  seeAllHref?: string;
};

export function FaqMarquee({
  faqs,
  eyebrow = "Quick answers",
  title = "Frequently asked questions",
  seeAllHref = "/faq",
}: FaqMarqueeProps) {
  if (faqs.length === 0) return null;

  return (
    <section className={sectionStyles.section} aria-labelledby="faq-marquee-heading">
      <div className={sectionStyles.inner}>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          headingId="faq-marquee-heading"
        />
        <FaqAccordion faqs={faqs} title="" subtitle="" />
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
