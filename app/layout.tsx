import type { Metadata, Viewport } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import "@/styles/globals.css";

export const viewport: Viewport = {
  themeColor: "#17263c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = buildMetadata(
  "Convenience Packs for School, Home and Office",
  "Pexpacks Supplies provides ready-packed school stationery, SME office supplies and household convenience packs for busy South African families, schools and businesses."
);

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <a href="#site-main" className="skip-link">
          Skip to content
        </a>
        <JsonLd data={organizationJsonLd()} />
        <div className="site-shell">
          <Header />
          <main id="site-main" className="site-main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
