import page from "@/styles/Page.module.css";

export function PageLoadingSkeleton() {
  return (
    <div className={page.loadingPage} aria-busy="true" aria-label="Loading page" role="status">
      <section className={page.loadingHero}>
        <div className={page.loadingHeroInner}>
          <span className={page.loadingEyebrow} />
          <span className={page.loadingTitle} />
          <span className={page.loadingTitleShort} />
        </div>
      </section>
      <section className={page.loadingContent}>
        <span className={page.loadingLine} />
        <div className={page.loadingGrid}>
          <span />
          <span />
          <span />
        </div>
      </section>
      <span className="sr-only">Loading page</span>
    </div>
  );
}
