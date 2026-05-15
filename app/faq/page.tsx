import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqs } from "@/data/faqs";
import { buildMetadata } from "@/lib/seo";
import { faqPageSchema } from "@/lib/schema";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Frequently Asked Questions",
  "Answers to common questions about Pexpacks school stationery packs, office packs, delivery, payment and partnerships.",
  "/faq"
);

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqs)} />
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Questions</p>
          <h1>Frequently asked questions</h1>
          <p className={page.pageHeroText}>
            Common questions about school lists, delivery, payment and
            partnerships.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div className={`${page.sectionInner} ${page.faqList}`}>
          {faqs.map((faq) => (
            <article className={page.faqItem} key={faq.id}>
              <p className={page.kicker}>Question</p>
              <h2>{faq.question}</h2>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
