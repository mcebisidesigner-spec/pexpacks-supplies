import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import sectionStyles from "@/components/marketing/MarketingSections.module.css";
import { phasePacks } from "@/data/phasePacks";
import { PhaseClient } from "@/components/school-packs/PhaseClient";
import { buildMetadata } from "@/lib/seo";

const phaseSlug = "high-school";

export const metadata: Metadata = buildMetadata(
  "High School Stationery Packs",
  "Order or customise ready-packed stationery for Grade 8 to Grade 12 learners, including exercise books, pens, files, calculator-ready items and exam basics.",
  `/${phaseSlug}`
);

export default function HighSchoolPage() {
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
