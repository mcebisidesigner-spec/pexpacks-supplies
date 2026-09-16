import { describe, it, expect } from "vitest";
import { PEXPACKS_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { POST } from "@/app/api/chat/route";

const ESCALATION_PATTERNS = [
  /\bprice\b/i,
  /\bpricing\b/i,
  /\bcost\b/i,
  /\bquote\b/i,
  /\bquotation\b/i,
  /\bdiscount\b/i,
  /\bbulk\b/i,
  /\bcustom list\b/i,
  /\bschool list\b/i,
  /\bunlisted\b/i,
  /\bnot listed\b/i,
  /\bsend.*list\b/i,
  /\bupload.*list\b/i,
  /\bspecial order\b/i,
  /\bwholesale\b/i,
];

describe("Pexpacks Assistant System Prompt", () => {
  it("contains core mission and identity", () => {
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("Stationery sorted. Time saved.");
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("pexpacks.co.za");
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("South African school stationery");
  });

  it("enforces strict anti-hallucination pricing boundaries", () => {
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("PRICING, QUOTATIONS & HUMAN ESCALATION");
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("You must NOT invent, estimate, calculate or guess");
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("Chat with us on WhatsApp");
  });

  it("covers key delivery streams and payment options", () => {
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("Annual Pre-Orders");
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("Year-Round Standard Orders");
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("Happy Pay");
    expect(PEXPACKS_SYSTEM_PROMPT).toContain("Paxi / PEP");
  });
});

describe("Escalation Pattern Matcher", () => {
  it("triggers on quotation requests", () => {
    const input = "Can you give me a quote for 80 grade 5 stationery packs?";
    const matched = ESCALATION_PATTERNS.some((p) => p.test(input));
    expect(matched).toBe(true);
  });

  it("triggers on unlisted school requests", () => {
    const input = "Our school is not listed on the website yet";
    const matched = ESCALATION_PATTERNS.some((p) => p.test(input));
    expect(matched).toBe(true);
  });

  it("does not trigger on general questions like delivery or happy pay", () => {
    const input = "How long does standard courier delivery take to Durban?";
    const matched = ESCALATION_PATTERNS.some((p) => p.test(input));
    expect(matched).toBe(false);
  });
});

describe("Chat API Route Handler", () => {
  it("returns a streaming response for delivery inquiries", async () => {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "How long does delivery take?",
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const body = await res.text();
    expect(body).toContain("Year-Round Orders");
  });

  it("returns 400 if messages are missing or malformed", async () => {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("emits valid text-start and text-delta chunks for school inquiry", async () => {
    const req = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            id: "msg-2",
            role: "user",
            parts: [{ type: "text", text: "Primrose hill grade1" }],
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.text();
    expect(body).toContain("text-start");
    expect(body).toContain("text-delta");
    expect(body).toContain("Primrose Hill Primary");
  });
});
