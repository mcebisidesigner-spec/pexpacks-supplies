import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { toCsv } from "@/lib/admin/csv";
import { orderStatusLabel } from "@/lib/admin/order-constants";

/**
 * Reports module: date-ranged aggregates over `orders` via the SQL functions
 * added in migration 00009. All queries are read-only.
 */

export interface OrderSummary {
  totalOrders: number;
  paidOrders: number;
  refundedOrders: number;
  cancelledOrders: number;
  revenue: number;
  avgOrderValue: number;
}

export interface StatusCount {
  status: string;
  orderCount: number;
  revenue: number;
}

export interface PackTypeCount {
  packType: string;
  orderCount: number;
}

export interface TopSchool {
  schoolName: string;
  orderCount: number;
  revenue: number;
}

export interface ReportRange {
  from: string;
  to: string;
}

/** Default to the last 30 days (inclusive). */
export function defaultRange(): ReportRange {
  const to = new Date();
  const from = new Date(to);
  from.setDate(to.getDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function isReportRange(value: ReportRange): value is ReportRange {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.from) && /^\d{4}-\d{2}-\d{2}$/.test(value.to);
}

export function parseRange(from?: string, to?: string): ReportRange {
  const fallback = defaultRange();
  const f = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : fallback.from;
  const t = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : fallback.to;
  return f <= t ? { from: f, to: t } : { from: t, to: f };
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T | null> {
  try {
    const admin = createSupabaseAdminClient();
    const call = admin.rpc as unknown as (
      fn: string,
      params: Record<string, unknown>
    ) => Promise<{ data: unknown; error: unknown }>;
    const { data, error } = await call(name, args);
    if (error) {
      console.error(`[reports] ${name} failed:`, error);
      return null;
    }
    return (data ?? null) as T | null;
  } catch (err) {
    console.error(`[reports] ${name} threw:`, err);
    return null;
  }
}

interface SummaryDbRow {
  total_orders: number;
  paid_orders: number;
  refunded_orders: number;
  cancelled_orders: number;
  revenue: number;
  avg_order_value: number;
}

interface StatusDbRow {
  status: string;
  order_count: number;
  revenue: number;
}

interface PackTypeDbRow {
  pack_type: string;
  order_count: number;
}

interface TopSchoolDbRow {
  school_name: string;
  order_count: number;
  revenue: number;
}

export async function getReportSummary(from: string, to: string): Promise<OrderSummary> {
  const data = await rpc<SummaryDbRow[]>("get_orders_summary", {
    from_date: from,
    to_date: to,
  });
  const row = data?.[0];
  return {
    totalOrders: row?.total_orders ?? 0,
    paidOrders: row?.paid_orders ?? 0,
    refundedOrders: row?.refunded_orders ?? 0,
    cancelledOrders: row?.cancelled_orders ?? 0,
    revenue: row?.revenue ?? 0,
    avgOrderValue: row?.avg_order_value ?? 0,
  };
}

export async function getOrdersByStatus(from: string, to: string): Promise<StatusCount[]> {
  const data = await rpc<StatusDbRow[]>("get_orders_by_status_range", {
    from_date: from,
    to_date: to,
  });
  return (data ?? []).map((d) => ({
    status: d.status,
    orderCount: d.order_count,
    revenue: d.revenue,
  }));
}

export async function getOrdersByPackType(from: string, to: string): Promise<PackTypeCount[]> {
  const data = await rpc<PackTypeDbRow[]>("get_orders_by_pack_type_range", {
    from_date: from,
    to_date: to,
  });
  return (data ?? []).map((d) => ({
    packType: d.pack_type,
    orderCount: d.order_count,
  }));
}

export async function getTopSchools(
  from: string,
  to: string,
  limit = 10
): Promise<TopSchool[]> {
  const data = await rpc<TopSchoolDbRow[]>("get_top_schools", {
    from_date: from,
    to_date: to,
    result_limit: limit,
  });
  return (data ?? []).map((d) => ({
    schoolName: d.school_name ?? "—",
    orderCount: d.order_count,
    revenue: d.revenue,
  }));
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

const STATUS_CSV_HEADERS = ["status", "order_count", "revenue"];

export function statusToCsv(rows: StatusCount[]): string {
  return toCsv(
    STATUS_CSV_HEADERS,
    rows.map((r) => ({
      status: orderStatusLabel(r.status),
      order_count: r.orderCount,
      revenue: r.revenue,
    }))
  );
}

const PACK_TYPE_CSV_HEADERS = ["pack_type", "order_count"];

export function packTypeToCsv(rows: PackTypeCount[]): string {
  return toCsv(
    PACK_TYPE_CSV_HEADERS,
    rows.map((r) => ({
      pack_type: r.packType,
      order_count: r.orderCount,
    }))
  );
}

const TOP_SCHOOLS_CSV_HEADERS = ["school_name", "order_count", "revenue"];

export function topSchoolsToCsv(rows: TopSchool[]): string {
  return toCsv(
    TOP_SCHOOLS_CSV_HEADERS,
    rows.map((r) => ({
      school_name: r.schoolName,
      order_count: r.orderCount,
      revenue: r.revenue,
    }))
  );
}
