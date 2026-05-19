import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = {
  title: "Offline | Pexpacks",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <PageHero
      eyebrow="Offline"
      title="Connection needed"
      text="Pexpacks could not reach the network. Previously opened pages may still be available."
    >
      <div className={page.notFoundActions}>
        <Button href="/">Go to homepage</Button>
        <Button href="/schools" variant="white">
          Find your school pack
        </Button>
      </div>
    </PageHero>
  );
}
