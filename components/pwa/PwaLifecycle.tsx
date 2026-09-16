"use client";

import { useEffect } from "react";

function isLocalDevHost() {
  return ["localhost", "127.0.0.1", "::1"].includes(
    typeof window !== "undefined" ? window.location.hostname : "",
  );
}

function canUseServiceWorker() {
  return (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    window.location.protocol === "https:" &&
    !isLocalDevHost()
  );
}

export function PwaLifecycle() {
  useEffect(() => {
    // A service worker must never run on a local dev host (localhost /
    // 127.0.0.1 / ::1), regardless of NODE_ENV. This permanently clears any
    // stale registration — including the old reload-loop service worker — and
    // prevents it ever being re-registered again.
    if (isLocalDevHost()) {
      if ("serviceWorker" in navigator) {
        void Promise.all([
          navigator.serviceWorker.getRegistrations().then((registrations) =>
            Promise.all(registrations.map((registration) => registration.unregister())),
          ),
          "caches" in window
            ? caches.keys().then((keys) =>
                Promise.all(
                  keys
                    .filter((key) => key.startsWith("pexpacks-pwa-"))
                    .map((key) => caches.delete(key)),
                ),
              )
            : Promise.resolve([]),
        ]);
      }
      return;
    }

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
