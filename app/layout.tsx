import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/shared/StickyMobileCTA";
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
};

export const metadata: Metadata = {
  ...buildMetadata(
    "Pexpacks | School & Office Stationery Packs",
    "School and office stationery made simple. Find your school pack, choose your grade, or request office stationery for your SME or home office."
  ),
  title: {
    default: "Pexpacks | School & Office Stationery Packs",
    template: "%s",
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
        <JsonLd data={organizationSchema()} />
        <JsonLd data={onlineStoreSchema()} />
        <JsonLd data={websiteSchema()} />
        <div className="site-shell">
          <Header />
          <main id="site-main" className="site-main">
            {children}
          </main>
          <Footer />
          <StickyMobileCTA />
        </div>
      </body>
    </html>
  );
}
