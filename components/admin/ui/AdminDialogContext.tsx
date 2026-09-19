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
        confirmLabel: opts.buttonLabel || "Dismiss",
        cancelLabel: "",
        variant: opts.variant || "info",
        resolve: () => resolve(),
      });
    });
  }, []);

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
      // Focus confirm button for quick keyboard navigation
      const timer = setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [dialog?.isOpen]);

  const renderIcon = (variant: DialogVariant) => {
    switch (variant) {
      case "danger":
        return <Trash2 size={22} />;
      case "warning":
        return <AlertTriangle size={22} />;
      case "success":
        return <CheckCircle2 size={22} />;
      case "info":
      case "primary":
      default:
        return <Info size={22} />;
    }
  };

  const getIconClass = (variant: DialogVariant) => {
    switch (variant) {
      case "danger":
        return "border border-[var(--db-danger-border,rgba(239,68,68,0.28))] bg-[var(--db-danger-subtle,rgba(239,68,68,0.12))] text-[var(--db-danger-text,#f87171)]";
      case "warning":
        return "border border-[var(--db-warning-border,rgba(245,158,11,0.28))] bg-[var(--db-warning-subtle,rgba(245,158,11,0.12))] text-[var(--db-warning-text,#fbbf24)]";
      case "success":
        return "border border-[var(--db-success-border,rgba(16,185,129,0.28))] bg-[var(--db-success-subtle,rgba(16,185,129,0.12))] text-[var(--db-success-text,#34d399)]";
      case "info":
      case "primary":
      default:
        return "border border-[var(--db-info-border,rgba(14,165,233,0.28))] bg-[var(--db-info-subtle,rgba(14,165,233,0.12))] text-[var(--db-info-text,#38bdf8)]";
    }
  };

  const getBtnConfirmClass = (variant: DialogVariant) => {
    switch (variant) {
      case "danger":
        return "border border-red-500/40 bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.35)] hover:bg-red-500 hover:shadow-[0_4px_16px_rgba(239,68,68,0.45)]";
      case "warning":
        return "border border-amber-500/40 bg-amber-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.35)] hover:bg-amber-600 hover:shadow-[0_4px_16px_rgba(245,158,11,0.45)]";
      case "success":
      case "info":
      case "primary":
      default:
        return "border border-emerald-500/40 bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)] hover:bg-emerald-600 hover:shadow-[0_4px_16px_rgba(16,185,129,0.45)]";
    }
  };

  return (
    <AdminDialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog?.isOpen && (
        <div
          className="fixed inset-0 z-[999999] grid p-3.5 sm:p-5 place-items-center bg-[#040810]/85 backdrop-blur-md animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-dialog-title"
          aria-describedby="admin-dialog-message"
          onClick={() => handleClose(false)}
        >
          <div
            className="relative flex flex-col gap-4.5 w-full max-w-[460px] p-4.5 sm:px-6 sm:py-5 border border-[var(--db-border,#1e293b)] rounded-[var(--db-radius-card,14px)] bg-[var(--db-surface,#0c1322)] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.05),0_0_30px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--db-border-muted,rgba(30,41,59,0.65))]">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider uppercase text-[var(--db-text-muted,#94a3b8)]">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    dialog.variant === "danger"
                      ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                      : dialog.variant === "warning"
                        ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]"
                        : "bg-emerald-500 shadow-[0_0_8px_#10b981]",
                  )}
                />
                PEXPACKS //{" "}
                {dialog.type === "confirm" ? "CONFIRM ACTION" : "NOTICE"}
              </span>
              <button
                type="button"
                className="grid w-7 h-7 place-items-center border border-[var(--db-border,#1e293b)] rounded-md bg-[var(--db-surface-inner,#090e17)] text-[var(--db-text-muted,#94a3b8)] cursor-pointer transition-colors hover:bg-white/8 hover:text-white hover:border-[var(--db-border-strong,#334155)]"
                onClick={() => handleClose(false)}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "grid w-11 h-11 shrink-0 place-items-center rounded-xl",
                  getIconClass(dialog.variant),
                )}
              >
                {renderIcon(dialog.variant)}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  id="admin-dialog-title"
                  className="m-0 text-base font-bold text-[var(--db-text-primary,#f8fafc)] leading-snug tracking-tight"
                >
                  {dialog.title}
                </h3>
                <p
                  id="admin-dialog-message"
                  className="mt-2 text-[13.5px] text-[var(--db-text-muted,#94a3b8)] leading-relaxed break-words"
                >
                  {dialog.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-2.5 pt-1.5">
              {dialog.type === "confirm" && (
                <button
                  type="button"
                  className="w-full sm:w-auto inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg font-inherit text-[13px] font-semibold tracking-wide cursor-pointer transition-colors border border-[var(--db-border,#1e293b)] bg-[var(--db-surface-inner,#090e17)] text-[var(--db-text-secondary,#e2e8f0)] hover:bg-white/6 hover:border-[var(--db-border-strong,#334155)] hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2"
                  onClick={() => handleClose(false)}
                >
                  {dialog.cancelLabel}
                </button>
              )}
              <button
                ref={confirmBtnRef}
                type="button"
                className={cn(
                  "w-full sm:w-auto inline-flex items-center justify-center min-h-[38px] px-4 rounded-lg font-inherit text-[13px] font-semibold tracking-wide cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2",
                  getBtnConfirmClass(dialog.variant),
                )}
                onClick={() => handleClose(true)}
              >
                {dialog.confirmLabel}
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
