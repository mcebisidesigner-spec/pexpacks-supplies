"use client";

import { useEffect, useRef } from "react";
import { logout } from "@/app/login/actions";
import { ADMIN_IDLE_MS } from "@/lib/admin/idle";

const CHECK_EVERY_MS = 15_000;

/**
 * Force-signs-out the admin session after 15 minutes of continuous inactivity.
 * Renders nothing; only runs an idle timer while the admin panel is open.
 */
export function IdleLogout() {
  const lastActivity = useRef<number>(0);
  const signingOut = useRef(false);

  useEffect(() => {
    lastActivity.current = Date.now();
    const markActive = () => {
      lastActivity.current = Date.now();
    };

    const events = [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "touchstart",
      "scroll",
    ] as const;

    const signOutIfIdle = async () => {
      if (signingOut.current) return;
      if (Date.now() - lastActivity.current < ADMIN_IDLE_MS) return;
      signingOut.current = true;
      try {
        await logout();
      } catch {
        window.location.assign("/login");
      }
    };

    for (const name of events) {
      window.addEventListener(name, markActive, { passive: true });
    }

    const onVisibleOrFocus = () => {
      if (document.visibilityState === "visible") void signOutIfIdle();
    };
    document.addEventListener("visibilitychange", onVisibleOrFocus);
    window.addEventListener("focus", onVisibleOrFocus);

    const interval = window.setInterval(() => {
      void signOutIfIdle();
    }, CHECK_EVERY_MS);

    return () => {
      for (const name of events) {
        window.removeEventListener(name, markActive);
      }
      document.removeEventListener("visibilitychange", onVisibleOrFocus);
      window.removeEventListener("focus", onVisibleOrFocus);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
