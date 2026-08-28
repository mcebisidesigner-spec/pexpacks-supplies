"use client";

import React, { useEffect, useRef } from "react";
import { AlertCircle, RotateCcw, Save } from "lucide-react";
import clsx from "clsx";
import styles from "./StickyFormBar.module.css";
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
      className={clsx(styles.bar, isDirty && styles.barVisible, className)}
      role="status"
      aria-live="polite"
    >
      <span className={styles.message}>
        <AlertCircle size={16} aria-hidden="true" />
        <span>{label}</span>
      </span>
      <span className={styles.actions}>
        <AdminButton variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
          <RotateCcw size={14} />
          Discard
        </AdminButton>
        <AdminButton variant="primary" size="sm" onClick={onSave} loading={saving}>
          <Save size={14} />
          Save Changes
        </AdminButton>
      </span>
      <span className={styles.hint} aria-hidden="true">
        <span className={styles.kbd}>⌘S</span>
      </span>
    </div>
  );
}
