"use client";

import { useEffect } from "react";

function canUseServiceWorker() {
  return (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    (window.location.protocol === "https:" ||
      window.location.hostname === "localhost")
  );
}

export function PwaLifecycle() {
  useEffect(() => {
    if (!canUseServiceWorker()) {
      return;
    }

    let cancelled = false;

    async function registerServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (!cancelled) {
          void registration.update();
        }
      } catch {
        // Registration is a progressive enhancement; the website must keep working.
      }
    }

    if (document.readyState === "complete") {
      void registerServiceWorker();
      return () => {
        cancelled = true;
      };
    }

    window.addEventListener("load", registerServiceWorker, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", registerServiceWorker);
    };
  }, []);

  return null;
}
