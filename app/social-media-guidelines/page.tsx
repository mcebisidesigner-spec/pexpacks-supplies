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
  "Social Media Guidelines",
  "Read the Pexpacks social media guidelines for respectful engagement, moderation, and support boundaries.",
  "/social-media-guidelines"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/social-media-guidelines",
  pageTitle: "Social Media Guidelines",
  metaDescription:
    "Read the Pexpacks social media guidelines for respectful engagement, moderation, and support boundaries.",
  heroEyebrow: "Social Media Guidelines",
  heroTitle: "How Pexpacks manages social engagement",
  heroText:
    "These guidelines explain how comments, messages, tags, mentions, and community engagement are moderated across Pexpacks social platforms.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "Respectful communication and clear moderation boundaries.",
  tocHeading: "Social contents",
  tocAriaLabel: "Social media guidelines contents",
  summaryKicker: "Community standard",
  summaryTitle: "Keep interactions useful, lawful, and respectful",
  summaryText:
    "Pexpacks welcomes genuine product, service, and support conversations, but the platform is not a place for abuse, spam, threats, or unlawful content.",
  highlights: [
    {
      title: "Support route",
      content:
        "Order-specific issues are usually resolved faster through direct contact channels than public comment threads.",
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
      title: "Moderation",
      content:
        "Harmful, misleading, or privacy-invasive content may be hidden, removed, or escalated.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "expected-conduct",
      eyebrow: "1",
      title: "Expected conduct on Pexpacks channels",
      summary:
        "Public and private interactions should remain relevant, respectful, and lawful.",
      content: (
        <ul>
          <li>Stay courteous when discussing service, orders, or feedback.</li>
          <li>Protect personal, learner, and payment information.</li>
          <li>Keep comments relevant to the post, service, or support issue.</li>
          <li>Use direct channels for sensitive or account-specific support.</li>
        </ul>
      ),
    },
    {
      id: "restricted-content",
      eyebrow: "2",
      title: "Content that may be removed",
      summary:
        "Pexpacks may remove or hide harmful, misleading, or abusive content.",
      content: (
        <ul>
          <li>Threats, harassment, hate speech, or discriminatory remarks.</li>
          <li>Spam, scams, malicious links, or repeated irrelevant promotion.</li>
          <li>False claims presented as fact without a valid basis.</li>
          <li>Posts exposing personal, learner, school, or payment information.</li>
        </ul>
      ),
    },
    {
      id: "moderation-and-response",
      eyebrow: "3",
      title: "Moderation and response approach",
      summary:
        "Pexpacks may moderate, limit, or escalate interactions where necessary to protect users and the brand.",
      content: (
        <>
          <p>
            Pexpacks may hide, delete, report, or restrict content that breaks
            these guidelines or puts users at risk. Serious cases may be
            escalated to platform providers or the relevant authorities.
          </p>
          <p>
            Response times can vary. A public social message is not a guaranteed
            immediate support channel.
          </p>
        </>
      ),
    },
    {
      id: "reviews-and-user-content",
      eyebrow: "4",
      title: "Reviews, mentions, and shared content",
      summary:
        "Feedback may be quoted or reshared where lawful and appropriate, but misleading or harmful material may be challenged.",
      content: (
        <>
          <p>
            By tagging or submitting feedback to Pexpacks on a public platform,
            you may allow the brand to engage with, repost, or reference that
            content in context, subject to platform rules and applicable law.
          </p>
          <p>
            If you want content removed because it creates a legitimate privacy
            or safety concern, contact Pexpacks directly with the relevant post
            or message details.
          </p>
        </>
      ),
    },
  ],
};

export default function SocialMediaGuidelinesPage() {
  return <LegalDocumentPage {...config} />;
}
