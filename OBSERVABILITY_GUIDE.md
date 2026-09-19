# Pexpacks Observability, Diagnostics & Logging Guide

This document outlines the observability architecture, telemetry patterns, error boundaries, and credential-scrubbing guarantees implemented across the Pexpacks application.

---

## 1. Architecture Overview

Pexpacks uses a zero-leak observability stack combining:
1. **Sentry (@sentry/nextjs)** for edge, server, and client exception tracking.
2. **Structured JSON Logger** with RFC-compliant severity levels and contextual metadata.
3. **Automated Credential & PII Scrubbing** preventing secrets, Bearer tokens, cookies, payment cards, and South African PII from reaching log sinks or external vendors.
4. **Telemetry & Latency Profiling** wrapper (`withTelemetry`) measuring server action and database query durations.
5. **Next.js Error Boundaries** (`app/error.tsx`, `app/global-error.tsx`, `app/admin/error.tsx`).

---

## 2. PII & Credential Scrubbing Guarantees

All logging and telemetry functions automatically filter inputs through `sanitizePayload` before serialization.

| Sensitive Entity | Pattern Filtered | Redaction Output |
| :--- | :--- | :--- |
| **Passwords & Keys** | Keys matching `password`, `token`, `secret`, `apiKey`, `cvv`, `pin`, `cookie`, `authorization` | `[REDACTED]` |
| **Bearer Tokens** | `Bearer <token>` | `Bearer [REDACTED]` |
| **JSON Web Tokens** | `eyJ...` (3-part base64 encoded) | `[REDACTED_JWT]` |
| **Credit / Debit Cards** | 16-digit card patterns (spaces or dashes) | `****-****-****-1234` |
| **South African ID Numbers** | 13-digit valid YYMMDD sequence | `YYMMDD******C` |
| **Emails** | Standard RFC 5322 emails | `u***r@domain.com` |
| **South African Mobile** | `+27...` or `082...` patterns | `+27 *** **89` |

---

## 3. Structured Logging API

Import from `@/lib/observability`:

```ts
import { logger } from "@/lib/observability";

// 1. Informational logs with context and timing
logger.info("Order processed successfully", {
  operation: "checkout.order_placed",
  correlationId: "corr_98765",
  durationMs: 34.2,
  context: { orderId: "ord_123", schoolSlug: "camps-bay-high" },
});

// 2. Warnings (logged locally & sent to Sentry as warning)
logger.warn("Rate limit threshold approached", {
  operation: "auth.rate_limit",
  context: { ip: "192.168.1.1" },
});

// 3. Errors (logged locally & reported to Sentry with error stack & tags)
logger.error("Failed to commit payment", error, {
  operation: "payment.ozow_webhook",
  correlationId: "corr_98765",
  context: { paymentId: "pay_456" },
});
```

---

## 4. Telemetry & Latency Profiling (`withTelemetry`)

Wrap asynchronous operations or server actions to automatically trace execution duration, attach correlation IDs, and capture failures to Sentry:

```ts
import { withTelemetry } from "@/lib/observability";

export async function processPaymentAction(data: PaymentInput) {
  return withTelemetry(
    {
      operation: "payment.process",
      context: { orderId: data.orderId },
    },
    async (correlationId) => {
      // Your business logic here
      return await executePayment(data, correlationId);
    },
  );
}
```

---

## 5. Sentry Configuration & Hardening

Configured across all Next.js runtime tiers:
- **Server Tier**: `sentry.server.config.ts` (Node.js runtime)
- **Edge Tier**: `sentry.edge.config.ts` (Vercel Edge middleware & routes)
- **Client Tier**: `instrumentation-client.ts` (Browser hydration & transitions)

### Zero-PII Enforcement
Each configuration explicitly specifies:
- `sendDefaultPii: false`
- `beforeSend(event)` hook stripping:
  - `authorization` header
  - `cookie` header
  - `x-supabase-auth` header

---

## 6. Error Boundaries

| Boundary | Path | Target Scope | Action |
| :--- | :--- | :--- | :--- |
| **Root Error Boundary** | `app/error.tsx` | General application pages | Displays branded recovery hero & sends exception to Sentry |
| **Global Fallback** | `app/global-error.tsx` | Fatal root layout crashes | Pure HTML/inline styles, zero external CSS dependencies, reports to Sentry |
| **Admin Console Boundary** | `app/admin/error.tsx` | Protected admin views | Dark-theme styled recovery panel, displays error digest code, reports to Sentry |
