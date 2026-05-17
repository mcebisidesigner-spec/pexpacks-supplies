"use client";

import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import page from "@/styles/Page.module.css";

export default function GlobalError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <PageHero
      eyebrow="Something went wrong"
      title="An unexpected error occurred"
      text="We could not load this page. Please try again or return to the homepage."
    >
      <div className={page.notFoundActions}>
        <Button href="/">Go to homepage</Button>
        <Button type="button" onClick={() => reset()} variant="white">
          Try again
        </Button>
      </div>
    </PageHero>
  );
}
