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
    function stripInjectedAssistantControls() {
      const legends = document.getElementsByTagName("legend");
      for (let i = 0; i < legends.length; i++) {
        const text = legends[i].textContent || "";
        if (/assistant\s*controls/i.test(text)) {
          const el = legends[i].closest("fieldset") || legends[i].parentElement;
          if (el) {
            el.remove();
          }
        }
      }
    }

    // Run once immediately on mount
    stripInjectedAssistantControls();

    // Debounce mutation checks and disconnect after 3.5 seconds to avoid main-thread INP contention
    let scheduled = false;
    const debouncedCheck = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        stripInjectedAssistantControls();
        scheduled = false;
      });
    };

    const observer = new MutationObserver(debouncedCheck);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const cleanupTimer = setTimeout(() => {
      observer.disconnect();
    }, 3500);

    return () => {
      observer.disconnect();
      clearTimeout(cleanupTimer);
    };
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
