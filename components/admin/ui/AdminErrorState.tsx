import React, { ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";

export interface AdminErrorStateProps {
  title?: string;
  message?: string;
  details?: string | Error;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
}

/**
 * Standard error state block for admin data queries, form failures, and API errors.
 */
export function AdminErrorState({
  title = "Failed to load data",
  message = "An error occurred while fetching information. Please try again or contact support.",
  details,
  onRetry,
  action,
  className,
}: AdminErrorStateProps) {
  const detailText = details
    ? typeof details === "string"
      ? details
      : details.message || String(details)
    : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-xl",
        "bg-rose-950/20 border border-rose-900/40 text-rose-200 shadow-sm",
        className,
      )}
      role="alert"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-900/30 border border-rose-700/50 flex items-center justify-center text-rose-400 mb-4 shrink-0 shadow-inner">
        <AlertTriangle size={24} aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-rose-100 tracking-tight m-0 mb-1.5">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-rose-300/80 max-w-md m-0 mb-4 leading-relaxed">
        {message}
      </p>

      {detailText && (
        <pre className="text-[11px] font-mono p-3 rounded-lg bg-black/40 border border-rose-950 text-rose-300/70 max-w-lg w-full overflow-x-auto text-left mb-6 whitespace-pre-wrap break-all">
          {detailText}
        </pre>
      )}

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {onRetry && (
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={onRetry}
            icon={<RefreshCw size={14} />}
          >
            Try Again
          </AdminButton>
        )}
        {action}
      </div>
    </div>
  );
}
