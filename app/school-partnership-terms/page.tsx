import type { Metadata } from "next";
import {
  generalEmail,
  generalEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";



export const metadata: Metadata = buildMetadata(
  "School Partnership Terms",
  "Read the Pexpacks school partnership terms for collaboration scope, responsibilities, data handling, and campaign delivery.",
  "/school-partnership-terms"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/school-partnership-terms",
  pageTitle: "School Partnership Terms",
  metaDescription:
    "Read the Pexpacks school partnership terms for collaboration scope, responsibilities, data handling, and campaign delivery.",
  heroEyebrow: "Pex your partnership",
  heroTitle: "How school partnership arrangements are structured",
  heroText:
    "This page outlines the operating expectations for schools partnering with Pexpacks on stationery fulfilment, campaigns, and related digital or parent-support services.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "School-facing collaboration terms.",
  tocHeading: "Partnership contents",
  tocAriaLabel: "School partnership terms contents",
  summaryKicker: "Partnership summary",
  summaryTitle: "Each school partnership should still be confirmed in writing",
  summaryText:
    "This page sets the standard framework, but final responsibilities, launch dates, service levels, and data boundaries should be confirmed in a school-specific agreement, proposal, or written approval chain.",
  highlights: [
    {
      title: "Data care",
      content:
        "Learner, parent, and school data must be used only for the agreed partnership purpose and handled carefully.",
      tone: "warning",
    },
    {
      title: "Contact",
      content: (
        <>
          Email <a href={generalEmailHref}>{generalEmail}</a> or call{" "}
          <a href={phoneHref}>{phoneNumber}</a>.
        </>
      ),
      tone: "accent",
    },
    {
      title: "Scope control",
      content:
        "Digital, fulfilment, and campaign work should be approved against a written scope before launch.",
    },
  ],
  sections: [
    {
      id: "scope-of-partnership",
      eyebrow: "1",
      title: "What a school partnership can include",
      summary:
        "Partnerships can cover stationery fulfilment, Pexcover, digital campaign support, or related parent-facing coordination.",
      content: (
        <ul>
          <li>School stationery pack rollout support.</li>
          <li>Grade-level or learner-group fulfilment campaigns.</li>
          <li>Pexcover preparation, bundling, or collection coordination.</li>
          <li>School microsites, digital pages, or parent communication support where offered.</li>
        </ul>
      ),
    },
    {
      id: "school-responsibilities",
      eyebrow: "2",
      title: "School responsibilities",
      summary:
        "Schools should provide clear, approved information and timely operational coordination.",
      content: (
        <ul>
          <li>Supply accurate stationery lists, grade structures, and key dates.</li>
          <li>Confirm who is authorised to approve partnership decisions.</li>
          <li>Provide permitted logos, wording, and distribution guidance where needed.</li>
          <li>Communicate changes early if school requirements shift.</li>
        </ul>
      ),
    },
    {
      id: "Pexpacks-responsibilities",
      eyebrow: "3",
      title: "Pexpacks responsibilities",
      summary:
        "Pexpacks is responsible for the agreed supply, communication, and fulfilment work within the written scope.",
      content: (
        <ul>
          <li>Prepare and coordinate packs within the agreed operational model.</li>
          <li>Support school and parent communication where this forms part of the scope.</li>
          <li>Handle partnership data only for the agreed purpose.</li>
          <li>Escalate stock, timing, or fulfilment issues as soon as reasonably possible.</li>
        </ul>
      ),
    },
    {
      id: "commercial-and-ending",
      eyebrow: "4",
      title: "Commercial terms, review, and ending the partnership",
      summary:
        "Commercial arrangements, payment routes, renewal periods, and termination rights should be agreed in writing.",
      content: (
        <>
          <p>
            Some partnerships may be school-funded, parent-paid, mixed, or tied
            to campaign-specific structures. The exact commercial model should
            be documented clearly before launch.
          </p>
          <p>
            Either party may usually request a review or end the arrangement
            subject to the written terms already accepted, operational
            commitments underway, and any live order obligations.
          </p>
        </>
      ),
    },
  ],
};

export default function SchoolPartnershipTermsPage() {
  return <LegalDocumentPage {...config} />;
}
