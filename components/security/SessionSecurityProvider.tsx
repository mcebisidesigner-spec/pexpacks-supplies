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

const PRIVACY_SHIELD_IDLE_MS = 2 * 60 * 1000; // 2 minutes (120,000 ms)
const HARD_SIGNOUT_IDLE_MS = 20 * 60 * 1000; // 20 minutes (1,200,000 ms)
const ACTIVITY_CHANNEL_NAME = "pex_security_activity_channel";
const ACTIVITY_STORAGE_KEY = "pex_security_last_activity";
const ACTIVITY_THROTTLE_MS = 3_000;

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

export function SessionSecurityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPrivacyShieldActive, setIsPrivacyShieldActive] = useState(false);
  const lastActivityRef = useRef<number>(0);
  const lastSyncRef = useRef<number>(0);
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
  const performHardSignout = useCallback(async (reason: "timeout" | "manual" = "timeout") => {
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
        "Session expired due to 20 minutes of inactivity."
      );
    } catch {
      // ignore storage errors
    }

    try {
      await logoutAction();
    } catch {
      window.location.replace("/");
    }
  }, []);

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
  }, []);

  // 4. Set up cross-tab synchronization & Activity monitoring
  useEffect(() => {
    lastActivityRef.current = Date.now();

    if (typeof BroadcastChannel !== "undefined") {
      channelRef.current = new BroadcastChannel(ACTIVITY_CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === "ACTIVITY_PING" && typeof event.data?.at === "number") {
          lastActivityRef.current = Math.max(lastActivityRef.current, event.data.at);
          setIsPrivacyShieldActive(false);
        } else if (event.data?.type === "HARD_SIGNOUT") {
          isSigningOutRef.current = true;
          try {
            window.sessionStorage.setItem(
              "pex_console_popup_notice",
              "Session expired due to 20 minutes of inactivity."
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

    // User activity listeners
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

    // 5. Timer Tick Interval (Checks every 2 seconds)
    const interval = setInterval(() => {
      if (isSigningOutRef.current) return;
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      // Stage 2: 20-minute hard termination
      if (elapsed >= HARD_SIGNOUT_IDLE_MS) {
        void performHardSignout("timeout");
        return;
      }

      // Stage 1: 2-minute privacy blur mask
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
  }, [performHardSignout, resumeSession]);

  return (
    <SessionSecurityContext.Provider value={{ isPrivacyShieldActive, resumeSession }}>
      {children}

      {/* Stage 1: 2-Minute Visual Privacy Mask (Idle Shield) */}
      {isPrivacyShieldActive && (
        <div
          onClick={resumeSession}
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
              resumeSession();
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
              Privacy Shield Active
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
              Dashboard Paused for Privacy
            </h2>

            <p
              style={{
                fontSize: "13px",
                lineHeight: "1.5",
                color: "#94a3b8",
                margin: "0 0 24px",
              }}
            >
              Sensitive company and school data has been shielded from unattended viewing.
              Move your mouse, tap the screen, or press any key to resume your session.
            </p>

            <button
              type="button"
              onClick={resumeSession}
              style={{
                width: "100%",
                padding: "11px 20px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "#10b981",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              Resume Session
            </button>
          </div>
        </div>
      )}
    </SessionSecurityContext.Provider>
  );
}
