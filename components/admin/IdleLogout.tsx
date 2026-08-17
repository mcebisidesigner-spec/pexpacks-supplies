"use client";

import { useEffect, useState } from "react";
import { logout } from "@/app/login/actions";
import { DeviceActivityPrompt } from "./DeviceActivityPrompt";
import {
  ADMIN_ACTIVITY_CHANNEL,
  ADMIN_ACTIVITY_STORAGE_KEY,
  ADMIN_IDLE_MS,
  ADMIN_RUNTIME_SESSION_KEY,
} from "@/lib/admin/idle";

const CHECK_EVERY_MS = 15_000;
const ACTIVITY_SYNC_THROTTLE_MS = 5_000;
const TAB_HANDSHAKE_MS = 750;
const SECURITY_NOTICE_KEY = "pex_dashboard_security_notice_v2";

type ActivityMessage =
  | { type: "activity"; at: number }
  | { type: "session-request" }
  | { type: "session-active" }
  | { type: "signed-out"; reason: "idle" | "restart" };

function hasRuntimeSession(): boolean {
  try {
    return (
      window.sessionStorage.getItem(ADMIN_RUNTIME_SESSION_KEY) === "active"
    );
  } catch {
    return true;
  }
}

function authorizeRuntimeSession() {
  try {
    window.sessionStorage.setItem(ADMIN_RUNTIME_SESSION_KEY, "active");
  } catch {
    // Storage may be disabled; the idle timeout remains active for this tab.
  }
}

/**
 * Ends an admin session after 20 minutes of visible dashboard inactivity.
 * Hidden dashboard tabs pause their local timer so work in another application
 * does not cause a logout or require browser-level activity permissions.
 */
export function IdleLogout() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    try {
      const acknowledgement = window.localStorage.getItem(SECURITY_NOTICE_KEY);
      if (!acknowledgement) {
        const timer = setTimeout(() => setShowPrompt(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage access blocked
    }
  }, []);

  const handleContinue = () => {
    try {
      window.localStorage.setItem(SECURITY_NOTICE_KEY, "acknowledged");
    } catch {}
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(SECURITY_NOTICE_KEY, "dismissed");
    } catch {}
    setShowPrompt(false);
  };

  useEffect(() => {
    let lastActivity = Date.now();
    let lastActivitySync = 0;
    let signingOut = false;
    let fallbackPaused = document.visibilityState === "hidden";
    let runtimeAuthorized = hasRuntimeSession();

    const channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel(ADMIN_ACTIVITY_CHANNEL);

    const loginUrl = (reason: "idle" | "restart") => {
      const message =
        reason === "idle"
          ? "Dashboard closed after 20 minutes of inactivity."
          : "Dashboard session closed after the browser or device restarted.";
      return `/login?message=${encodeURIComponent(message)}`;
    };

    const signOutForSecurity = async (reason: "idle" | "restart") => {
      if (signingOut) return;
      signingOut = true;
      channel?.postMessage({
        type: "signed-out",
        reason,
      } satisfies ActivityMessage);
      try {
        window.sessionStorage.removeItem(ADMIN_RUNTIME_SESSION_KEY);
      } catch {
        // Continue with the server-side sign-out.
      }

      try {
        await logout(reason);
      } catch {
        window.location.replace(loginUrl(reason));
      }
    };

    const syncActivity = (at: number) => {
      if (at - lastActivitySync < ACTIVITY_SYNC_THROTTLE_MS) return;
      lastActivitySync = at;
      try {
        window.localStorage.setItem(ADMIN_ACTIVITY_STORAGE_KEY, String(at));
      } catch {
        // BroadcastChannel is the primary cross-tab transport.
      }
      channel?.postMessage({ type: "activity", at } satisfies ActivityMessage);
    };

    const markActive = () => {
      const now = Date.now();
      lastActivity = now;
      syncActivity(now);
    };

    const onChannelMessage = (event: MessageEvent<ActivityMessage>) => {
      const message = event.data;
      if (!message || typeof message !== "object") return;

      if (message.type === "session-request" && runtimeAuthorized) {
        channel?.postMessage({
          type: "session-active",
        } satisfies ActivityMessage);
        return;
      }
      if (message.type === "session-active") {
        runtimeAuthorized = true;
        authorizeRuntimeSession();
        return;
      }
      if (message.type === "activity" && Number.isFinite(message.at)) {
        lastActivity = Math.max(lastActivity, message.at);
        return;
      }
      if (message.type === "signed-out") {
        signingOut = true;
        window.location.replace(loginUrl(message.reason));
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== ADMIN_ACTIVITY_STORAGE_KEY || !event.newValue) return;
      const at = Number(event.newValue);
      if (Number.isFinite(at)) lastActivity = Math.max(lastActivity, at);
    };

    channel?.addEventListener("message", onChannelMessage);
    window.addEventListener("storage", onStorage);

    if (!runtimeAuthorized) {
      channel?.postMessage({
        type: "session-request",
      } satisfies ActivityMessage);
    }

    const handshakeTimer = window.setTimeout(() => {
      if (!runtimeAuthorized) void signOutForSecurity("restart");
    }, TAB_HANDSHAKE_MS);

    const events = [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "touchstart",
      "scroll",
    ] as const;
    for (const name of events) {
      window.addEventListener(name, markActive, { passive: true });
    }

    const onVisibilityChange = () => {
      fallbackPaused = document.visibilityState === "hidden";
      if (!fallbackPaused) markActive();
    };
    const onFocus = () => {
      fallbackPaused = false;
      markActive();
    };
    const onBlur = () => {
      fallbackPaused = true;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    const interval = window.setInterval(() => {
      if (signingOut) return;
      const now = Date.now();

      if (!fallbackPaused && now - lastActivity >= ADMIN_IDLE_MS) {
        void signOutForSecurity("idle");
      }
    }, CHECK_EVERY_MS);

    return () => {
      window.clearTimeout(handshakeTimer);
      window.clearInterval(interval);
      for (const name of events) {
        window.removeEventListener(name, markActive);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("storage", onStorage);
      channel?.removeEventListener("message", onChannelMessage);
      channel?.close();
    };
  }, []);

  return showPrompt ? (
    <DeviceActivityPrompt
      onContinue={handleContinue}
      onDismiss={handleDismiss}
    />
  ) : null;
}
