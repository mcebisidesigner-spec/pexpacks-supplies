import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { ORDER_STATUSES } from "@/lib/admin/order-constants";

export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];

const PAYMENT_FIELDS =
  "id,order_reference,buyer_name,buyer_email,school_name,pack_type,estimated_total,status,payment_gateway,gateway_reference,payment_reference,paid_at,metadata,created_at";

const PAYMENT_STATUSES = [
  "paid",
  "pending_payment",
  "payment_failed",
  "refunded",
];

export interface PaymentFilters {
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface PaymentListResult {
  payments: OrderRow[];
  total: number;
  page: number;
  pageCount: number;
  paidTotal: number;
  paidCount: number;
  statusOptions: { value: string; label: string }[];
}

function endOfDay(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date}T23:59:59.999Z`;
  return date;
}

type FilterableQueryResult = {
  data: OrderRow[] | null;
  count: number | null;
  error: { message?: string } | null;
};

type FilterableQuery = Promise<FilterableQueryResult> & {
  or(filters: string): FilterableQuery;
  eq(column: string, value: unknown): FilterableQuery;
  gte(column: string, value: unknown): FilterableQuery;
  lte(column: string, value: unknown): FilterableQuery;
  order(column: string, options?: { ascending?: boolean }): FilterableQuery;
  range(from: number, to: number): FilterableQuery;
};

function basePaymentFilter(
  query: FilterableQuery,
  filters: PaymentFilters,
): FilterableQuery {
  const q = filters.q?.replace(/%/g, "").trim();
  if (q) {
    query = query.or(
      `order_reference.ilike.%${q}%,buyer_name.ilike.%${q}%,buyer_email.ilike.%${q}%`,
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", endOfDay(filters.to));
  return query;
}

export async function listPayments(
  filters: PaymentFilters = {},
): Promise<PaymentListResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Payment records = anything that touched a gateway or carries a payment status.
  const base = (admin
    .from("orders")
    .select(PAYMENT_FIELDS, { count: "exact" })
    .or(
      `payment_gateway.not.is.null,paid_at.not.is.null,status.in.(${PAYMENT_STATUSES.join(",")})`,
    )) as unknown as FilterableQuery;

  const query = basePaymentFilter(base, filters);
  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[payments] list failed:", error);
    return {
      payments: [],
      total: 0,
      page,
      pageCount: 0,
      paidTotal: 0,
      paidCount: 0,
      statusOptions: [],
    };
  }

  const rpc = admin.rpc.bind(admin) as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data: { paid_count: number; paid_total: number }[] | null;
    error: { message?: string } | null;
  }>;
  const { data: totalsData, error: totalsError } = await rpc("get_payment_totals", {
    q: filters.q || null,
    status_filter: filters.status || null,
    from_ts: filters.from || null,
    to_ts: filters.to ? endOfDay(filters.to) : null,
  });
  if (totalsError) {
    throw new Error(
      `Unable to load payment totals: ${totalsError.message || "get_payment_totals failed"}`,
    );
  }
  const totalsRow = totalsData?.[0];
  const paidCount = Number(totalsRow?.paid_count ?? 0);
  const paidTotal = Number(totalsRow?.paid_total ?? 0);

  return {
    payments: (data ?? []) as OrderRow[],
    total: count ?? 0,
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    paidTotal,
    paidCount,
    statusOptions: ORDER_STATUSES.map((s) => ({
      value: s.value,
      label: s.label,
    })),
  };
}
