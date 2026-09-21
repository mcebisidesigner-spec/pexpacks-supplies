"use client";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import type { PexpacksNotificationTone } from "@/lib/content/pexpacks";

type NotificationInput = {
  tone: PexpacksNotificationTone;
  title: string;
  message: string;
  duration?: number;
};

type Notification = NotificationInput & { id: string; closing?: boolean };

type NotificationContextValue = {
  notify: (notification: NotificationInput) => void;
  dismiss: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);
const DEFAULT_DURATION = 10000;
const EXIT_DURATION = 180;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, closing: true } : notification,
      ),
    );
    setTimeout(() => {
      setNotifications((current) => current.filter((notification) => notification.id !== id));
    }, EXIT_DURATION);
  }, []);

  const notify = useCallback(
    (input: NotificationInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setNotifications((current) => {
        const duplicate = current.some(
          (notification) =>
            notification.title === input.title && notification.message === input.message,
        );
        if (duplicate) return current;
        return [...current.slice(-2), { ...input, id }];
      });
      const timer = setTimeout(() => dismiss(id), input.duration ?? DEFAULT_DURATION);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const value = useMemo(() => ({ notify, dismiss }), [dismiss, notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 top-4 z-[10000] flex flex-col items-stretch gap-3 sm:inset-0 sm:items-center sm:justify-center sm:p-6"
        aria-label="Notifications"
      >
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onDismiss={() => dismiss(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }
  return context;
}

function NotificationCard({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  const isError = notification.tone === "error";
  const Icon =
    notification.tone === "success"
      ? CheckCircle2
      : notification.tone === "warning"
        ? TriangleAlert
        : isError
          ? AlertCircle
          : Info;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-2xl border bg-white p-4 shadow-[0_18px_44px_rgba(26,42,64,0.18)] transition-all duration-200 motion-reduce:transition-none",
        notification.closing
          ? "translate-y-[-6px] opacity-0"
          : "translate-y-0 opacity-100",
        notification.tone === "success" && "border-emerald-200/80",
        notification.tone === "info" && "border-sky-200/80",
        notification.tone === "warning" && "border-amber-200/80",
        notification.tone === "error" && "border-red-200/80",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
          notification.tone === "success" && "bg-emerald-50 text-emerald-700",
          notification.tone === "info" && "bg-sky-50 text-sky-700",
          notification.tone === "warning" && "bg-amber-50 text-amber-700",
          notification.tone === "error" && "bg-red-50 text-red-700",
        )}
      >
        <Icon size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold leading-tight text-pex-navy">
          {notification.title}
        </p>
        <p className="m-0 mt-1 text-xs leading-relaxed text-slate-600">
          {notification.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="grid size-7 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-pex-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pex-keppel"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
