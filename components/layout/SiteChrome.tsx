"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { SiteRatingStrip } from "@/components/shared/SiteRatingStrip";

/**
 * SiteChrome renders the public site Header, Footer, and SiteRatingStrip.
 * On /admin routes the AdminShell provides its own navigation, so these
 * elements are suppressed here to avoid a double-header / double-footer.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main id="site-main" className="site-main">{children}</main>;
  }

  return (
    <>
      <Header />
      <main id="site-main" className="site-main">
        {children}
      </main>
      <SiteRatingStrip />
      <Footer />
    </>
  );
}
