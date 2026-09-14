"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en-ZA">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, Helvetica, sans-serif",
          background: "#f9fafb",
          color: "#172326",
        }}
      >
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ marginBottom: 16 }}>
            The application hit an unexpected error. Please try again or return
            home.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: "#1a7a77",
              color: "#ffffff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "999px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}