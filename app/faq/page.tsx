import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqs } from "@/data/faqs";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import { faqPageSchema } from "@/lib/schema";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Frequently Asked Questions",
  "Answers to common questions about Pexpacks school stationery packs, office packs, delivery, payment and partnerships.",
  "/faq"
);

export const dynamic = "force-static";

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqs)} />
      <PageHero
        eyebrow="Questions"
        title="Frequently asked questions"
        text="Common questions about school lists, delivery, payment and partnerships."
        panelTitle="Support"
        panelText="Need more help? Use our contact page."
      />
      <section className={page.section}>
        <div className={`${page.sectionInner} ${page.faqList}`}>
          {faqs.map((faq) => (
            <article className={page.faqItem} key={faq.id}>
              <p className={page.kicker}>Question</p>
              <h2>{faq.question}</h2>
              <p>{faq.answer}</p>
              {faq.links?.length ? (
                <div className={page.faqLinks} aria-label="Related FAQ links">
                  {faq.links.map((link) => (
                    <Link href={link.href} key={link.href}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
