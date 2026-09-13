import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(
  resolve(
    root,
    "supabase/migrations/00120_peak_traffic_write_path_hardening.sql",
  ),
  "utf8",
);
const requestGuards = readFileSync(
  resolve(root, "lib/security/requestGuards.ts"),
  "utf8",
);

const rateLimitedRoutes = [
  "app/api/checkout/route.ts",
  "app/api/forms/checkout-draft/route.ts",
  "app/api/nearby-schools/route.ts",
  "app/api/ozow/checkout/route.ts",
  "app/api/packs/custom-total/route.ts",
  "app/api/schools/[schoolSlug]/route.ts",
  "app/api/schools/search/route.ts",
  "app/api/schools/visibility/route.ts",
  "app/api/stationery/search/route.ts",
  "app/api/track-order/route.ts",
  "lib/forms/routeHandler.ts",
];

describe("peak traffic hardening", () => {
  it("keeps dashboard aggregation off the synchronous order trigger path", () => {
    expect(migration).toContain(
      "DROP TRIGGER IF EXISTS trg_sync_dashboard_summaries",
    );
    expect(migration).toContain("refresh-dashboard-summaries");
    expect(migration).toContain("*/5 * * * *");
  });

  it("removes only named exact duplicate indexes and tunes high-churn tables", () => {
    for (const index of [
      "idx_schools_slug",
      "schools_slug_unique",
      "idx_schools_location_gist",
      "idx_schools_status",
      "idx_dashboard_summaries_id",
      "order_items_order_idx",
      "order_items_product_idx",
      "idx_orders_created_at_desc",
      "idx_orders_status_created",
      "idx_orders_status_created_at",
    ]) {
      expect(migration).toContain(`DROP INDEX IF EXISTS public.${index}`);
    }

    expect(migration).toContain("ALTER TABLE public.auth_otp_tokens SET");
    expect(migration).toContain("ALTER TABLE public.orders SET");
    expect(migration).toContain("ALTER TABLE public.order_items SET");
    expect(migration).toContain("ALTER TABLE public.dashboard_summaries SET");
  });

  it("uses Redis-backed sliding windows when configured and awaits all route checks", () => {
    expect(requestGuards).toContain('from "@upstash/ratelimit"');
    expect(requestGuards).toContain("Ratelimit.slidingWindow");
    expect(requestGuards).toContain("UPSTASH_REDIS_REST_URL");
    expect(requestGuards).toContain("export async function rateLimitRequest");

    for (const route of rateLimitedRoutes) {
      const source = readFileSync(resolve(root, route), "utf8");
      expect(source).toContain("await rateLimitRequest(");
    }
  });
});
