"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SiteRatingStrip } from "@/components/shared/SiteRatingStrip";

export type SiteContentProps = {
  announcement?: {
    id?: string;
    enabled: boolean;
    text: string;
    badge?: string;
    linkUrl?: string | null;
    linkLabel?: string | null;
  };
  company?: {
    site_name?: string;
    support_email?: string;
    support_phone?: string;
    site_url?: string;
  };
  footer?: {
    about_text?: string;
    copyright_text?: string;
  };
};

/**
 * SiteChrome renders the public site Header, Footer, and SiteRatingStrip.
 * On /admin routes the AdminShell provides its own navigation, so these
 * elements are suppressed here to avoid a double-header / double-footer.
 */
export function SiteChrome({
  children,
  announcement,
  company,
  footer,
}: {
  children: ReactNode;
} & SiteContentProps) {
  const pathname = usePathname();
  const isAuthOrAdmin =
    pathname.startsWith("/admin") ||
    pathname === "/pex-console-secure" ||
    pathname === "/login";

  if (isAuthOrAdmin) {
    return <main id="site-main" className="site-main site-main-admin">{children}</main>;
  }

  return (
    <>
      <Header announcement={announcement} />
      <main id="site-main" className="site-main">
        {children}
      </main>
      <SiteRatingStrip />
      <Footer company={company} footer={footer} />
    </>
  );
}
