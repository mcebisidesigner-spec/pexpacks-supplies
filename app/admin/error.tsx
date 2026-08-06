"use client";

import { useEffect } from "react";
import adminStyles from "./admin.module.css";

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
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Something went wrong</h1>
        <p className={adminStyles.subtitle}>
          The dashboard hit an unexpected error. Your data is safe — try again.
        </p>
      </div>
      <div className={adminStyles.stack}>
        <div className={adminStyles.stackRow}>
          <button
            type="button"
            className={adminStyles.primaryButton}
            onClick={() => reset()}
          >
            Try again
          </button>
          <a href="/admin" className={adminStyles.secondaryButton}>
            Go to dashboard home
          </a>
        </div>
        {error.digest ? (
          <p className={adminStyles.mutedText}>Error reference: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
