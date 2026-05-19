import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/shared/WhatsAppWidget";
import { FirstOrderDiscount } from "@/components/shared/FirstOrderDiscount";
import { SocialProofToasts } from "@/components/shared/SocialProofToasts";
import { PwaLifecycle } from "@/components/pwa/PwaLifecycle";
import { BrowserDataScript } from "@/components/system/BrowserDataScript";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata } from "@/lib/seo";
import {
  onlineStoreSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/schema";
import "@/styles/globals.css";

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
    "Pexpacks | School & Office Stationery Packs",
    "School and office stationery made simple. Find your school pack, choose your grade, or request office stationery for your SME or home office.",
  ),
  title: {
    default: "Pexpacks | School & Office Stationery Packs",
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
      { url: "/icon.png", sizes: "193x193", type: "image/png" },
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
    google: "Rfa_la0VOcRlIrVQFE8xh5wiubIR3IbOO6HQKsq1zw0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <a href="#site-main" className="skip-link">
          Skip to content
        </a>
        <BrowserDataScript />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={onlineStoreSchema()} />
        <JsonLd data={websiteSchema()} />
        <div className="site-shell">
          <Header />
          <main id="site-main" className="site-main">
            {children}
          </main>
          <Footer />
          <WhatsAppWidget />
          <SocialProofToasts />
          <FirstOrderDiscount />
          <PwaLifecycle />
        </div>
      </body>
    </html>
  );
}
