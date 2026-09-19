/**
 * Pexpacks Production Observability — Telemetry & Timing Helper
 *
 * Provides execution latency measurement, correlation tracking,
 * and automated failure reporting for critical server actions and queries.
 */

import { logger } from "./logger";

export interface TelemetryOptions {
  operation: string;
  correlationId?: string;
  context?: Record<string, unknown>;
}

function generateCorrelationId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `corr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Wraps an asynchronous operation with performance timing and structured telemetry.
 */
export async function withTelemetry<T>(
  options: TelemetryOptions,
  action: (correlationId: string) => Promise<T>,
): Promise<T> {
  const correlationId = options.correlationId || generateCorrelationId();
  const startTime = performance.now();

  logger.debug(`[Telemetry] Started: ${options.operation}`, {
    operation: options.operation,
    correlationId,
    context: options.context,
  });

  try {
    const result = await action(correlationId);
    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

    logger.info(`[Telemetry] Completed: ${options.operation}`, {
      operation: options.operation,
      correlationId,
      durationMs,
      context: options.context,
    });

    return result;
  } catch (err) {
    const durationMs = Math.round((performance.now() - startTime) * 100) / 100;

    logger.error(`[Telemetry] Failed: ${options.operation}`, err, {
      operation: options.operation,
      correlationId,
      durationMs,
      context: options.context,
    });

    throw err;
  }
}
