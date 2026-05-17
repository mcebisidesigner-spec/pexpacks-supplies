import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { processSteps } from "@/data/packs";
import { PageHero } from "@/components/marketing/PageHero";
import { buildMetadata } from "@/lib/seo";
import page from "@/styles/Page.module.css";

export const metadata: Metadata = buildMetadata(
  "How It Works",
  "Find your school, choose your grade, confirm your pack and send an order enquiry with Pexpacks.",
  "/how-it-works"
);

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="A five easy step process"
        title="From school stationery list to ready-to-use pack"
        text="Simple ordering that helps learners start school ready."
        panelTitle="Our Process"
        panelText="Prepared for learning."
      />
      <section className={page.section}>
        <div className={page.sectionInner}>
          <div className={page.infoCard}>
            <ol className={page.stepList}>
              {processSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <Button href="/schools">Find your school pack</Button>
          </div>
        </div>
      </section>
    </>
  );
}
