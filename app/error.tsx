"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import page from "@/styles/Page.module.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <PageHero
      eyebrow="Something went wrong"
      title="An unexpected error occurred"
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
