"use client";

import { useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] grid p-3 sm:p-5 place-items-center bg-[rgba(2,6,23,0.82)] backdrop-blur-md animate-in fade-in duration-150 text-left"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      onClick={onCancel}
    >
      <div
        className="flex flex-col gap-4 w-full max-w-[440px] p-4 sm:p-5 rounded-lg border border-[var(--a-border-strong,rgba(30,41,59,0.6))] bg-[var(--a-surface,#0c1322)] shadow-[0_28px_72px_rgba(0,0,0,0.68)] animate-in fade-in slide-in-from-bottom-2 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--a-border,rgba(30,41,59,0.9))] text-[var(--a-text-3,#94a3b8)] text-[10px] font-extrabold uppercase tracking-wider">
          <span>
            <strong className="text-[var(--a-accent-strong,#059669)]">
              Pexpacks
            </strong>{" "}
            Confirmation
          </span>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close confirmation"
            className="grid w-[30px] h-[30px] place-items-center rounded-[7px] border border-[var(--a-border,rgba(30,41,59,0.9))] bg-[var(--a-surface-2,#090e17)] text-[var(--a-text-3,#94a3b8)] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-[15px] h-[15px]" aria-hidden="true" />
          </button>
        </div>

        <div className="flex min-w-0 items-start gap-3.5">
          <div
            className={cn(
              "grid w-[42px] h-[42px] shrink-0 place-items-center rounded-lg",
              variant === "danger"
                ? "border border-[var(--a-red,#f87171)] bg-[var(--a-red-subtle,rgba(248,113,113,0.1))] text-[var(--a-red,#f87171)]"
                : "border border-[var(--a-accent,#10b981)] bg-[var(--a-accent-subtle,rgba(16,185,129,0.14))] text-[var(--a-accent-strong,#059669)]"
            )}
          >
            {variant === "danger" ? (
              <Trash2 size={24} />
            ) : (
              <AlertTriangle size={24} />
            )}
          </div>
          <div className="min-w-0">
            <h2
              id="confirm-modal-title"
              className="m-0 text-[var(--a-text,#ffffff)] text-lg font-extrabold leading-snug break-words"
            >
              {title}
            </h2>
            <p
              id="confirm-modal-description"
              className="mt-1.5 m-0 text-[var(--a-text-2,#cbd5e1)] text-[13px] leading-relaxed break-words"
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-1 w-full [&>button]:w-full sm:[&>button]:w-auto">
          <button
            type="button"
            className="min-h-[44px] sm:min-h-[40px] px-4 rounded-[7px] border border-[var(--a-border-strong,rgba(30,41,59,0.6))] bg-[var(--a-surface-2,#090e17)] text-[var(--a-text-2,#cbd5e1)] text-xs font-extrabold cursor-pointer hover:text-white transition-colors"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(
              "min-h-[44px] sm:min-h-[40px] px-4 rounded-[7px] text-xs font-extrabold cursor-pointer transition-all hover:brightness-110",
              variant === "danger"
                ? "border border-[var(--a-red,#f87171)] bg-[var(--a-red,#f87171)] text-[#300505]"
                : "border border-[var(--a-accent,#10b981)] bg-[var(--a-accent,#10b981)] text-white"
            )}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
