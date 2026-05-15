import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
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
  const phaseData = phasePacks.find((p) => p.slug === phaseSlug);

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
        <ul style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "8px", 
          listStyle: "none", 
          padding: 0, 
          margin: "24px 0 0",
          textAlign: "left"
        }}>
          {phaseData.heroBullets.map((bullet) => (
            <li key={bullet} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--pex-text)" }}>
              <span style={{ color: "var(--pex-keppel)", fontWeight: 800 }}>✓</span> {bullet}
            </li>
          ))}
        </ul>
      </PageHero>

      <PhaseClient phaseData={phaseData} />
    </>
  );
}
