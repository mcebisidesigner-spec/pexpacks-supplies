"use client";

import { Button } from "@/components/ui/Button";
import page from "@/styles/Page.module.css";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className={page.pageHero}>
      <div className={page.pageHeroNarrow}>
        <p>Something went wrong</p>
        <h1>An unexpected error occurred</h1>
        <p className={page.pageHeroText}>
          We could not load this page. Please try again or return to the
          homepage.
        </p>
        <div className={page.notFoundActions}>
          <Button href="/">Go to homepage</Button>
          <Button type="button" onClick={() => reset()} variant="white">
            Try again
          </Button>
        </div>
      </div>
    </section>
  );
}
