"use client";

import React, { useEffect, useRef } from "react";
import { AlertCircle, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "@/components/admin/ui/AdminButton";

export interface StickyFormBarProps {
  isDirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saving?: boolean;
  label?: string;
  className?: string;
}

export function StickyFormBar({
  isDirty,
  onSave,
  onDiscard,
  saving = false,
  label = "You have unsaved changes",
  className,
}: StickyFormBarProps) {
  const saveRef = useRef<() => void>(onSave);

  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!isDirty) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current?.();
      }
      if (e.key === "Escape") {
        onDiscard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, onDiscard]);

  return (
    <div
      className={cn(
        "fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 z-40 flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-start gap-3 p-3 sm:px-4 sm:py-3 bg-[#0c1322]/95 border border-[var(--db-border,#1e293b)] rounded-xl shadow-xl backdrop-blur-md opacity-0 translate-y-4 pointer-events-none transition-all duration-150",
        isDirty && "opacity-100 translate-y-0 pointer-events-auto",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--db-warning-text,#fbbf24)] whitespace-nowrap">
        <AlertCircle size={16} aria-hidden="true" />
        <span>{label}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <AdminButton
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          disabled={saving}
        >
          <RotateCcw size={14} />
          Discard
        </AdminButton>
        <AdminButton
          variant="primary"
          size="sm"
          onClick={onSave}
          loading={saving}
        >
          <Save size={14} />
          Save Changes
        </AdminButton>
      </span>
      <span className="hidden sm:inline-flex items-center gap-1" aria-hidden="true">
        <span className="px-1.5 py-0.5 bg-[var(--db-canvas,#050811)] border border-[var(--db-border-strong,#334155)] border-b-2 rounded text-[11px] font-bold text-[var(--db-text-muted,#94a3b8)] whitespace-nowrap font-mono">
          ⌘S
        </span>
      </span>
    </div>
  );
}
