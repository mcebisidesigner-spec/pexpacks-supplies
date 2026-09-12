import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/00116_atomic_pending_orders_and_public_website_content.sql",
  ),
  "utf8",
);
const orders = readFileSync(resolve(process.cwd(), "lib/orders.ts"), "utf8");
const cms = readFileSync(resolve(process.cwd(), "lib/cms.ts"), "utf8");
const smoke = readFileSync(
  resolve(process.cwd(), "scripts/db-performance-smoke.cjs"),
  "utf8",
);

describe("atomic pending-order persistence", () => {
  it("creates orders and immutable item snapshots in one service-only RPC", () => {
    expect(migration).toContain("create_pending_order_with_snapshots");
    expect(migration).toContain("INSERT INTO public.orders");
    expect(migration).toContain("INSERT INTO public.order_items");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.create_pending_order_with_snapshots(jsonb, jsonb)");
    expect(migration).toContain("TO service_role");
    expect(orders).toContain('"create_pending_order_with_snapshots"');
    expect(orders).not.toContain('from("order_items").insert');
  });

  it("exposes website content through an allowlisted service-only public read model", () => {
    expect(migration).toContain("get_public_website_content");
    expect(migration).toContain("'homepage.hero'");
    expect(migration).toContain("'company_info'");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.get_public_website_content()");
    expect(cms).toContain("get_public_website_content");
    expect(cms).not.toContain('.from("website_content")');
    expect(smoke).toContain("get_public_website_content");
  });
});