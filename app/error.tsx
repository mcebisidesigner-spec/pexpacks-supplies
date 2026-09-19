"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";

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
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        <Button href="/" className="min-h-[44px]">Go to homepage</Button>
        <Button type="button" onClick={() => reset()} variant="white" className="min-h-[44px]">
          Try again
        </Button>
      </div>
    </PageHero>
  );
}
