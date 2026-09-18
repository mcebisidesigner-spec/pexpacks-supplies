"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";

export interface AdminConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmPhrase?: string; // If provided, user must type this exact phrase to enable the confirm button
  isDestructive?: boolean;
  isLoading?: boolean;
}

/**
 * Standard destructive confirmation modal meeting Master Prompt Section 19 requirements:
 * - Clear explanation of consequences
 * - Prominent warning / destructive theme
 * - Optional confirmation phrase match required for high-risk deletions
 * - Async execution handling with spinner & disabled state
 */
export function AdminConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmPhrase,
  isDestructive = true,
  isLoading = false,
}: AdminConfirmDialogProps) {
  const [typedPhrase, setTypedPhrase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset phrase when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTypedPhrase("");
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading && !isSubmitting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, isSubmitting, onClose]);

  if (!isOpen) return null;

  const phraseMatches =
    !confirmPhrase ||
    typedPhrase.trim().toLowerCase() === confirmPhrase.trim().toLowerCase();

  const handleConfirm = async () => {
    if (!phraseMatches || isLoading || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Confirmation action failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isLoading || isSubmitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        className={cn(
          "w-full max-w-md rounded-2xl bg-[var(--db-surface,#0c1322)] border p-6 shadow-2xl transition-all",
          isDestructive
            ? "border-rose-900/50 shadow-rose-950/20"
            : "border-[var(--db-border,#1e293b)]",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                isDestructive
                  ? "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                  : "bg-amber-950/60 text-amber-400 border border-amber-800/40",
              )}
            >
              {isDestructive ? (
                <Trash2 size={20} aria-hidden="true" />
              ) : (
                <AlertTriangle size={20} aria-hidden="true" />
              )}
            </div>
            <div>
              <h2
                id="confirm-dialog-title"
                className="text-base sm:text-lg font-bold text-[var(--db-text-primary,#f8fafc)] tracking-tight m-0"
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-1 rounded-lg text-[var(--db-text-subtle,#64748b)] hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Description */}
        <p
          id="confirm-dialog-desc"
          className="text-xs sm:text-sm text-[var(--db-text-muted,#94a3b8)] leading-relaxed m-0 mb-5"
        >
          {description}
        </p>

        {/* Confirmation phrase input for high-impact actions */}
        {confirmPhrase && (
          <div className="p-3 mb-5 rounded-lg bg-[var(--db-surface-inner,#090e17)] border border-[var(--db-border,#1e293b)] flex flex-col gap-2">
            <label className="text-xs text-[var(--db-text-secondary,#94a3b8)] font-medium">
              To proceed, please type{" "}
              <strong className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">
                {confirmPhrase}
              </strong>{" "}
              below:
            </label>
            <input
              type="text"
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              disabled={busy}
              placeholder={`Type "${confirmPhrase}"`}
              className="w-full h-9 px-3 text-xs font-mono rounded bg-[var(--db-surface,#0c1322)] border border-[var(--db-border,#1e293b)] text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
              autoFocus
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <AdminButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={busy}
          >
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant={isDestructive ? "danger" : "primary"}
            size="sm"
            onClick={handleConfirm}
            disabled={!phraseMatches || busy}
            loading={busy}
          >
            {confirmLabel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
