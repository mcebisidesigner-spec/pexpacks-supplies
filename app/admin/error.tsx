"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] error boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-12 px-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertTriangle size={28} />
          <h1 className="text-2xl font-bold text-slate-100">Something went wrong</h1>
        </div>
        <p className="text-sm text-slate-400">
          The dashboard hit an unexpected error. Your data is safe — try again.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
            Try again
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors no-underline"
          >
            <Home size={16} />
            Go to dashboard home
          </Link>
        </div>
        {error.digest ? (
          <p className="text-xs text-slate-500 font-mono">
            Error reference: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
