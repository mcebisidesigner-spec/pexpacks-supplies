import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientRuntimeWidgets } from "@/components/layout/ClientRuntimeWidgets";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { JsonLd } from "@/components/ui/JsonLd";
import { TrayProviders } from "@/components/order/TrayProviders";
import { buildMetadata } from "@/lib/seo";
import { getWebsiteContent } from "@/lib/cms";
import {
  onlineStoreSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/schema";
import "@/styles/tokens.css";
import "@/styles/globals.css";

const PexpacksSans = localFont({
  src: [
    {
      path: "../public/fonts/PexSans Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Bold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-pexpacks-sans",
  display: "swap",
});

const PexpacksSansAlt = localFont({
  src: [
    {
      path: "../public/fonts/PexSans Alt Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Alt Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Alt Semi Bold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/PexSans Alt Bold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-pexpacks-sans-alt",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1A2A40",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

const seoFallbacks = {
  title: "Pexpacks | School Stationery Packs",
  description:
    "School stationery made simple. Find your school pack, choose your grade, and get your learner's stationery delivered.",
};

export async function generateMetadata(): Promise<Metadata> {
  const content = await getWebsiteContent();
  const seo = content.seo_defaults;
  const title =
    typeof seo.default_title === "string" && seo.default_title.trim()
      ? seo.default_title
      : seoFallbacks.title;
  const description =
    typeof seo.default_description === "string" &&
    seo.default_description.trim()
      ? seo.default_description
      : seoFallbacks.description;

  return {
    ...buildMetadata(title, description),
    title: {
      default: title,
      template: "%s",
    },
    applicationName: "Pexpacks Supplies",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "Pexpacks",
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [
        {
          url: "/icons/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    verification: {
      google:
        process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ||
        process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
        "Rfa_la0VOcRlIrVQFE8xh5wiubIR3IbOO6HQKsq1zw0",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getWebsiteContent();

  const announcementValue = content["homepage.announcement"];
  const announcement = {
    enabled: announcementValue.enabled === true,
    text:
      typeof announcementValue.text === "string" ? announcementValue.text : "",
  };

  const companyInfo = content.company_info;
  const company = {
    site_name:
      typeof companyInfo.site_name === "string" ? companyInfo.site_name : "",
    support_email:
      typeof companyInfo.support_email === "string"
        ? companyInfo.support_email
        : "",
    support_phone:
      typeof companyInfo.support_phone === "string"
        ? companyInfo.support_phone
        : "",
    site_url:
      typeof companyInfo.site_url === "string" ? companyInfo.site_url : "",
  };

  const footerValue = content.footer;
  const footer = {
    about_text:
      typeof footerValue.about_text === "string" ? footerValue.about_text : "",
    copyright_text:
      typeof footerValue.copyright_text === "string"
        ? footerValue.copyright_text
        : "",
  };

  return (
    <html
      lang="en-ZA"
      data-scroll-behavior="smooth"
      className={`${PexpacksSans.variable} ${PexpacksSansAlt.variable}`}
    >
      <head>
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
      </head>
      <body suppressHydrationWarning>
        <a href="#site-main" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={onlineStoreSchema()} />
        <JsonLd data={websiteSchema()} />
        <div className="site-shell">
          <SiteChrome announcement={announcement} company={company} footer={footer}>
            {children}
          </SiteChrome>
          <ClientRuntimeWidgets />
          <TrayProviders />
        </div>
        <Analytics mode="production" />
        <SpeedInsights />
      </body>
    </html>
  );
}
