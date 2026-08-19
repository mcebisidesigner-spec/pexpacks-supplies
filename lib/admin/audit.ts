import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { toCsv } from "@/lib/admin/csv";

export type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];

export interface AuditFilters {
  q?: string;
  entity_type?: string;
  action?: string;
  actor?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditListResult {
  logs: AuditLogRow[];
  total: number;
  page: number;
  pageCount: number;
  entityTypes: string[];
  actions: string[];
  actors: string[];
}

function endOfDay(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${date}T23:59:59.999Z`;
  return date;
}

function buildQuery(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  filters: AuditFilters
) {
  let query = admin.from("audit_logs").select("id,created_at,actor_id,actor_name,action,entity_type,entity_id,summary,details,ip,user_agent", { count: "exact" });

  if (filters.q) {
    const q = filters.q.replace(/%/g, "").trim();
    if (q) {
      query = query.or(`summary.ilike.%${q}%,actor_name.ilike.%${q}%,entity_id.ilike.%${q}%`);
    }
  }
  if (filters.entity_type) query = query.eq("entity_type", filters.entity_type);
  if (filters.action) query = query.eq("action", filters.action);
  if (filters.actor) query = query.eq("actor_name", filters.actor);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", endOfDay(filters.to));

  return query;
}

async function listColumn(column: "entity_type" | "action" | "actor_name"): Promise<string[]> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("audit_logs")
      .select(column)
      .not(column, "is", null)
      .limit(500);
    if (error || !data) return [];
    const rows = data as unknown as { [key: string]: string | null }[];
    return [...new Set(rows.map((r) => r[column]).filter((v): v is string => Boolean(v)))].sort();
  } catch {
    return [];
  }
}

export async function listAuditLogs(filters: AuditFilters = {}): Promise<AuditListResult> {
  const admin = createSupabaseAdminClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 25));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await buildQuery(admin, filters)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("[audit] list failed:", error);
    return { logs: [], total: 0, page, pageCount: 0, entityTypes: [], actions: [], actors: [] };
  }

  const [entityTypes, actions, actors] = await Promise.all([
    listColumn("entity_type"),
    listColumn("action"),
    listColumn("actor_name"),
  ]);

  return {
    logs: data ?? [],
    total: count ?? 0,
    page,
    pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    entityTypes,
    actions,
    actors,
  };
}

export async function getAuditLog(id: number): Promise<AuditLogRow | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("audit_logs").select("id,created_at,actor_id,actor_name,action,entity_type,entity_id,summary,details,ip,user_agent").eq("id", id).maybeSingle();
  if (error) {
    console.error("[audit] get failed:", error);
    return null;
  }
  return data;
}

export async function exportAuditLogs(filters: AuditFilters): Promise<AuditLogRow[]> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await buildQuery(admin, filters).order("created_at", { ascending: false });
  if (error) {
    console.error("[audit] export failed:", error);
    return [];
  }
  return data ?? [];
}

const AUDIT_CSV_HEADERS = [
  "created_at",
  "actor_name",
  "action",
  "entity_type",
  "entity_id",
  "summary",
  "details",
  "ip",
  "user_agent",
];

export function auditLogsToCsv(logs: AuditLogRow[]): string {
  return toCsv(
    AUDIT_CSV_HEADERS,
    logs.map((l) => ({
      created_at: l.created_at,
      actor_name: l.actor_name ?? "",
      action: l.action,
      entity_type: l.entity_type,
      entity_id: l.entity_id ?? "",
      summary: l.summary,
      details: l.details ? JSON.stringify(l.details) : "",
      ip: l.ip ?? "",
      user_agent: l.user_agent ?? "",
    }))
  );
}
