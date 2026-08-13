import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

export const DASHBOARD_STATS_TAG = "admin-dashboard-stats";
export const DASHBOARD_SUMMARY_TAG = "admin-dashboard-summary";

const SUMMARY_FRESH_MS = 10 * 60 * 1000;

export interface DailyPoint {
  day: string;
  orders: number;
  revenue: number;
}

export interface NameCount {
  label: string;
  count: number;
}

export interface DashboardStats {
  schools: { total: number; featured: number; partner: number; pending: number };
  packs: number;
  orders: { total: number; thisMonth: number; revenue: number };
  users: number;
  assets: { total: number; sizeBytes: number };
  ordersDaily: DailyPoint[];
  ordersByPackType: NameCount[];
  schoolsByCity: NameCount[];
  recentOrders: {
    id: string;
    order_reference: string;
    buyer_name: string;
    school_name: string;
    estimated_total: number | null;
    status: string;
    created_at: string;
  }[];
}

async function count(table: "schools" | "stationery_packs" | "orders" | "assets"): Promise<number> {
  try {
    const admin = createSupabaseAdminClient();
    const { count: result } = await admin
      .from(table)
      .select("id", { count: "exact", head: true });
    return result ?? 0;
  } catch (err) {
    console.error(`[dashboard] count ${table} failed:`, err);
    return 0;
  }
}

type DashboardSummaryRow = Pick<
  Database["public"]["Tables"]["dashboard_summaries"]["Row"],
  | "total_orders"
  | "paid_orders"
  | "pending_orders"
  | "total_revenue"
  | "total_schools"
  | "total_packs"
  | "orders_today"
  | "orders_this_week"
  | "awaiting_fulfilment"
  | "completed_orders"
  | "active_packs"
  | "last_updated_at"
>;

async function readDashboardSummary(
  admin: SupabaseClient<Database>
): Promise<DashboardSummaryRow | null> {
  try {
    const { data } = await admin
      .from("dashboard_summaries")
      .select(
        "total_orders, paid_orders, pending_orders, total_revenue, total_schools, total_packs, orders_today, orders_this_week, awaiting_fulfilment, completed_orders, active_packs, last_updated_at"
      )
      .eq("id", "global")
      .maybeSingle();
    if (!data) return null;
    const age = Date.now() - new Date(data.last_updated_at).getTime();
    if (Number.isNaN(age) || age > SUMMARY_FRESH_MS) return null;
    return data;
  } catch (err) {
    console.error("[dashboard] summary read failed:", err);
    return null;
  }
}

function last30Days(): { start: string; end: string; days: string[] } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 29);
  start.setHours(0, 0, 0, 0);

  const days: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    days,
  };
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const admin = createSupabaseAdminClient();

  // Pre-aggregated totals (O(1) single-row read). Falls back to exact counts
  // + RPCs when the summary table is absent (migration 00019 not applied yet)
  // or stale (no pg_cron schedule / manual refresh).
  const summary = await readDashboardSummary(admin);

  // Schools counts (status filter)
  let featured = 0;
  let partner = 0;
  let pending = 0;
  try {
    const { count: f } = await admin
      .from("schools")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true);
    featured = f ?? 0;
    const { count: p } = await admin
      .from("schools")
      .select("id", { count: "exact", head: true })
      .eq("is_partner", true);
    partner = p ?? 0;
    const { count: pd } = await admin
      .from("schools")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pending = pd ?? 0;
  } catch (err) {
    console.error("[dashboard] schools counts failed:", err);
  }

  let schoolsTotal: number;
  let packs: number;
  let ordersTotal: number;
  let assetsTotal: number;

  if (summary) {
    schoolsTotal = summary.total_schools;
    packs = summary.total_packs;
    ordersTotal = summary.total_orders;
    assetsTotal = await count("assets");
  } else {
    const [s, p, o, a] = await Promise.all([
      count("schools"),
      count("stationery_packs"),
      count("orders"),
      count("assets"),
    ]);
    schoolsTotal = s;
    packs = p;
    ordersTotal = o;
    assetsTotal = a;
  }

  // Orders this month + revenue
  let thisMonth = 0;
  let revenue = summary?.total_revenue ?? 0;
  try {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { count: m } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString());
    thisMonth = m ?? 0;

    if (!summary) {
      const { data: revenueRows } = await admin.rpc("get_revenue_total");
      revenue = revenueRows?.[0]?.revenue ?? 0;
    }
  } catch (err) {
    console.error("[dashboard] order aggregates failed:", err);
  }

  // Users (Supabase Auth)
  let users = 0;
  try {
    const res = (await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    })) as unknown as { data?: { users?: unknown[] }; count?: number | null };
    users = res.count ?? res.data?.users?.length ?? 0;
  } catch (err) {
    console.error("[dashboard] user count failed:", err);
  }

  // Assets size
  let assetsSize = 0;
  try {
    const { data: sizes } = await admin.rpc("get_assets_size");
    assetsSize = sizes?.[0]?.size_bytes ?? 0;
  } catch (err) {
    console.error("[dashboard] asset sizes failed:", err);
  }

  // Daily orders/revenue (last 30 days)
  let ordersDaily: DailyPoint[] = [];
  try {
    const { start, end, days } = last30Days();
    const { data } = await admin.rpc("get_orders_daily", {
      from_date: start,
      to_date: end,
    });
    const byDay = new Map((data ?? []).map((d) => [d.day, d]));
    ordersDaily = days.map((day) => {
      const point = byDay.get(day);
      return {
        day,
        orders: point?.order_count ?? 0,
        revenue: point?.revenue ?? 0,
      };
    });
  } catch (err) {
    console.error("[dashboard] get_orders_daily failed:", err);
  }

  // Pack-type and city breakdowns
  let ordersByPackType: NameCount[] = [];
  let schoolsByCity: NameCount[] = [];
  try {
    const { data: byPack } = await admin.rpc("get_orders_by_pack_type");
    ordersByPackType = (byPack ?? []).map((d) => ({
      label: d.pack_type || "Custom",
      count: d.order_count,
    }));
  } catch (err) {
    console.error("[dashboard] get_orders_by_pack_type failed:", err);
  }
  try {
    const { data: byCity } = await admin.rpc("get_schools_by_city");
    schoolsByCity = (byCity ?? [])
      .filter((d) => d.city)
      .slice(0, 6)
      .map((d) => ({ label: d.city as string, count: d.school_count }));
  } catch (err) {
    console.error("[dashboard] get_schools_by_city failed:", err);
  }

  // Recent orders
  let recentOrders: DashboardStats["recentOrders"] = [];
  try {
    const { data } = await admin
      .from("orders")
      .select(
        "id, order_reference, buyer_name, school_name, estimated_total, status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(8);
    recentOrders = (data ?? []).map((o) => ({
      id: o.id,
      order_reference: o.order_reference,
      buyer_name: o.buyer_name,
      school_name: o.school_name,
      estimated_total: o.estimated_total,
      status: o.status,
      created_at: o.created_at,
    }));
  } catch (err) {
    console.error("[dashboard] recent orders failed:", err);
  }

  return {
    schools: { total: schoolsTotal, featured, partner, pending },
    packs,
    orders: { total: ordersTotal, thisMonth, revenue },
    users,
    assets: { total: assetsTotal, sizeBytes: assetsSize },
    ordersDaily,
    ordersByPackType,
    schoolsByCity,
    recentOrders,
  };
}

export const getDashboardStats = unstable_cache(
  fetchDashboardStats,
  ["admin-dashboard-stats"],
  {
    revalidate: 60,
    tags: [DASHBOARD_STATS_TAG],
  }
);
