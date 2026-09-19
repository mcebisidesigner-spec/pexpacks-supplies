import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/chat/route";
import { buildPexReply, detectPexIntent, PexChatResponseSchema } from "@/lib/chat/pex";

function chatRequest(body: unknown, ip = "198.51.100.10") {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("Pex intent routing", () => {
  it("routes purchasing language to the school journey", () => {
    expect(detectPexIntent("How do I order stationery?")).toBe("find_school");
    expect(detectPexIntent("I need a Grade 3 pack")).toBe("find_school_pack");
  });

  it("keeps Pexcover and tracking on their protected journeys", () => {
    expect(detectPexIntent("How does Pexcover work?")).toBe("pexcover_information");
    expect(detectPexIntent("Please track my order")).toBe("order_tracking");
  });

  it("never uses a static price range for pricing-related prompts", () => {
    const reply = buildPexReply("How much will payment cost?");
    expect(reply.text).not.toContain("R450");
    expect(reply.text).toContain("checkout");
  });

  it("returns task choices instead of an unrelated greeting for unknown input", () => {
    const reply = buildPexReply("Can you help?");
    expect(reply.intent).toBe("unknown_intent");
    expect(reply.handoffRecommended).toBe(false);
  });
});

describe("Pex chat API", () => {
  it("returns a validated structured response", async () => {
    const response = await POST(chatRequest({
      messages: [{ role: "user", content: "I need to upload a stationery list" }],
      context: { pathname: "/order" },
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    await expect(response.json()).resolves.toMatchObject({
      intent: "upload_stationery_list",
      actions: [{ href: "/order" }],
    });
  });

  it("rejects malformed, oversized, and cross-origin requests", async () => {
    const malformed = await POST(chatRequest({ messages: [] }, "198.51.100.11"));
    expect(malformed.status).toBe(400);

    const oversized = await POST(chatRequest({
      messages: [{ role: "user", content: "x".repeat(1201) }],
    }, "198.51.100.12"));
    expect(oversized.status).toBe(400);

    const crossOrigin = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://attacker.invalid", "x-forwarded-for": "198.51.100.13" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });
    expect((await POST(crossOrigin)).status).toBe(403);
  });
});
describe("Pex public catalogue boundary", () => {
  it("declares a restricted public product projection without cost or supplier fields", () => {
    const response = PexChatResponseSchema.parse({
      intent: "product_search",
      text: "Catalogue result",
      actions: [],
      quickReplies: [],
      handoffRecommended: false,
      productCards: [{ id: "item-1", name: "Pencil", category: null, description: null, unit: "each", price: 10, requiresPexcover: false, costPrice: 4, supplier: "Private" }],
    });
    expect(response.productCards[0]).not.toHaveProperty("costPrice");
    expect(response.productCards[0]).not.toHaveProperty("supplier");
  });

  it("keeps the order-tray action reversible", () => {
    const reply = buildPexReply("Open my cart");
    expect(reply.actions).toContainEqual(expect.objectContaining({ id: "open-tray", href: "/checkout" }));
  });
});
describe("Pex pack-to-tray boundary", () => {
  it("rejects internal pricing fields in a pack card before it can reach the browser", () => {
    expect(() => PexChatResponseSchema.parse({
      intent: "find_school_pack",
      text: "Pack result",
      actions: [],
      quickReplies: [],
      handoffRecommended: false,
      packCards: [{
        id: "pack-1",
        title: "Grade R Stationery Pack",
        grade: "Grade R",
        gradeSlug: "grade-r",
        price: 349.19,
        href: "/schools/example-school",
        schoolId: "school-1",
        schoolSlug: "example-school",
        schoolName: "Example School",
        items: [{
          id: "item-1",
          name: "Exercise Book",
          quantity: 1,
          unitPrice: 22.08,
          requiresPexcover: true,
          pexcoCode: "PEXC002",
          pexcoRateCents: 1400,
          pexcoRateActive: true,
          supplierCost: 16,
        }],
        internalMargin: 38,
      }],
    })).toThrow();
  });
});