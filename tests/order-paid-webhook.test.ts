import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/webhooks/order-paid/route";

describe("Order Paid Webhook (/api/webhooks/order-paid)", () => {
  const secret = "test_supabase_webhook_secret_32chars!";

  beforeEach(() => {
    vi.stubEnv("SUPABASE_WEBHOOK_SECRET", secret);
  });

  function makeRequest(
    body: unknown,
    headers: Record<string, string> = {},
  ): NextRequest {
    return new NextRequest("http://localhost:3000/api/webhooks/order-paid", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  }

  it("returns 401 when x-supabase-webhook-secret is missing or incorrect", async () => {
    const reqNoSecret = makeRequest({
      type: "UPDATE",
      table: "orders",
      schema: "public",
      record: { id: "1", order_reference: "PEX-101", status: "paid" },
    });
    const resNoSecret = await POST(reqNoSecret);
    expect(resNoSecret.status).toBe(401);
    const jsonNoSecret = await resNoSecret.json();
    expect(jsonNoSecret.error).toContain("Unauthorized");

    const reqWrongSecret = makeRequest(
      {
        type: "UPDATE",
        table: "orders",
        schema: "public",
        record: { id: "1", order_reference: "PEX-101", status: "paid" },
      },
      { "x-supabase-webhook-secret": "wrong_secret_value_completely" },
    );
    const resWrongSecret = await POST(reqWrongSecret);
    expect(resWrongSecret.status).toBe(401);
  });

  it("returns 422 when payload schema validation fails", async () => {
    const reqInvalid = makeRequest(
      {
        type: "INVALID_TYPE",
        table: "unknown_table",
      },
      { "x-supabase-webhook-secret": secret },
    );
    const res = await POST(reqInvalid);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toBe("Schema validation failed.");
  });

  it("returns 200 with no-op message when order status is not transitioning to paid", async () => {
    const reqPending = makeRequest(
      {
        type: "UPDATE",
        table: "orders",
        schema: "public",
        record: {
          id: "1",
          order_reference: "PEX-101",
          status: "pending_payment",
        },
        old_record: { status: "pending_payment" },
      },
      { "x-supabase-webhook-secret": secret },
    );
    const resPending = await POST(reqPending);
    expect(resPending.status).toBe(200);
    const jsonPending = await resPending.json();
    expect(jsonPending.message).toContain("No action required");

    const reqAlreadyPaid = makeRequest(
      {
        type: "UPDATE",
        table: "orders",
        schema: "public",
        record: { id: "1", order_reference: "PEX-101", status: "paid" },
        old_record: { status: "paid" },
      },
      { "x-supabase-webhook-secret": secret },
    );
    const resAlreadyPaid = await POST(reqAlreadyPaid);
    expect(resAlreadyPaid.status).toBe(200);
    const jsonAlreadyPaid = await resAlreadyPaid.json();
    expect(jsonAlreadyPaid.message).toContain("No action required");
  });

  it("returns 200 with no-op message when receipt was already sent (idempotency)", async () => {
    const reqAlreadySent = makeRequest(
      {
        type: "UPDATE",
        table: "orders",
        schema: "public",
        record: {
          id: "1",
          order_reference: "PEX-101",
          status: "paid",
          receipt_email_sent_at: "2026-09-04T12:00:00Z",
        },
        old_record: { status: "pending_payment" },
      },
      { "x-supabase-webhook-secret": secret },
    );
    const res = await POST(reqAlreadySent);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("receipt already sent");
  });

  it("accepts valid transition to paid with correct secret and schedules email", async () => {
    const req = makeRequest(
      {
        type: "UPDATE",
        table: "orders",
        schema: "public",
        record: {
          id: "ord-uuid-1",
          order_reference: "PEX-2026-001",
          status: "paid",
          buyer_email: "parent@example.com",
        },
        old_record: { status: "pending_payment" },
      },
      { "x-supabase-webhook-secret": secret },
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("Webhook accepted; email scheduled.");
  });
});
