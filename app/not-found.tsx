import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/marketing/PageHero";
import page from "@/styles/Page.module.css";

export default function NotFound() {
  return (
    <PageHero
      eyebrow="404 - Not found"
      title="Page not found"
      text="The page or stationery pack you requested is not available."
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
