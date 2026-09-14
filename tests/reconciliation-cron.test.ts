import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const range = vi.fn();
const select = vi.fn(() => ({ range }));
const from = vi.fn(() => ({ select }));
const rpc = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({ from, rpc }),
}));

import { GET } from "@/app/api/cron/reconciliation/route";

describe("reconciliation cron", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "cron-secret-for-tests-only");
    range.mockResolvedValue({ data: [], error: null });
    rpc.mockResolvedValue({ data: 0, error: null });
    select.mockClear();
    from.mockClear();
  });

  it("rejects requests without the Vercel cron secret", async () => {
    const response = await GET(new NextRequest("http://localhost/api/cron/reconciliation"));
    expect(response.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
  });

  it("returns a healthy report only for an authenticated cron request", async () => {
    const response = await GET(new NextRequest("http://localhost/api/cron/reconciliation", {
      headers: { authorization: "Bearer cron-secret-for-tests-only" },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ healthy: true });
    expect(rpc).toHaveBeenCalledWith("prune_expired_draft_carts", {});
    expect(from).toHaveBeenCalledTimes(4);
  });
});