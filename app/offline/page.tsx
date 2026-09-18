import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata(
    "Offline",
    "Pexpacks could not reach the network. Previously opened pages may still be available.",
    "/offline"
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <PageHero
      eyebrow="Connection offline"
      title="Connection needed"
    >
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        <Button href="/" className="min-h-[44px]">Go to homepage</Button>
        <Button href="/schools" variant="white" className="min-h-[44px]">
          Find your school pack
        </Button>
      </div>
    </PageHero>
  );
}
