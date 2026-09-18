import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sanitizeString,
  sanitizePayload,
  REDACTED_MARKER,
} from "@/lib/observability/redaction";
import { logger } from "@/lib/observability/logger";
import { withTelemetry } from "@/lib/observability/telemetry";

describe("Observability — Credential & PII Redaction", () => {
  it("scrubs Bearer tokens and raw JWTs from strings", () => {
    const bearerStr = "Authorization: Bearer mySecretToken1234567890abcdef";
    expect(sanitizeString(bearerStr)).toBe("Authorization: Bearer [REDACTED]");

    const jwtStr =
      "Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsK88 found";
    expect(sanitizeString(jwtStr)).toContain("[REDACTED_JWT]");
  });

  it("masks credit cards preserving only the last 4 digits", () => {
    const cardStr = "Payment card: 4111 2222 3333 4444 approved";
    expect(sanitizeString(cardStr)).toBe("Payment card: ****-****-****-4444 approved");

    const dashedCard = "Card 5500-1234-5678-9876";
    expect(sanitizeString(dashedCard)).toBe("Card ****-****-****-9876");
  });

  it("masks South African ID numbers", () => {
    const saIdStr = "Citizen ID: 9205125800084";
    const sanitized = sanitizeString(saIdStr);
    expect(sanitized).toBe("Citizen ID: 920512******4");
  });

  it("masks South African mobile numbers", () => {
    const phoneStr = "Contact: 0821234567 or +27821234567";
    const sanitized = sanitizeString(phoneStr);
    expect(sanitized).toContain("082 *** **67");
    expect(sanitized).toContain("+27 *** **67");
  });

  it("masks emails preserving domain and partial username", () => {
    const emailStr = "Admin: admin@pexpacks.co.za and john.doe@example.com";
    const sanitized = sanitizeString(emailStr);
    expect(sanitized).toContain("a***n@pexpacks.co.za");
    expect(sanitized).toContain("j***e@example.com");
  });

  it("sanitizes sensitive keys in nested objects and arrays", () => {
    const payload = {
      user: {
        id: "usr_123",
        email: "parent@school.co.za",
        password: "SuperSecretPassword123!",
        session: "sess_xyz987",
        roles: ["parent"],
      },
      headers: {
        authorization: "Bearer secret-token-1234567890",
        cookie: "sb-access-token=xyz",
      },
      cards: [
        {
          cardNumber: "4111222233334444",
          cvv: "123",
        },
      ],
    };

    const sanitized = sanitizePayload(payload) as Record<string, any>;
    expect(sanitized.user.password).toBe(REDACTED_MARKER);
    expect(sanitized.user.session).toBe(REDACTED_MARKER);
    expect(sanitized.headers.authorization).toBe(REDACTED_MARKER);
    expect(sanitized.headers.cookie).toBe(REDACTED_MARKER);
    expect(sanitized.cards[0].cardNumber).toBe(REDACTED_MARKER);
    expect(sanitized.cards[0].cvv).toBe(REDACTED_MARKER);
    expect(sanitized.user.email).toBe("p***t@school.co.za");
    expect(sanitized.user.id).toBe("usr_123");
  });

  it("safely handles circular references without throwing", () => {
    const circular: Record<string, any> = { name: "Root" };
    circular.self = circular;

    const result = sanitizePayload(circular) as Record<string, any>;
    expect(result.name).toBe("Root");
    expect(result.self).toBe("[CIRCULAR_REFERENCE]");
  });

  it("sanitizes Error instances preserving safe stack/message", () => {
    const err = new Error("Failed to authenticate bearer token Bearer secret-token-1234567890");
    const sanitized = sanitizePayload(err) as Record<string, any>;

    expect(sanitized.name).toBe("Error");
    expect(sanitized.message).toBe("Failed to authenticate bearer token Bearer [REDACTED]");
  });
});

describe("Observability — Structured Logger", () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let consoleWarnSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("emits structured JSON for logger.info", () => {
    logger.info("Order processed successfully", {
      operation: "checkout.order_placed",
      correlationId: "corr-123",
      durationMs: 42.5,
      context: { orderId: "ord_999", email: "customer@domain.com" },
    });

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(logged.level).toBe("info");
    expect(logged.service).toBe("pexpacks-supplies");
    expect(logged.operation).toBe("checkout.order_placed");
    expect(logged.correlationId).toBe("corr-123");
    expect(logged.durationMs).toBe(42.5);
    expect(logged.context.email).toBe("c***r@domain.com");
  });

  it("emits structured JSON for logger.error with sanitized error and context", () => {
    const error = new Error("Connection failed to db with password SuperSecretPassword");
    logger.error("Database connection failure", error, {
      operation: "db.query",
      correlationId: "corr-456",
      context: { password: "DoNotLogMe" },
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(logged.level).toBe("error");
    expect(logged.operation).toBe("db.query");
    expect(logged.context.password).toBe(REDACTED_MARKER);
    expect(logged.error.message).toContain("SuperSecretPassword");
  });
});

describe("Observability — Telemetry & Timing Helper", () => {
  it("records timing and executes action successfully", async () => {
    const action = vi.fn().mockImplementation(async (corrId: string) => {
      expect(corrId).toBeDefined();
      return { status: "ok" };
    });

    const result = await withTelemetry(
      { operation: "test.operation" },
      action,
    );

    expect(result).toEqual({ status: "ok" });
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("captures execution error and rethrows without swallowing", async () => {
    const action = vi.fn().mockImplementation(async () => {
      throw new Error("Simulated failure");
    });

    await expect(
      withTelemetry({ operation: "test.failure" }, action),
    ).rejects.toThrow("Simulated failure");
  });
});
