"use client";

import { Button } from "@/components/ui/Button";
import page from "@/styles/Page.module.css";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className={page.pageHero}>
      <div className={page.pageHeroNarrow}>
        <p>Something went wrong</p>
        <h1>An unexpected error occurred</h1>
        <p className={page.pageHeroText}>
          We could not load this page. Please try again or return to the homepage.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Button href="/">Go to homepage</Button>
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              borderRadius: "999px",
              border: "2px solid var(--color-navy)",
              background: "transparent",
              color: "var(--color-navy)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
