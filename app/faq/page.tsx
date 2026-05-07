import type { Metadata } from "next";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqs } from "@/data/faqs";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "FAQ",
  "Answers to common questions about Pexpacks Supplies school and office stationery packs.",
  "/faq"
);

export default function FAQPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs)} />
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Questions</p>
          <h1>Frequently asked questions</h1>
          <p className={page.pageHeroText}>Common questions about school lists, delivery, payment and partnerships.</p>
        </div>
      </section>
      <section className={page.section}>
        <div className={`${page.sectionInner} ${page.faqList}`}>
          {faqs.map((faq) => (
            <article className={page.faqItem} key={faq.id}>
              <h2>{faq.question}</h2>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
