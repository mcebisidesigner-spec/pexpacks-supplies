import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import heroStyles from "@/components/marketing/Marketing.module.css";
import { phasePacks } from "@/data/phasePacks";
import { PhaseClient } from "@/components/school-packs/PhaseClient";
import { buildMetadata } from "@/lib/seo";

const phaseSlug = "foundation-phase";

export const metadata: Metadata = buildMetadata(
  "Foundation Phase Stationery Packs",
  "Order or customise ready-packed stationery for Grade R to Grade 3 learners. Choose a standard pack or customise items before checkout.",
  `/${phaseSlug}`
);

export default function FoundationPhasePage() {
  const phaseData = phasePacks.find((pack) => pack.slug === phaseSlug);

  if (!phaseData) {
    notFound();
  }

  return (
    <>
      <PageHero
        eyebrow={phaseData.eyebrow}
        title={phaseData.title}
        text={phaseData.description}
      >
        <ul className={`${heroStyles.checkList} ${heroStyles.checkListSpaced}`}>
          {phaseData.heroBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </PageHero>

      <PhaseClient phaseData={phaseData} />
    </>
  );
}
