import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/forms/TrackOrderForm";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Track Order",
  "Track your Pexpacks stationery order by order number, phone number or email address.",
  "/track-order"
);

export default function TrackOrderPage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Track order</p>
          <h1>Check your stationery pack status</h1>
          <p className={page.pageHeroText}>
            Enter your order reference and contact detail to request an update.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div className={page.sectionInner}>
          <TrackOrderForm />
        </div>
      </section>
    </>
  );
}
