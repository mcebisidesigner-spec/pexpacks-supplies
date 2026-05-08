import page from "@/styles/Page.module.css";

export default function Loading() {
  return (
    <section className={page.pageHero}>
      <div className={`${page.pageHeroNarrow} ${page.loadingState}`}>
        <div aria-label="Loading" role="status" className={page.loadingSpinner} />
        <p>Loading...</p>
      </div>
    </section>
  );
}
