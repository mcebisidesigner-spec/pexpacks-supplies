import clsx from "clsx";
import page from "@/styles/Page.module.css";

export default function Loading() {
  return (
    <section className={page.pageHero}>
      <div className={clsx(page.pageHeroNarrow, page.loadingState)}>
        <div
          aria-label="Loading"
          role="status"
          className={page.loadingSpinner}
        />
        <span className="sr-only">Loading page</span>
      </div>
    </section>
  );
}
