"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ConfirmButtonProps {
  label: string;
  confirmText: string;
  busyLabel?: string;
  className?: string;
  title?: string;
  confirmLabel?: string;
}

export function ConfirmButton({
  label,
  confirmText,
  busyLabel = "Saving…",
  className,
  title,
  confirmLabel,
}: ConfirmButtonProps) {
  const { pending } = useFormStatus();
  const [modalOpen, setModalOpen] = useState(false);
  const [formEl, setFormEl] = useState<HTMLFormElement | null>(null);

  const isDeleteAction =
    label.toLowerCase().includes("delete") ||
    (Boolean(title) && String(title).toLowerCase().includes("delete"));

  const handleConfirm = () => {
    setModalOpen(false);
    if (formEl) {
      formEl.requestSubmit();
    }
  };

  const defaultTitle = isDeleteAction ? "Delete Permanently" : "Confirm Action";
  const defaultConfirmLabel = isDeleteAction ? (label.toLowerCase() === "delete" ? "Delete" : label) : "Confirm";

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={pending}
        title={title}
        onClick={(e) => {
          e.preventDefault();
          const form = e.currentTarget.closest("form");
          if (form) setFormEl(form);
          setModalOpen(true);
        }}
      >
        {pending ? busyLabel : label}
      </button>

      <ConfirmModal
        isOpen={modalOpen}
        title={title || defaultTitle}
        message={confirmText}
        confirmLabel={confirmLabel || defaultConfirmLabel}
        cancelLabel="Cancel"
        variant={isDeleteAction ? "danger" : "primary"}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
