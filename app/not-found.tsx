import { Button } from "@/components/ui/Button";
import page from "@/styles/Page.module.css";

export default function NotFound() {
  return (
    <section className={page.pageHero}>
      <div className={page.pageHeroNarrow}>
        <p>404 — Not found</p>
        <h1>This page could not be found</h1>
        <p className={page.pageHeroText}>The page or stationery pack you requested is not available.</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button href="/">Go to homepage</Button>
          <Button href="/schools" variant="white">Find your school pack</Button>
        </div>
      </div>
    </section>
  );
}
