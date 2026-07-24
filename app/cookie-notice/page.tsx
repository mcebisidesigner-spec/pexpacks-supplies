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
  "Cookie Policy",
  "Pexpacks Cookie Policy — Official notice explaining our use of essential, performance, and functional cookies under South African privacy laws (POPIA).",
  "/cookie-notice"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/cookie-notice",
  pageTitle: "Cookie Policy & Web Identifiers Notice",
  metaDescription:
    "Pexpacks Cookie Policy — Official notice explaining our use of essential, performance, and functional cookies under South African privacy laws (POPIA).",
  heroEyebrow: "Web Identifiers & POPIA Notice",
  heroTitle: "How Cookies & Digital Identifiers Operate on Pexpacks",
  heroText:
    "This notice explains the categories of cookies and web identifiers utilized on the Pexpacks website and web app, why we use them, and your statutory rights to control them.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "POPIA Aligned — Republic of South Africa",
  tocHeading: "Cookie Notice Contents",
  tocAriaLabel: "Cookie notice table of contents",
  summaryKicker: "Cookie Usage Summary",
  summaryTitle: "Privacy-First Essential & Analytics Cookies",
  summaryText:
    "Pexpacks uses cookies primarily to enable secure checkout sessions, preserve stationery tray selections, maintain site security, and measure aggregated usage trends.",
  highlights: [
    {
      title: "Consent & Controls",
      content:
        "Essential cookies are required for website operation. Non-essential cookies may be managed or disabled via your browser settings.",
      tone: "accent",
    },
    {
      title: "No Third-Party Ad Tracking",
      content:
        "Pexpacks does not use invasive cross-site advertising cookies or sell browser tracking profiles to third parties.",
      tone: "warning",
    },
  ],
  sections: [
    {
      id: "what-cookies-are",
      eyebrow: "1",
      title: "What Cookies & Web Identifiers Are",
      summary:
        "Definition of cookies, local browser storage, and session tokens under POPIA.",
      content: (
        <>
          <p>
            Cookies are small text files placed on your computer or mobile device when accessing websites. Similar technologies include local storage, session storage tokens, and web beacons. Under the <strong>Protection of Personal Information Act (POPIA 4 of 2013)</strong>, technical identifiers associated with devices constitute personal information where they identify an individual or household.
          </p>
        </>
      ),
    },
    {
      id: "cookie-categories",
      eyebrow: "2",
      title: "Categories of Cookies We Utilize",
      summary:
        "Essential, functional, and performance cookie breakdown.",
      content: (
        <>
          <h3>1. Strictly Necessary &amp; Essential Cookies</h3>
          <p>
            Required to enable core website functionalities such as navigation, shopping tray persistence, payment gateway security, and form CSRF protection. The website cannot function properly without these cookies.
          </p>
          <h3>2. Functional &amp; Preference Cookies</h3>
          <p>
            Enable the website to remember user preferences, selected school search filters, or user dashboard state between sessions.
          </p>
          <h3>3. Performance &amp; Analytics Cookies</h3>
          <p>
            Collect aggregated, anonymous statistics regarding page visits, navigation flows, and server load times (e.g. Google Analytics) to optimize website performance.
          </p>
        </>
      ),
    },
    {
      id: "managing-cookies",
      eyebrow: "3",
      title: "Managing and Disabling Cookies",
      summary:
        "Browser configuration instructions for managing cookies.",
      content: (
        <>
          <p>
            You can configure your browser to block or alert you about cookies. Disabling essential cookies may impair checkout workflows or form submissions. For privacy assistance, email our Information Officer at <a href="mailto:privacy@pexpacks.co.za">privacy@pexpacks.co.za</a> or <a href={generalEmailHref}>{generalEmail}</a>.
          </p>
        </>
      ),
    },
  ],
};

export default function CookieNoticePage() {
  return <LegalDocumentPage {...config} />;
}
