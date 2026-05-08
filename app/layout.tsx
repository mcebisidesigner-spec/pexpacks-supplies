import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { localBusinessSchema, organizationSchema, websiteSchema } from "@/lib/schema";
import "@/styles/globals.css";

export const viewport: Viewport = {
  themeColor: "#17263c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  ...buildMetadata(
    "Pexpacks | School & Office Stationery Packs",
    "Pexpacks provides ready-packed school stationery, SME office supplies and household convenience packs for busy South African families, schools and businesses."
  ),
  title: {
    default: "Pexpacks | School & Office Stationery Packs",
    template: "%s",
  },
  verification: {
    google: "Rfa_la0VOcRlIrVQFE8xh5wiubIR3IbOO6HQKsq1zw0",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <a href="#site-main" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={localBusinessSchema()} />
        <JsonLd data={websiteSchema()} />
        <div className="site-shell">
          <Header />
          <main id="site-main" className="site-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
