"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { trackCtaClicked } from "@/lib/analytics";
import { initDomRemovalGuard } from "@/lib/dom-guard";

const DynamicWhatsAppWidget = dynamic(
  () => import("@/components/shared/WhatsAppWidget").then((m) => m.WhatsAppWidget),
  { ssr: false }
);
const DynamicPwaLifecycle = dynamic(
  () => import("@/components/pwa/PwaLifecycle").then((m) => m.PwaLifecycle),
  { ssr: false }
);

export function ClientRuntimeWidgets() {
  const pathname = usePathname();
  const [idleReady, setIdleReady] = useState(false);
  const hideWhatsApp =
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/admin") ||
    pathname === "/pex-console-secure" ||
    pathname === "/login";

  useEffect(() => {
    initDomRemovalGuard();
  }, []);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setIdleReady(true), {
        timeout: 2000,
      });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = setTimeout(() => setIdleReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>(
        "a[data-conversion-event]",
      );
      if (!link) return;

      trackCtaClicked({
        sourcePath: pathname,
        destination: link.getAttribute("href") || "unknown",
        label:
          link.dataset.conversionEvent ||
          link.textContent?.trim().slice(0, 80) ||
          "unknown",
      });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return (
    <>
      {idleReady && !hideWhatsApp ? <DynamicWhatsAppWidget /> : null}
      {idleReady ? <DynamicPwaLifecycle /> : null}
    </>
  );
}
