/**
 * Pexpacks Production Observability — Structured Logger
 *
 * Emits structured JSON logs with automatic credential and PII sanitization.
 * Seamlessly integrates with Sentry for warning and error telemetry.
 */

import * as Sentry from "@sentry/nextjs";
import { sanitizePayload } from "./redaction";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  environment: string;
  message: string;
  operation?: string;
  correlationId?: string;
  durationMs?: number;
  context?: unknown;
  error?: unknown;
}

const ENVIRONMENT =
  process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
const SERVICE_NAME = "pexpacks-supplies";

function emitLog(entry: LogEntry): void {
  const serialized = JSON.stringify(entry);
  switch (entry.level) {
    case "error":
      console.error(serialized);
      break;
    case "warn":
      console.warn(serialized);
      break;
    case "debug":
      console.debug(serialized);
      break;
    case "info":
    default:
      console.log(serialized);
      break;
  }
}

export const logger = {
  debug(
    message: string,
    meta?: {
      operation?: string;
      correlationId?: string;
      context?: Record<string, unknown>;
    },
  ): void {
    if (ENVIRONMENT === "production" && process.env.LOG_LEVEL !== "debug") {
      return;
    }
    const sanitized = meta?.context ? sanitizePayload(meta.context) : undefined;
    emitLog({
      timestamp: new Date().toISOString(),
      level: "debug",
      service: SERVICE_NAME,
      environment: ENVIRONMENT,
      message,
      operation: meta?.operation,
      correlationId: meta?.correlationId,
      context: sanitized,
    });
  },

  info(
    message: string,
    meta?: {
      operation?: string;
      correlationId?: string;
      durationMs?: number;
      context?: Record<string, unknown>;
    },
  ): void {
    const sanitized = meta?.context ? sanitizePayload(meta.context) : undefined;
    emitLog({
      timestamp: new Date().toISOString(),
      level: "info",
      service: SERVICE_NAME,
      environment: ENVIRONMENT,
      message,
      operation: meta?.operation,
      correlationId: meta?.correlationId,
      durationMs: meta?.durationMs,
      context: sanitized,
    });
  },

  warn(
    message: string,
    meta?: {
      operation?: string;
      correlationId?: string;
      context?: Record<string, unknown>;
    },
  ): void {
    const sanitized = meta?.context ? sanitizePayload(meta.context) : undefined;
    emitLog({
      timestamp: new Date().toISOString(),
      level: "warn",
      service: SERVICE_NAME,
      environment: ENVIRONMENT,
      message,
      operation: meta?.operation,
      correlationId: meta?.correlationId,
      context: sanitized,
    });

    try {
      Sentry.withScope((scope) => {
        if (meta?.operation) scope.setTag("operation", meta.operation);
        if (meta?.correlationId) scope.setTag("correlation_id", meta.correlationId);
        scope.setLevel("warning");
        if (sanitized && typeof sanitized === "object") {
          scope.setContext("meta", sanitized as Record<string, unknown>);
        }
        Sentry.captureMessage(message);
      });
    } catch {
      // Sentry fallback silently ignores offline / non-initialized states
    }
  },

  error(
    message: string,
    err?: unknown,
    meta?: {
      operation?: string;
      correlationId?: string;
      durationMs?: number;
      context?: Record<string, unknown>;
    },
  ): void {
    const sanitizedContext = meta?.context ? sanitizePayload(meta.context) : undefined;
    const sanitizedErr = err ? sanitizePayload(err) : undefined;

    emitLog({
      timestamp: new Date().toISOString(),
      level: "error",
      service: SERVICE_NAME,
      environment: ENVIRONMENT,
      message,
      operation: meta?.operation,
      correlationId: meta?.correlationId,
      durationMs: meta?.durationMs,
      context: sanitizedContext,
      error: sanitizedErr,
    });

    try {
      Sentry.withScope((scope) => {
        if (meta?.operation) scope.setTag("operation", meta.operation);
        if (meta?.correlationId) scope.setTag("correlation_id", meta.correlationId);
        if (meta?.durationMs) scope.setExtra("duration_ms", meta.durationMs);
        scope.setLevel("error");
        if (sanitizedContext && typeof sanitizedContext === "object") {
          scope.setContext("meta", sanitizedContext as Record<string, unknown>);
        }
        if (err instanceof Error) {
          Sentry.captureException(err);
        } else if (err) {
          Sentry.captureMessage(`${message}: ${JSON.stringify(sanitizedErr)}`);
        } else {
          Sentry.captureMessage(message);
        }
      });
    } catch {
      // Sentry fallback
    }
  },
};
