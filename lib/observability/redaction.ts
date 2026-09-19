/**
 * Pexpacks Production Observability — Credential & PII Redaction
 *
 * Ensures passwords, bearer tokens, API keys, cookies, payment details,
 * and sensitive South African PII (ID numbers, phone numbers, emails)
 * are thoroughly scrubbed before ingestion into logs, Sentry, or analytics.
 */

const SENSITIVE_KEY_REGEX =
  /^(password|passwd|secret|token|accessToken|refreshToken|bearer|authorization|cookie|session|cookieHeader|apiKey|serviceKey|cvv|cvc|cardnumber|creditCard|pin|idNumber|saId)$/i;

const JWT_REGEX = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g;
const BEARER_REGEX = /Bearer\s+[a-zA-Z0-9_\-\.]{15,}/gi;
const SA_ID_REGEX = /\b\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{7}\b/g;
const CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const SA_PHONE_REGEX = /(?:\+27|0)[6-8][0-9]{8}\b/g;

export const REDACTED_MARKER = "[REDACTED]";

/**
 * Scrubs string values of known PII / secret patterns.
 */
export function sanitizeString(val: string): string {
  if (!val || typeof val !== "string") return val;

  let out = val;

  // Mask Bearer tokens
  out = out.replace(BEARER_REGEX, "Bearer [REDACTED]");

  // Mask raw JWTs
  out = out.replace(JWT_REGEX, "[REDACTED_JWT]");

  // Mask Credit Cards (keep last 4 digits)
  out = out.replace(CARD_REGEX, (match) => {
    const clean = match.replace(/[-\s]/g, "");
    if (clean.length === 16) {
      return `****-****-****-${clean.slice(-4)}`;
    }
    return REDACTED_MARKER;
  });

  // Mask South African ID Numbers (13 digits: YYMMDDSSSSCAZ)
  out = out.replace(SA_ID_REGEX, (match) => {
    return `${match.slice(0, 6)}******${match.slice(-1)}`;
  });

  // Mask Emails
  out = out.replace(EMAIL_REGEX, (match) => {
    const [local, domain] = match.split("@");
    if (!domain) return REDACTED_MARKER;
    const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : "*";
    return `${maskedLocal}@${domain}`;
  });

  // Mask South African Mobile Numbers
  out = out.replace(SA_PHONE_REGEX, (match) => {
    return `${match.slice(0, 3)} *** **${match.slice(-2)}`;
  });

  return out;
}

/**
 * Recursively scrubs objects, arrays, and error instances of sensitive data.
 * Safe against cyclic references and caps max depth.
 */
export function sanitizePayload<T>(
  data: T,
  depth = 0,
  seen = new WeakSet<object>(),
): unknown {
  if (depth > 6) return "[DEPTH_LIMIT_EXCEEDED]";
  if (data === null || data === undefined) return data;

  // Handle primitives
  if (typeof data === "string") {
    return sanitizeString(data);
  }
  if (typeof data !== "object") {
    return data;
  }

  // Handle circular references
  if (seen.has(data as object)) {
    return "[CIRCULAR_REFERENCE]";
  }
  seen.add(data as object);

  // Handle Error objects
  if (data instanceof Error) {
    const errorDetails: Record<string, unknown> = {
      name: data.name,
      message: sanitizeString(data.message),
      stack: data.stack ? sanitizeString(data.stack) : undefined,
    };
    for (const key of Object.keys(data)) {
      if (key !== "name" && key !== "message" && key !== "stack") {
        errorDetails[key] = sanitizePayload(
          (data as unknown as Record<string, unknown>)[key],
          depth + 1,
          seen,
        );
      }
    }
    return errorDetails;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizePayload(item, depth + 1, seen));
  }

  // Handle plain objects / records
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      result[key] = REDACTED_MARKER;
    } else {
      result[key] = sanitizePayload(value, depth + 1, seen);
    }
  }

  return result;
}
