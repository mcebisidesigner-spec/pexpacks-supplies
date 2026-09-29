"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DialogVariant =
  | "danger"
  | "warning"
  | "primary"
  | "info"
  | "success";

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

export interface AlertDialogOptions {
  title?: string;
  message: string;
  buttonLabel?: string;
  variant?: DialogVariant;
}

interface DialogState {
  isOpen: boolean;
  type: "confirm" | "alert";
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: DialogVariant;
  resolve: (value: boolean) => void;
}

interface AdminDialogContextValue {
  confirm: (options: ConfirmDialogOptions | string) => Promise<boolean>;
  alert: (options: AlertDialogOptions | string) => Promise<void>;
}

const AdminDialogContext = createContext<AdminDialogContextValue | null>(null);

export function AdminDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions | string) => {
    return new Promise<boolean>((resolve) => {
      const opts: ConfirmDialogOptions =
        typeof options === "string" ? { message: options } : options;

      setDialog({
        isOpen: true,
        type: "confirm",
        title: opts.title || "Confirm Action",
        message: opts.message,
        confirmLabel: opts.confirmLabel || "Confirm",
        cancelLabel: opts.cancelLabel || "Cancel",
        variant: opts.variant || "danger",
        resolve,
      });
    });
  }, []);

  const alert = useCallback((options: AlertDialogOptions | string) => {
    return new Promise<void>((resolve) => {
      const opts: AlertDialogOptions =
        typeof options === "string" ? { message: options } : options;

      setDialog({
        isOpen: true,
        type: "alert",
        title: opts.title || "Notice",
        message: opts.message,
        confirmLabel: opts.buttonLabel || "Understood",
        cancelLabel: "",
        variant: opts.variant || "warning",
        resolve: () => resolve(),
      });
    });
  }, []);

  // Gracefully intercept any legacy window.alert calls in /admin so the browser popup is never displayed
  useEffect(() => {
    if (typeof window === "undefined") return;
    const nativeAlert = window.alert;
    window.alert = (msg?: unknown) => {
      void alert({
        title: "Back-Office Notice",
        message: String(msg ?? ""),
        variant: "warning",
        buttonLabel: "Understood",
      });
    };
    return () => {
      window.alert = nativeAlert;
    };
  }, [alert]);

  const handleClose = useCallback(
    (confirmed: boolean) => {
      if (!dialog) return;
      const resolver = dialog.resolve;
      setDialog(null);
      resolver(confirmed);
    },
    [dialog],
  );

  useEffect(() => {
    if (!dialog?.isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog, handleClose]);

  useEffect(() => {
    if (dialog?.isOpen) {
      const timer = setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [dialog?.isOpen]);

  const renderIcon = (variant: DialogVariant) => {
    switch (variant) {
      case "danger":
        return <Trash2 className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5" />;
      case "info":
      case "primary":
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <AdminDialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog?.isOpen && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-[#070b12]/85 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-dialog-title"
          aria-describedby="admin-dialog-message"
          onClick={() => handleClose(false)}
        >
          <div
            className={cn(
              "relative flex flex-col w-full max-w-[440px] overflow-hidden rounded-2xl border bg-[#0c1424] shadow-2xl transition-all animate-in zoom-in-95 duration-200",
              dialog.variant === "warning" &&
                "border-amber-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(245,158,11,0.12)]",
              dialog.variant === "danger" &&
                "border-red-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(239,68,68,0.12)]",
              dialog.variant === "success" &&
                "border-emerald-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(16,185,129,0.12)]",
              (dialog.variant === "info" || dialog.variant === "primary") &&
                "border-sky-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(14,165,233,0.12)]",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Gradient Bar */}
            <div
              className={cn(
                "h-1 w-full",
                dialog.variant === "warning" &&
                  "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600",
                dialog.variant === "danger" &&
                  "bg-gradient-to-r from-red-500 via-rose-500 to-red-600",
                dialog.variant === "success" &&
                  "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600",
                (dialog.variant === "info" || dialog.variant === "primary") &&
                  "bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600",
              )}
            />

            {/* Header Badge & Close Button */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 font-mono">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full animate-pulse",
                    dialog.variant === "warning" &&
                      "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
                    dialog.variant === "danger" &&
                      "bg-red-400 shadow-[0_0_8px_#ef4444]",
                    dialog.variant === "success" &&
                      "bg-emerald-400 shadow-[0_0_8px_#10b981]",
                    (dialog.variant === "info" || dialog.variant === "primary") &&
                      "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
                  )}
                />
                PEXPACKS BACK-OFFICE //{" "}
                {dialog.type === "confirm" ? "CONFIRMATION" : "NOTICE"}
              </span>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={() => handleClose(false)}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content Area with Semantic Icon */}
            <div className="flex items-start gap-4 px-6 py-3">
              <div
                className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border shadow-sm",
                  dialog.variant === "warning" &&
                    "border-amber-500/30 bg-amber-500/10 text-amber-400",
                  dialog.variant === "danger" &&
                    "border-red-500/30 bg-red-500/10 text-red-400",
                  dialog.variant === "success" &&
                    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                  (dialog.variant === "info" || dialog.variant === "primary") &&
                    "border-sky-500/30 bg-sky-500/10 text-sky-400",
                )}
              >
                {renderIcon(dialog.variant)}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  id="admin-dialog-title"
                  className="text-base sm:text-lg font-bold text-white tracking-tight"
                >
                  {dialog.title}
                </h3>
                <p
                  id="admin-dialog-message"
                  className="mt-2 text-sm text-slate-300 leading-relaxed break-words"
                >
                  {dialog.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 px-6 pt-3 pb-6 border-t border-slate-800/80 mt-2">
              {dialog.type === "confirm" && (
                <button
                  type="button"
                  className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 transition-colors cursor-pointer"
                  onClick={() => handleClose(false)}
                >
                  {dialog.cancelLabel || "Cancel"}
                </button>
              )}
              <button
                ref={confirmBtnRef}
                type="button"
                className={cn(
                  "w-full sm:w-auto h-10 px-5 rounded-xl text-xs font-bold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer",
                  dialog.variant === "warning" &&
                    "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25",
                  dialog.variant === "danger" &&
                    "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-600/25",
                  dialog.variant === "success" &&
                    "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-600/25",
                  (dialog.variant === "info" || dialog.variant === "primary") &&
                    "bg-[#0876ad] hover:bg-[#066594] shadow-cyan-900/30",
                )}
                onClick={() => handleClose(true)}
              >
                {dialog.confirmLabel ||
                  (dialog.type === "confirm" ? "Confirm" : "Understood")}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminDialogContext.Provider>
  );
}

export function useAdminDialog() {
  const context = useContext(AdminDialogContext);
  if (!context) {
    throw new Error(
      "useAdminDialog must be used within an AdminDialogProvider",
    );
  }
  return context;
}
