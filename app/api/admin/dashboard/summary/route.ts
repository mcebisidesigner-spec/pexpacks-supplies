import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";
import { DASHBOARD_SUMMARY_TAG } from "@/lib/admin/dashboard";

const SUMMARY_FRESH_MS = 10 * 60 * 1000;

interface SummaryRow {
  id: string;
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
  total_revenue: number | null;
  total_schools: number;
  total_packs: number;
  orders_today: number;
  orders_this_week: number;
  awaiting_fulfilment: number;
  completed_orders: number;
  active_packs: number;
  last_updated_at: string;
}

async function readSummary(): Promise<SummaryRow | null> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("dashboard_summaries")
      .select(
        "id, total_orders, paid_orders, pending_orders, total_revenue, total_schools, total_packs, orders_today, orders_this_week, awaiting_fulfilment, completed_orders, active_packs, last_updated_at"
      )
      .eq("id", "global")
      .maybeSingle();
    if (!data) return null;
    const age = Date.now() - new Date(data.last_updated_at).getTime();
    if (Number.isNaN(age) || age > SUMMARY_FRESH_MS) return null;
    return data as SummaryRow;
  } catch (err) {
    console.error("[api/admin/dashboard/summary] read failed:", err);
    return null;
  }
}

// Global 30s dedup: concurrent admins share a single O(1) summary read.
const getCachedSummary = unstable_cache(readSummary, [DASHBOARD_SUMMARY_TAG], {
  revalidate: 30,
  tags: [DASHBOARD_SUMMARY_TAG],
});

export async function GET() {
  const session = await getAdminUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (!hasPermission(session, "dashboard.view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const summary = await getCachedSummary();
  return NextResponse.json(summary, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
