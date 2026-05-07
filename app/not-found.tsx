import { Button } from "@/components/ui/Button";
import page from "@/styles/Page.module.css";

export default function NotFound() {
  return (
    <section className={page.pageHero}>
      <div className={page.pageHeroNarrow}>
        <p>404 - Not found</p>
        <h1>Page not found</h1>
        <p className={page.notFoundText}>
The page or personal excellent pack you requested is not available.        </p>
        <div className={page.notFoundActions}>
          <Button href="/">Go to homepage</Button>
          {<Button href="/schools" variant="white">
            Find your school pack
          </Button>}
        </div>
      </div>
    </section>
  );
}
