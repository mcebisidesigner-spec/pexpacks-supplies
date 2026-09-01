"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type DbNoticeType = "success" | "error" | "warning";

export interface DbNoticeProps {
  type: DbNoticeType;
  message: string;
  onClose?: () => void;
  className?: string;
}

/**
 * Standard DB Message Banner Component
 * Strictly uses .db-message-banner CSS utilities from styles/db-tokens.css
 */
export function DbNotice({
  type,
  message,
  onClose,
  className = "",
}: DbNoticeProps) {
  const isPositive = type === "success";

  return (
    <div
      role="status"
      className={`db-message-banner ${
        isPositive ? "db-message-success" : "db-message-error"
      } ${className}`}
    >
      {isPositive ? (
        <CheckCircle2 size={18} className="db-message-icon-success" />
      ) : (
        <AlertCircle size={18} className="db-message-icon-error" />
      )}
      <span className="db-message-text">{message}</span>
      {onClose && (
        <button
          type="button"
          className="db-message-close"
          onClick={onClose}
          aria-label="Dismiss message"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

interface ToastItem {
  id: string;
  type: DbNoticeType;
  message: string;
}

interface DbNoticeContextValue {
  notify: (type: DbNoticeType, message: string, durationMs?: number) => void;
  notifySuccess: (message: string, durationMs?: number) => void;
  notifyError: (message: string, durationMs?: number) => void;
  notifyWarning: (message: string, durationMs?: number) => void;
}

const DbNoticeContext = createContext<DbNoticeContextValue | null>(null);

/**
 * Global DB Message Popup Provider
 * Mounts at the root of admin layout to display floating green/red popups
 * across all datatables, pages, and tabs.
 */
export function DbNoticeProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (type: DbNoticeType, message: string, durationMs: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast],
  );

  const notifySuccess = useCallback(
    (message: string, durationMs?: number) => {
      notify("success", message, durationMs);
    },
    [notify],
  );

  const notifyError = useCallback(
    (message: string, durationMs?: number) => {
      notify("error", message, durationMs);
    },
    [notify],
  );

  const notifyWarning = useCallback(
    (message: string, durationMs?: number) => {
      notify("warning", message, durationMs);
    },
    [notify],
  );

  // Auto-detect URL query params for automatic notifications on redirects
  useEffect(() => {
    const successMsg = searchParams?.get("success") || searchParams?.get("notice");
    const errorMsg = searchParams?.get("error");
    const warningMsg = searchParams?.get("warning");

    if (successMsg) {
      notifySuccess(successMsg);
    } else if (errorMsg) {
      notifyError(errorMsg);
    } else if (warningMsg) {
      notifyWarning(warningMsg);
    }

    if (successMsg || errorMsg || warningMsg) {
      // Clean query params without full page reload
      const newParams = new URLSearchParams(searchParams?.toString() ?? "");
      newParams.delete("success");
      newParams.delete("notice");
      newParams.delete("error");
      newParams.delete("warning");
      const qs = newParams.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, notifySuccess, notifyError, notifyWarning]);

  return (
    <DbNoticeContext.Provider
      value={{ notify, notifySuccess, notifyError, notifyWarning }}
    >
      {children}
      {toasts.length > 0 && (
        <div className="db-message-popup-host" role="region" aria-label="Notifications">
          {toasts.map((toast) => (
            <DbNotice
              key={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </DbNoticeContext.Provider>
  );
}

export function useDbNotice() {
  const ctx = useContext(DbNoticeContext);
  if (!ctx) {
    throw new Error("useDbNotice must be used within a DbNoticeProvider");
  }
  return ctx;
}
