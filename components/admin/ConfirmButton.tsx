"use client";

import { useFormStatus } from "react-dom";

interface ConfirmButtonProps {
  label: string;
  confirmText: string;
  busyLabel?: string;
  className?: string;
  title?: string;
}

export function ConfirmButton({
  label,
  confirmText,
  busyLabel = "Saving…",
  className,
  title,
}: ConfirmButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      title={title}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {pending ? busyLabel : label}
    </button>
  );
}
