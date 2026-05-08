import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
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
          <p className={page.pageHeroText}>Enter your order reference and contact detail to request an update.</p>
        </div>
      </section>
      <section className={page.section}>
        <div className={page.sectionInner}>
          <form className={`${page.formCard} ${page.formStack}`}>
            <h2>Tracking form</h2>
            <label>
              Order number
              <input name="orderNumber" placeholder="PEX-2026-001" />
            </label>
            <label>
              Phone or email
              <input name="contact" placeholder="Phone number or email address" />
            </label>
            <Button type="submit">Track order</Button>
          </form>
        </div>
      </section>
    </>
  );
}
