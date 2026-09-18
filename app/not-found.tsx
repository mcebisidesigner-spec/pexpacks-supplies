import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";

export default function NotFound() {
  return (
    <PageHero
      eyebrow="Page not found"
      title="Page not found"
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
