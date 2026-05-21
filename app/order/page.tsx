import type { Metadata } from "next";
import Link from "next/link";
import { OrderForm } from "@/components/order/OrderForm";
import { PageHero } from "@/components/marketing/PageHero";
import { orderWhatsAppHref } from "@/data/contact";
import { buildMetadata } from "@/lib/seo";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { PexcoverMarquee } from "@/components/order/PexcoverMarquee";
import { faqs } from "@/data/faqs";
import orderStyles from "@/components/order/Order.module.css";
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
  const removed = firstValue(params.removed);
  const total = firstValue(params.total);
  const draft = firstValue(params.draft);

  return (
    <>
      <PageHero
        eyebrow="Stationery order"
        title="Complete your stationery order"
        text="Review your pack, share the details PexPacks needs, choose delivery or collection, and submit a secure order request."
        panelText="Need support?"
        panelTitle="We can help confirm your school pack before you submit."
      >
        <div className={orderStyles.checkoutHeroActions}>
          <Link href="/schools" className={orderStyles.backLink}>
            Back to packs
          </Link>
          {orderWhatsAppHref ? (
            <a className={orderStyles.helpLink} href={orderWhatsAppHref}>
              Need help? WhatsApp us
            </a>
          ) : null}
        </div>
      </PageHero>
      <section>
        <div className={page.sectionInner}>
          <PexcoverMarquee />
        </div>
        <OrderForm
          initialSchool={school}
          initialGrade={grade}
          initialPhase={phase}
          initialPackId={pack}
          initialPackType={type}
          initialCustomItems={items}
          initialRemovedItems={removed}
          initialEstimatedTotal={total}
          initialDraftId={draft}
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
