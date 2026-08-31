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
  AlertCircle,
} from "lucide-react";
import styles from "./AdminDialog.module.css";

export type DialogVariant = "danger" | "warning" | "primary" | "info" | "success";

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
        return styles.iconSlotDanger;
      case "warning":
        return styles.iconSlotWarning;
      case "success":
        return styles.iconSlotSuccess;
      case "info":
      case "primary":
      default:
        return styles.iconSlotInfo;
    }
  };

  const getBtnConfirmClass = (variant: DialogVariant) => {
    switch (variant) {
      case "danger":
        return styles.btnDanger;
      case "warning":
        return styles.btnWarning;
      case "success":
      case "info":
      case "primary":
      default:
        return styles.btnPrimary;
    }
  };

  return (
    <AdminDialogContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog?.isOpen && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-dialog-title"
          aria-describedby="admin-dialog-message"
          onClick={() => handleClose(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.brandRow}>
              <span className={styles.brandBadge}>
                <span
                  className={
                    dialog.variant === "danger"
                      ? styles.brandDotDanger
                      : dialog.variant === "warning"
                        ? styles.brandDotWarning
                        : styles.brandDot
                  }
                />
                PEXPACKS // {dialog.type === "confirm" ? "CONFIRM ACTION" : "NOTICE"}
              </span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => handleClose(false)}
                aria-label="Close dialog"
              >
                <X size={15} />
              </button>
            </div>

            <div className={styles.contentRow}>
              <div className={`${styles.iconSlot} ${getIconClass(dialog.variant)}`}>
                {renderIcon(dialog.variant)}
              </div>
              <div className={styles.textBlock}>
                <h3 id="admin-dialog-title" className={styles.dialogTitle}>
                  {dialog.title}
                </h3>
                <p id="admin-dialog-message" className={styles.dialogMessage}>
                  {dialog.message}
                </p>
              </div>
            </div>

            <div className={styles.buttonRow}>
              {dialog.type === "confirm" && (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnCancel}`}
                  onClick={() => handleClose(false)}
                >
                  {dialog.cancelLabel}
                </button>
              )}
              <button
                ref={confirmBtnRef}
                type="button"
                className={`${styles.btn} ${getBtnConfirmClass(dialog.variant)}`}
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
    throw new Error("useAdminDialog must be used within an AdminDialogProvider");
  }
  return context;
}
