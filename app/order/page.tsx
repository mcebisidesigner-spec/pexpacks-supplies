import type { Metadata } from "next";
import { OrderForm } from "@/components/order/OrderForm";
import {
  ordersEmail,
  ordersEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import { buildMetadata } from "@/lib/seo";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { PexcoverMarquee } from "@/components/order/PexcoverMarquee";
import { faqs } from "@/data/faqs";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Order Stationery",
  "Start a Pexpacks stationery order enquiry by selecting your school, grade, pack and delivery details.",
  "/order"
);

type OrderPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OrderPage({ searchParams }: OrderPageProps) {
  const params = searchParams ? await searchParams : {};
  const school = firstValue(params.school);
  const grade = firstValue(params.grade);
  const phase = firstValue(params.phase);
  const pack = firstValue(params.pack);
  const type = firstValue(params.type);
  const items = firstValue(params.items);
  const total = firstValue(params.total);

  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Order now</p>
          <h1>Order your ready-to-use pack</h1>
          <p className={page.pageHeroText}>
            Select school, choose grade, confirm the pack and send your order
            details. For order support, email{" "}
            <a href={ordersEmailHref}>{ordersEmail}</a> or call{" "}
            <a href={phoneHref}>{phoneNumber}</a>.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div
          style={{
            maxWidth: "var(--layout-max-width)",
            margin: "0 auto",
            paddingInline: "var(--gutter-desktop)",
          }}
        >
          <PexcoverMarquee />
        </div>
        <OrderForm
          initialSchool={school}
          initialGrade={grade}
          initialPhase={phase}
          initialPackId={pack}
          initialPackType={type}
          initialCustomItems={items}
          initialEstimatedTotal={total}
        />
      </section>
      <section className={`${page.section} ${page.bgAlt}`}>
        <div className={page.sectionInner}>
          <FaqAccordion
            title="Ordering FAQs"
            subtitle="Everything you need to know about placing your stationery order."
            faqs={faqs.filter((faq) =>
              [
                "delivery-timing",
                "payment-flow",
                "multiple-learners",
                "exercise-books",
              ].includes(faq.id)
            )}
          />
        </div>
      </section>
    </>
  );
}
