"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Lock, Sparkles } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const PRIVACY_SHIELD_IDLE_MS = 15 * 60 * 1000;
const STANDARD_HARD_SIGNOUT_IDLE_MS = 40 * 60 * 1000;
const TRUSTED_HARD_SIGNOUT_IDLE_MS = 2 * 60 * 60 * 1000;
const ACTIVITY_CHANNEL_NAME = "pex_security_activity_channel";
const ACTIVITY_STORAGE_KEY = "pex_security_last_activity";
const ACTIVITY_THROTTLE_MS = 3_000;
const HEARTBEAT_THROTTLE_MS = 60_000;
const ADMIN_RUNTIME_SESSION_KEY = "px_admin_runtime_session";
const RUNTIME_HANDSHAKE_MS = 750;
const RUNTIME_LOGIN_GRACE_MS = 30_000;

interface SessionSecurityContextType {
  isPrivacyShieldActive: boolean;
  resumeSession: () => void;
}

const SessionSecurityContext = createContext<SessionSecurityContextType>({
  isPrivacyShieldActive: false,
  resumeSession: () => {},
});

export function useSessionSecurity() {
  return useContext(SessionSecurityContext);
}

function navigationType() {
  const entry = window.performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  return entry?.type;
}

function canReuseRuntimeMarker() {
  try {
    const issuedAt = Number(
      window.sessionStorage.getItem(ADMIN_RUNTIME_SESSION_KEY),
    );
    if (!Number.isSafeInteger(issuedAt) || issuedAt > Date.now()) return false;

    const type = navigationType();
    return (
      type === "reload" ||
      Date.now() - issuedAt <= RUNTIME_LOGIN_GRACE_MS
    );
  } catch {
    return false;
  }
}

function markRuntimeSessionActive() {
  try {
    window.sessionStorage.setItem(
      ADMIN_RUNTIME_SESSION_KEY,
      String(Date.now()),
    );
  } catch {
    // The signed server gate still protects storage-restricted browsers.
  }
}


export function SessionSecurityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPrivacyShieldActive, setIsPrivacyShieldActive] = useState(false);
  const [isRuntimeSessionVerified, setIsRuntimeSessionVerified] =
    useState(false);
  const [sessionMode, setSessionMode] = useState<"standard" | "trusted">(
    "standard",
  );
  const lastActivityRef = useRef<number>(0);
  const lastSyncRef = useRef<number>(0);
  const lastHeartbeatRef = useRef<number>(0);
  const isSigningOutRef = useRef<boolean>(false);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // 1. Hard reload on bfcache restoration (back button security)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // 2. Hard session termination & cache purge
  const performHardSignout = useCallback(
    async (reason: "timeout" | "manual" = "timeout") => {
      if (isSigningOutRef.current) return;
      isSigningOutRef.current = true;

      try {
        channelRef.current?.postMessage({ type: "HARD_SIGNOUT", reason });
      } catch {
        // ignore
      }

      try {
        window.sessionStorage.clear();
        window.localStorage.removeItem("pex_dashboard_security_notice_v2");
        window.sessionStorage.setItem(
          "pex_console_popup_notice",
          "Session expired due to inactivity.",
        );
      } catch {
        // ignore storage errors
      }

      try {
        await logoutAction();
      } catch {
        window.location.replace("/");
      }
    },
    [],
  );

  // 3. Resume session and clear privacy blur shield
  const resumeSession = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setIsPrivacyShieldActive(false);

    if (now - lastSyncRef.current > ACTIVITY_THROTTLE_MS) {
      lastSyncRef.current = now;
      try {
        window.localStorage.setItem(ACTIVITY_STORAGE_KEY, String(now));
        channelRef.current?.postMessage({ type: "ACTIVITY_PING", at: now });
      } catch {
        // ignore
      }
    }

    if (now - lastHeartbeatRef.current > HEARTBEAT_THROTTLE_MS) {
      lastHeartbeatRef.current = now;
      void fetch("/api/admin/session/heartbeat", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
      })
        .then(async (response) => {
          if (!response.ok) {
            window.location.replace("/pex-console-secure");
            return;
          }
          const result = (await response.json()) as {
            mode?: "standard" | "trusted";
          };
          if (result.mode === "trusted" || result.mode === "standard") {
            setSessionMode(result.mode);
          }
        })
        .catch(() => {
          // A transient network failure must not extend the server-side session.
        });
    }
  }, []);

  // 4. Require a same-browser runtime marker before revealing dashboard data.
  // A new tab can be authorized by an already-active tab; after restart no tab
  // responds, so the Supabase session is revoked instead of silently reopening.
  useEffect(() => {
    let authorized = false;
    let handshake: BroadcastChannel | null = null;
    let timer: number | undefined;

    const authorize = () => {
      if (authorized) return;
      authorized = true;
      markRuntimeSessionActive();
      setIsRuntimeSessionVerified(true);
      handshake?.close();
    };

    try {
      if (canReuseRuntimeMarker()) {
        authorize();
        return;
      }
    } catch {
      // Request authorization from an already-active tab below.
    }

    if (typeof BroadcastChannel !== "undefined") {
      handshake = new BroadcastChannel(ACTIVITY_CHANNEL_NAME);
      handshake.onmessage = (event) => {
        if (event.data?.type === "RUNTIME_SESSION_ACTIVE") authorize();
      };
      handshake.postMessage({ type: "RUNTIME_SESSION_REQUEST" });
    }

    timer = window.setTimeout(() => {
      if (!authorized) void performHardSignout("manual");
    }, RUNTIME_HANDSHAKE_MS);

    return () => {
      if (timer) window.clearTimeout(timer);
      handshake?.close();
    };
  }, [performHardSignout]);

  // 5. Set up cross-tab synchronization & activity monitoring after runtime verification.
  useEffect(() => {
    if (!isRuntimeSessionVerified) return;
    lastActivityRef.current = Date.now();
    resumeSession();

    if (typeof BroadcastChannel !== "undefined") {
      channelRef.current = new BroadcastChannel(ACTIVITY_CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === "RUNTIME_SESSION_REQUEST") {
          channelRef.current?.postMessage({ type: "RUNTIME_SESSION_ACTIVE" });
        } else if (
          event.data?.type === "ACTIVITY_PING" &&
          typeof event.data?.at === "number"
        ) {
          lastActivityRef.current = Math.max(
            lastActivityRef.current,
            event.data.at,
          );
          setIsPrivacyShieldActive(false);
        } else if (event.data?.type === "HARD_SIGNOUT") {
          isSigningOutRef.current = true;
          try {
            window.sessionStorage.setItem(
              "pex_console_popup_notice",
              "Session expired due to inactivity.",
            );
          } catch {}
          window.location.replace("/");
        }
      };
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === ACTIVITY_STORAGE_KEY && event.newValue) {
        const at = Number(event.newValue);
        if (Number.isFinite(at)) {
          lastActivityRef.current = Math.max(lastActivityRef.current, at);
          setIsPrivacyShieldActive(false);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    const handleUserActivity = () => {
      resumeSession();
    };

    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    const interval = setInterval(() => {
      if (isSigningOutRef.current) return;
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;
      const hardSignoutIdleMs =
        sessionMode === "trusted"
          ? TRUSTED_HARD_SIGNOUT_IDLE_MS
          : STANDARD_HARD_SIGNOUT_IDLE_MS;

      if (elapsed >= hardSignoutIdleMs) {
        void performHardSignout("timeout");
        return;
      }

      if (elapsed >= PRIVACY_SHIELD_IDLE_MS) {
        setIsPrivacyShieldActive(true);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
      window.removeEventListener("storage", onStorage);
      channelRef.current?.close();
    };
  }, [
    isRuntimeSessionVerified,
    performHardSignout,
    resumeSession,
    sessionMode,
  ]);

  const isShieldVisible = !isRuntimeSessionVerified || isPrivacyShieldActive;

  return (
    <SessionSecurityContext.Provider
      value={{ isPrivacyShieldActive, resumeSession }}
    >
      {children}

      {/* Startup verification and the 15-minute visual privacy shield. */}
      {isShieldVisible && (
        <div
          onClick={() => {
            if (isRuntimeSessionVerified) resumeSession();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            backgroundColor: "rgba(7, 11, 18, 0.88)",
            cursor: "pointer",
            userSelect: "none",
            animation: "fadeInShield 0.25s ease-out forwards",
            padding: "24px",
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard Paused for Privacy"
        >
          <style>{`
            @keyframes fadeInShield {
              from { opacity: 0; backdrop-filter: blur(0px); }
              to { opacity: 1; backdrop-filter: blur(24px); }
            }
            @keyframes pulseGlow {
              0%, 100% { transform: scale(1); box-shadow: 0 0 25px rgba(16, 185, 129, 0.25); }
              50% { transform: scale(1.04); box-shadow: 0 0 35px rgba(16, 185, 129, 0.45); }
            }
          `}</style>

          <div
            style={{
              maxWidth: "460px",
              width: "100%",
              backgroundColor: "#0c1322",
              border: "1px solid rgba(51, 65, 85, 0.9)",
              borderRadius: "16px",
              padding: "32px 28px",
              textAlign: "center",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isRuntimeSessionVerified) resumeSession();
            }}
          >
            {/* Glowing Lock Badge */}
            <div
              style={{
                width: "56px",
                height: "56px",
                margin: "0 auto 18px",
                borderRadius: "14px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
                animation: "pulseGlow 2.5s infinite ease-in-out",
              }}
            >
              <Lock size={26} strokeWidth={2.2} />
            </div>

            {/* Status Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#2dd4bf",
                backgroundColor: "rgba(45, 212, 191, 0.1)",
                border: "1px solid rgba(45, 212, 191, 0.25)",
                padding: "3px 10px",
                borderRadius: "9999px",
                marginBottom: "12px",
              }}
            >
              <Sparkles size={11} />
              {isRuntimeSessionVerified
                ? "Privacy Shield Active"
                : "Securing Dashboard"}
            </div>

            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#f8fafc",
                margin: "0 0 8px",
                letterSpacing: "-0.01em",
              }}
            >
              {isRuntimeSessionVerified
                ? "Dashboard Paused for Privacy"
                : "Verifying Session"}
            </h2>

            <p
              style={{
                fontSize: "13px",
                lineHeight: "1.5",
                color: "#94a3b8",
                margin: "0 0 24px",
              }}
            >
              {isRuntimeSessionVerified
                ? "Sensitive company and school data has been shielded from unattended viewing. Move your mouse, tap the screen, or press any key to resume your session."
                : "Checking this browser session before displaying protected data."}
            </p>

            <button
              type="button"
              onClick={() => {
                if (isRuntimeSessionVerified) resumeSession();
              }}
              style={{
                width: "100%",
                padding: "11px 20px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "var(--pex-coral, #ff6f59)",
                border: "1px solid rgba(255, 111, 89, 0.4)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 4px 14px rgba(255, 111, 89, 0.35)",
              }}
            >
              {isRuntimeSessionVerified ? "Resume Session" : "Verifying..."}
            </button>
          </div>
        </div>
      )}
    </SessionSecurityContext.Provider>
  );
}
