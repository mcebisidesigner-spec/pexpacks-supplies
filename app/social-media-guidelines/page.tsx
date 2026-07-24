import type { Metadata } from "next";
import {
  legalEmail as generalEmail,
  legalEmailHref as generalEmailHref,
  phoneHref,
  phoneNumber,
} from "@/data/contact";
import {
  LegalDocumentPage,
  type LegalDocumentConfig,
} from "@/components/policy/LegalDocumentPage";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { EFFECTIVE_DATE } from "@/lib/constants";

export const metadata: Metadata = buildMetadata(
  "Social Media Guidelines",
  "Pexpacks Social Media & Community Guidelines — Official rules governing online community engagement, content moderation, and POPIA privacy protection on social channels.",
  "/social-media-guidelines"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/social-media-guidelines",
  pageTitle: "Social Media & Community Guidelines",
  metaDescription:
    "Pexpacks Social Media & Community Guidelines — Official rules governing online community engagement, content moderation, and POPIA privacy protection on social channels.",
  heroEyebrow: "Community Engagement & Moderation",
  heroTitle: "Social Media Guidelines & Moderation Policy",
  heroText:
    "These guidelines regulate user conduct, content submissions, and comment moderation across all official Pexpacks social media pages and community channels.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "Cybercrimes Act & POPIA Aligned — South Africa",
  tocHeading: "Social Guidelines Contents",
  tocAriaLabel: "Social media guidelines contents",
  summaryKicker: "Community Safety Notice",
  summaryTitle: "Respectful, Constructive Digital Channels",
  summaryText:
    "Pexpacks welcomes community engagement and genuine customer feedback. To maintain a safe environment for parents, learners, and schools, interactions must adhere to South African laws governing online safety and privacy.",
  highlights: [
    {
      title: "POPIA Privacy Safeguard",
      content:
        "Never post personal details, learner names, or order numbers publicly. Use direct, private support channels for account enquiries.",
      tone: "accent",
    },
    {
      title: "Cybercrimes Act Moderation",
      content:
        "Hate speech, harassment, threats, or harmful electronic communications under the Cybercrimes Act 19 of 2020 will be removed immediately.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "expected-conduct",
      eyebrow: "1",
      title: "Community Conduct & Online Respect",
      summary:
        "Standards for respectful communication across official Pexpacks social platforms.",
      content: (
        <>
          <p>Users engaging with Pexpacks on social media channels agree to:</p>
          <ul>
            <li>Maintain respectful, courteous language in public comments and direct messages;</li>
            <li>Protect personal privacy by withholding order references, phone numbers, or learner names from public posts;</li>
            <li>Use official email or phone support channels for urgent order or fulfillment inquiries.</li>
          </ul>
        </>
      ),
    },
    {
      id: "moderation-rules",
      eyebrow: "2",
      title: "Content Moderation & Prohibited Content",
      summary:
        "Legal grounds for hiding, deleting, or blocking abusive social media content.",
      content: (
        <>
          <p>
            In accordance with the <strong>Cybercrimes Act 19 of 2020</strong> and POPIA, Pexpacks reserves the right to moderate, hide, delete, or report comments containing:
          </p>
          <ul>
            <li>Hate speech, harassment, defamation, threats, or abusive language;</li>
            <li>Unauthorized disclosure of children's, learners', or parents' personal information;</li>
            <li>Commercial spam, unauthorized advertising, or fraudulent links;</li>
            <li>False or malicious statements intended to mislead the public.</li>
          </ul>
        </>
      ),
    },
    {
      id: "governing-law",
      eyebrow: "3",
      title: "Official Customer Support Channels",
      summary:
        "Direct contact channels for verified support inquiries.",
      content: (
        <>
          <p>
            For order resolution, return claims, or formal customer support, please contact our support team directly:
          </p>
          <ul>
            <li><strong>Support Email:</strong> <a href={generalEmailHref}>{generalEmail}</a></li>
            <li><strong>Telephone:</strong> <a href={phoneHref}>{phoneNumber}</a></li>
            <li><strong>Official Website:</strong> <a href={siteUrl}>{siteUrl}</a></li>
          </ul>
        </>
      ),
    },
  ],
};

export default function SocialMediaGuidelinesPage() {
  return <LegalDocumentPage {...config} />;
}
