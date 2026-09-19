import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AdminPageProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Standard container component for all `/admin/*` views.
 * Enforces unified horizontal padding, max-width constraints, and vertical spacing.
 */
export function AdminPage({
  children,
  className,
  fullWidth = false,
}: AdminPageProps) {
  return (
    <div
      className={cn(
        "w-full text-slate-100 flex flex-col gap-6",
        fullWidth
          ? "max-w-none px-4 sm:px-6 lg:px-8 py-5 sm:py-7"
          : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7",
        className,
      )}
    >
      {children}
    </div>
  );
}
