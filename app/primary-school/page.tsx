import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import { phasePacks } from "@/data/phasePacks";
import { PhaseClient } from "@/components/school-packs/PhaseClient";
import { buildMetadata } from "@/lib/seo";

const phaseSlug = "primary-school";

export const metadata: Metadata = buildMetadata(
  "Primary School Stationery Packs",
  "Order or customise ready-packed stationery for Grade 4 to Grade 7 learners, including school essentials, exercise books and writing supplies.",
  `/${phaseSlug}`
);

export default function PrimarySchoolPage() {
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
        <ul className={`${sectionStyles.checkList} ${sectionStyles.checkListSpaced}`}>
          {phaseData.heroBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </PageHero>

      <PhaseClient phaseData={phaseData} />
    </>
  );
}
