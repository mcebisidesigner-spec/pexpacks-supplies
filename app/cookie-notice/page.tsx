import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Cookie Notice",
  "Read the Pexpacks cookie notice for website functionality and basic analytics.",
  "/cookie-notice"
);

export default function CookieNoticePage() {
  return (
    <>
      <PageHero
        eyebrow="Cookie Notice"
        title="Cookies and website functionality"
        text="Cookies may be used to support basic website functionality, improve browsing, and understand how visitors use the Pexpacks website."
        panelTitle="Data Notice"
        panelText="We use cookies to improve experience."
      />
      <section className={page.section}>
        <div className={page.sectionInner}>
          <article className={page.infoCard}>
            <p className={page.kicker}>Website functionality</p>
            <h2>Functional cookies</h2>
            <p>
              Functional cookies help the website remember basic preferences and
              keep forms working correctly.
            </p>
            <p className={page.kicker}>Usage insight</p>
            <h2>Analytics</h2>
            <p>
              Basic analytics may help Pexpacks understand which pages customers
              use when finding school or office stationery packs.
            </p>
            <p className={page.kicker}>Browser settings</p>
            <h2>Control</h2>
            <p>You can manage cookies through your browser settings.</p>
          </article>
        </div>
      </section>
    </>
  );
}
