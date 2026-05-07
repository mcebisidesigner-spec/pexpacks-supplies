import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "Cookie Notice",
  "Read the Pexpacks Supplies cookie notice for website functionality and basic analytics.",
  "/cookie-notice"
);

export default function CookieNoticePage() {
  return (
    <>
      <section className={page.pageHero}>
        <div className={page.pageHeroNarrow}>
          <p>Cookie Notice</p>
          <h1>Cookies and website functionality</h1>
          <p className={page.pageHeroText}>
            Cookies may be used to support basic website functionality, improve browsing, and understand how visitors
            use the Pexpacks Supplies website.
          </p>
        </div>
      </section>
      <section className={page.section}>
        <div className={page.sectionInner}>
          <article className={page.infoCard}>
            <h2>Functional cookies</h2>
            <p>Functional cookies help the website remember basic preferences and keep forms working correctly.</p>
            <h2>Analytics</h2>
            <p>
              Basic analytics may help Pexpacks Supplies understand which pages customers use when finding school or office
              stationery packs.
            </p>
            <h2>Control</h2>
            <p>You can manage cookies through your browser settings.</p>
          </article>
        </div>
      </section>
    </>
  );
}
