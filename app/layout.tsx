import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ClientRuntimeWidgets } from "@/components/layout/ClientRuntimeWidgets";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { JsonLd } from "@/components/ui/JsonLd";
import { TrayProviders } from "@/components/order/TrayProviders";
import { buildMetadata } from "@/lib/seo";
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

export const metadata: Metadata = {
  ...buildMetadata(
    "Pexpacks | School Stationery Packs",
    "School stationery made simple. Find your school pack, choose your grade, and get your learner's stationery delivered."
  ),
  title: {
    default: "Pexpacks | School Stationery Packs",
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
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ?? "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
          <SiteChrome>{children}</SiteChrome>
          <ClientRuntimeWidgets />
          <TrayProviders />
        </div>
      </body>
    </html>
  );
}
