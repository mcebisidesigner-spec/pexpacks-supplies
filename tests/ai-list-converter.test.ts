import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as convertListPost } from "@/app/api/ai-convert-list/route";
import { GET as draftCartGet, PATCH as draftCartPatch } from "@/app/api/draft-cart/route";

// Mock requestGuards so tests pass same-origin check and rate limiting
const mockRateLimit = vi.fn().mockResolvedValue({ allowed: true, remaining: 4, retryAfter: 0 });
vi.mock("@/lib/security/requestGuards", () => ({
  isSameOriginRequest: vi.fn(() => true),
  rateLimitRequest: (...args: unknown[]) => mockRateLimit(...args),
}));

// Mock Supabase admin client
const mockInsertSingle = vi.fn().mockResolvedValue({
  data: {
    id: "test-draft-cart-12345",
    status: "draft",
  },
  error: null,
});

const mockInsertSelect = vi.fn().mockReturnValue({
  single: mockInsertSingle,
});

const mockRpc = vi.fn().mockResolvedValue({
  data: [
    {
      id: "prod-1",
      sku: "PEX-TEST-1",
      name: "Pritt Stick 43g",
      category: "Stationery",
      current_selling_price: 52.44,
      requires_pexcover: false,
      pexco_code: null,
      similarity: 0.95,
    },
  ],
  error: null,
});

const mockSelectMaybeSingle = vi.fn().mockResolvedValue({
  data: {
    id: "test-draft-cart-12345",
    status: "draft",
    items: [
      {
        id: "item_1",
        name: "Pritt Stick 43g",
        quantity: 2,
        unitPrice: 52.44,
        lineTotal: 104.88,
        requiresPexcover: false,
      },
    ],
    item_count: 2,
    subtotal: 104.88,
    wants_pexcover: false,
    document_name: "school_list.png",
  },
  error: null,
});

const mockUpdateSingle = vi.fn().mockResolvedValue({
  data: {
    id: "test-draft-cart-12345",
    status: "draft",
    wants_pexcover: true,
  },
  error: null,
});

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => ({
    rpc: mockRpc,
    from: vi.fn((table: string) => {
      if (table === "draft_carts") {
        return {
          insert: vi.fn(() => ({
            select: mockInsertSelect,
          })),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: mockSelectMaybeSingle,
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: mockUpdateSingle,
              })),
            })),
          })),
        };
      }
      return {
        select: vi.fn(() => ({
          ilike: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({ data: [] }),
          })),
        })),
      };
    }),
  })),
}));

describe("AI List Converter API (/api/ai-convert-list)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when neither file nor text is provided", async () => {
    const formData = new FormData();
    const req = new NextRequest("https://pexpacks.co.za/api/ai-convert-list", {
      method: "POST",
      body: formData,
      headers: {
        origin: "https://pexpacks.co.za",
      },
    });

    const res = await convertListPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Please upload a photo, PDF document, or enter your stationery list");
  });

  it("returns 400 when file exceeds 10MB", async () => {
    const hugeBlob = new Uint8Array(11 * 1024 * 1024); // 11MB
    const file = new File([hugeBlob], "huge-list.pdf", { type: "application/pdf" });

    const formData = new FormData();
    formData.append("file", file);

    const req = new NextRequest("https://pexpacks.co.za/api/ai-convert-list", {
      method: "POST",
      body: formData,
      headers: {
        origin: "https://pexpacks.co.za",
      },
    });

    const res = await convertListPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("exceeds the 10MB limit");
  });

  it("returns 400 when text exceeds 10,000 characters", async () => {
    const longText = "a".repeat(10001);
    const formData = new FormData();
    formData.append("text", longText);

    const req = new NextRequest("https://pexpacks.co.za/api/ai-convert-list", {
      method: "POST",
      body: formData,
      headers: {
        origin: "https://pexpacks.co.za",
      },
    });

    const res = await convertListPost(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("10,000 character limit");
  });

  it("returns 503 when document is uploaded without Gemini API key configured", async () => {
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GOOGLE_AI_API_KEY;

    const file = new File(["test image bytes"], "list.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", file);

    const req = new NextRequest("https://pexpacks.co.za/api/ai-convert-list", {
      method: "POST",
      body: formData,
      headers: {
        origin: "https://pexpacks.co.za",
      },
    });

    const res = await convertListPost(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toContain("AI document scanning is temporarily unavailable");

    if (origKey) process.env.GEMINI_API_KEY = origKey;
  });

  it("returns 429 when rate limit is exceeded", async () => {
    mockRateLimit.mockResolvedValueOnce({ allowed: false, remaining: 0, retryAfter: 45 });

    const formData = new FormData();
    formData.append("text", "1x 72pg Exercise Book");

    const req = new NextRequest("https://pexpacks.co.za/api/ai-convert-list", {
      method: "POST",
      body: formData,
      headers: {
        origin: "https://pexpacks.co.za",
      },
    });

    const res = await convertListPost(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("45");
    const body = await res.json();
    expect(body.error).toContain("Too many conversion requests");
  });

  it("successfully parses text list and creates draft cart", async () => {
    const formData = new FormData();
    formData.append(
      "text",
      "5x 72pg Exercise Book Feint & Margin\n2x Pritt Stick 43g\n1x 30cm Ruler"
    );

    const req = new NextRequest("https://pexpacks.co.za/api/ai-convert-list", {
      method: "POST",
      body: formData,
      headers: {
        origin: "https://pexpacks.co.za",
      },
    });

    const res = await convertListPost(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.draftId).toBe("test-draft-cart-12345");
    expect(body.itemCount).toBeGreaterThan(0);
  });
});

describe("Draft Cart API (/api/draft-cart)", () => {
  it("retrieves draft cart by draft_id", async () => {
    const req = new NextRequest(
      "https://pexpacks.co.za/api/draft-cart?draft_id=test-draft-cart-12345",
      {
        method: "GET",
      }
    );

    const res = await draftCartGet(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.draft.id).toBe("test-draft-cart-12345");
  });

  it("returns 400 if draft_id is missing on GET", async () => {
    const req = new NextRequest("https://pexpacks.co.za/api/draft-cart", {
      method: "GET",
    });

    const res = await draftCartGet(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing draft_id");
  });

  it("updates draft cart via PATCH", async () => {
    const req = new NextRequest("https://pexpacks.co.za/api/draft-cart", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        origin: "https://pexpacks.co.za",
      },
      body: JSON.stringify({
        draftId: "test-draft-cart-12345",
        wantsPexcover: true,
      }),
    });

    const res = await draftCartPatch(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.draft.wants_pexcover).toBe(true);
  });
});
