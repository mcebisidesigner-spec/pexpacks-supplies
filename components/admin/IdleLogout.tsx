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

type IdleState = "active" | "idle" | null;
type ScreenState = "locked" | "unlocked" | null;

interface SystemIdleDetector extends EventTarget {
  userState: IdleState;
  screenState: ScreenState;
  start(options: { threshold: number; signal?: AbortSignal }): Promise<void>;
}

interface SystemIdleDetectorConstructor {
  new (): SystemIdleDetector;
  requestPermission(): Promise<PermissionState>;
}

type ActivityMessage =
  | { type: "activity"; at: number }
  | { type: "session-request" }
  | { type: "session-active" }
  | { type: "signed-out"; reason: "idle" | "restart" };

function getSystemIdleDetector(): SystemIdleDetectorConstructor | undefined {
  return (window as Window & { IdleDetector?: SystemIdleDetectorConstructor }).IdleDetector;
}

function hasRuntimeSession(): boolean {
  try {
    return window.sessionStorage.getItem(ADMIN_RUNTIME_SESSION_KEY) === "active";
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
 * Ends an admin session after 20 minutes of device inactivity. System-wide
 * idle detection is used when available; otherwise hidden dashboard tabs pause
 * their local timer so work in another application does not cause a logout.
 */
export function IdleLogout() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    try {
      const consent = window.localStorage.getItem("pex_device_activity_consent");
      if (!consent) {
        const timer = setTimeout(() => setShowPrompt(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage access blocked
    }
  }, []);

  const handleAllow = () => {
    try {
      window.localStorage.setItem("pex_device_activity_consent", "granted");
    } catch {}
    setShowPrompt(false);

    const IdleDetector = getSystemIdleDetector();
    if (IdleDetector) {
      IdleDetector.requestPermission().catch(() => {});
    }
  };

  const handleBlock = () => {
    try {
      window.localStorage.setItem("pex_device_activity_consent", "denied");
    } catch {}
    setShowPrompt(false);
  };

  useEffect(() => {
    let lastActivity = Date.now();
    let lastActivitySync = 0;
    let signingOut = false;
    let systemDetectionActive = false;
    let systemDetectionStarting = false;
    let fallbackPaused = document.visibilityState === "hidden";
    let screenLockedAt: number | null = null;
    let runtimeAuthorized = hasRuntimeSession();

    const abortController = new AbortController();
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
      channel?.postMessage({ type: "signed-out", reason } satisfies ActivityMessage);
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
      screenLockedAt = null;
      syncActivity(now);
    };

    const onChannelMessage = (event: MessageEvent<ActivityMessage>) => {
      const message = event.data;
      if (!message || typeof message !== "object") return;

      if (message.type === "session-request" && runtimeAuthorized) {
        channel?.postMessage({ type: "session-active" } satisfies ActivityMessage);
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
      channel?.postMessage({ type: "session-request" } satisfies ActivityMessage);
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

    const startSystemDetection = async (requestPermission: boolean) => {
      const IdleDetector = getSystemIdleDetector();
      if (!IdleDetector || systemDetectionActive || systemDetectionStarting) return;
      systemDetectionStarting = true;

      try {
        let permission = "denied";
        if (requestPermission) {
          permission = await IdleDetector.requestPermission();
        } else if ("permissions" in navigator && navigator.permissions?.query) {
          try {
            const status = await navigator.permissions.query({ name: "idle-detection" as PermissionName });
            permission = status.state;
          } catch {
            permission = "prompt";
          }
        }
        if (permission !== "granted") return;

        const detector = new IdleDetector();
        detector.addEventListener("change", () => {
          if (detector.userState === "idle") {
            void signOutForSecurity("idle");
            return;
          }
          if (detector.screenState === "locked") {
            screenLockedAt ??= Date.now();
            return;
          }
          if (detector.userState === "active") markActive();
        });
        await detector.start({
          threshold: ADMIN_IDLE_MS,
          signal: abortController.signal,
        });
        systemDetectionActive = true;
      } catch {
        systemDetectionActive = false;
      } finally {
        systemDetectionStarting = false;
      }
    };

    void startSystemDetection(false);

    const interval = window.setInterval(() => {
      if (signingOut) return;
      const now = Date.now();

      if (systemDetectionActive) {
        if (screenLockedAt !== null && now - screenLockedAt >= ADMIN_IDLE_MS) {
          void signOutForSecurity("idle");
        }
        return;
      }

      if (!fallbackPaused && now - lastActivity >= ADMIN_IDLE_MS) {
        void signOutForSecurity("idle");
      }
    }, CHECK_EVERY_MS);

    return () => {
      abortController.abort();
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
    <DeviceActivityPrompt onAllow={handleAllow} onBlock={handleBlock} />
  ) : null;
}
