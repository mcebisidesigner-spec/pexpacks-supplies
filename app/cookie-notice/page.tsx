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
  "Read the Pexpacks cookie notice for website functionality, analytics, and browser controls.",
  "/cookie-notice"
);

export const dynamic = "force-static";

const config: LegalDocumentConfig = {
  route: "/cookie-notice",
  pageTitle: "Cookie Policy",
  metaDescription:
    "Read the Pexpacks cookie notice for website functionality, analytics, and browser controls.",
  heroEyebrow: "Cookie notice",
  heroTitle: "How cookies support the Pexpacks website",
  heroText:
    "A readable guide to the cookies and similar tools used to keep the website working, measure performance, and improve the browsing experience.",
  heroPanelTitle: `Effective ${EFFECTIVE_DATE}`,
  heroPanelText: "Functional, performance, and limited analytics use.",
  tocHeading: "Cookie contents",
  tocAriaLabel: "Cookie notice contents",
  summaryKicker: "At a glance",
  summaryTitle: "Cookies are used for function first, not for spam",
  summaryText:
    "Pexpacks uses a narrow cookie approach: keep the site stable, remember useful preferences, and understand core usage trends so the search and order journey stays reliable.",
  highlights: [
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
      title: "Browser control",
      content:
        "You can remove or block non-essential cookies through your browser settings at any time.",
      tone: "warning",
    },
    {
      title: "Important",
      content:
        "Blocking all cookies can affect search helpers, forms, and other convenience features that rely on short browser storage.",
    },
  ],
  sections: [
    {
      id: "what-cookies-are",
      eyebrow: "1",
      title: "What cookies and similar tools are",
      summary:
        "Cookies are small files or browser-based identifiers that help the site recognise useful state between visits.",
      content: (
        <>
          <p>
            Cookies are small text files stored on your device by your browser.
            Similar technologies can include local storage, pixels, or session
            identifiers. They help websites remember state, secure forms, and
            measure how pages perform.
          </p>
          <p>
            Pexpacks uses these tools to support school search, document
            browsing, form reliability, and core operational insight.
          </p>
        </>
      ),
    },
    {
      id: "cookie-categories",
      eyebrow: "2",
      title: "Cookie categories we may use",
      summary:
        "Not every browser session uses every category, but each category has a limited operational purpose.",
      content: (
        <table>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Purpose</th>
              <th scope="col">Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Essential</td>
              <td>Keep the site and forms working correctly.</td>
              <td>Session state, routing stability, and spam protection.</td>
            </tr>
            <tr>
              <td>Functional</td>
              <td>Remember basic preferences that improve usability.</td>
              <td>Helper dismissal state and interface preferences.</td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>Help us understand which pages and flows perform well.</td>
              <td>Page visits, interaction trends, and referral paths.</td>
            </tr>
          </tbody>
        </table>
      ),
    },
    {
      id: "cookie-usage",
      eyebrow: "3",
      title: "How Pexpacks uses cookies",
      summary:
        "Cookies are used to support browsing, quoting, search, and operational improvements.",
      content: (
        <ul>
          <li>Keep forms stable while you complete quote or order enquiries.</li>
          <li>Maintain secure browsing sessions and reduce abuse.</li>
          <li>
            Understand whether users find school packs, legal documents, and
            support pages easily.
          </li>
          <li>
            Improve mobile usability and reduce repeated prompts where
            appropriate.
          </li>
        </ul>
      ),
    },
    {
      id: "managing-cookies",
      eyebrow: "4",
      title: "Managing and disabling cookies",
      summary:
        "You stay in control of browser storage, but disabling essential cookies can affect the website.",
      content: (
        <>
          <p>
            Most browsers let you review, delete, or block cookies through
            privacy settings. If you disable essential or session cookies, some
            parts of the search, enquiry, checkout, or legal document
            experience may not function correctly.
          </p>
          <p>
            If you need help understanding how cookie settings affect your use
            of Pexpacks, contact us through the footer or the contact page.
          </p>
        </>
      ),
    },
  ],
  notice: (
    <p>
      This cookie notice works together with the Privacy Policy and the wider
      website terms. If the site later adds extra analytics or marketing tools,
      this page should be updated before those tools go live.
    </p>
  ),
};

export default function CookieNoticePage() {
  return <LegalDocumentPage {...config} />;
}


