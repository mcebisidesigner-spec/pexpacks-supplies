import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/forms/TrackOrderForm";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Track Order",
  "Track your Pexpacks stationery order by order number, phone number or email address.",
  "/track-order"
);

export const dynamic = "force-static";

export default function TrackOrderPage() {
  return (
    <>
      <PageHero
        eyebrow="Track order"
        title="Check your stationery pack status"
        text="Enter your order reference and contact detail to request an update."
        panelTitle="Order Tracking"
        panelText="Stay updated on your pack."
      />
      <section className={page.section}>
        <div className={page.sectionInner}>
          <TrackOrderForm />
        </div>
      </section>
    </>
  );
}
