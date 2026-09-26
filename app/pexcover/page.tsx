import type { Metadata } from "next";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/ui/JsonLd";
import { PexcoverShowcaseClient } from "@/components/pexcover/PexcoverShowcaseClient";

export const metadata: Metadata = buildMetadata(
  "Pexcover™ Book Covering Service | Pre-Covered School Books",
  "Skip the late-night scissors and tape. Professional school book covering done for you with premium protective clear sleeves, durable backing papers, and personalized waterproof learner labels.",
  "/pexcover",
  "/images/pexcover-showcase-hero.jpg",
  [
    "Pexcover",
    "book covering service",
    "school book covering",
    "pre-covered exercise books",
    "clear slip on book covers",
    "personalized waterproof school labels",
    "done for you school book covering",
    "South Africa school stationery",
  ]
);

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Pexcover™ Done-For-You Book Covering Service",
  "serviceType": "School Stationery & Book Preparation",
  "provider": {
    "@type": "Organization",
    "name": "Pexpacks Supplies",
    "url": siteUrl,
  },
  "description":
    "Professional school book covering done for you. Premium protective clear sleeves, durable paper backings, and personalized waterproof learner labels delivered directly in your school stationery pack.",
  "areaServed": {
    "@type": "Country",
    "name": "South Africa",
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "ZAR",
    "availability": "https://schema.org/InStock",
    "url": `${siteUrl}/pexcover`,
  },
};

export default function PexcoverPage() {
  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <PexcoverShowcaseClient />
    </>
  );
}
