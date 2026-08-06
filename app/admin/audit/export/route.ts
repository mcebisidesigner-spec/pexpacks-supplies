import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";
import { exportAuditLogs, auditLogsToCsv, type AuditFilters } from "@/lib/admin/audit";

export async function GET(req: NextRequest) {
  const session = await getAdminUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session, "audit.export")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const filters: AuditFilters = {
    q: sp.get("q") || undefined,
    entity_type: sp.get("entity_type") || undefined,
    action: sp.get("action") || undefined,
    actor: sp.get("actor") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
  };

  const rows = await exportAuditLogs(filters);
  const csv = auditLogsToCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pexpacks-audit-${date}.csv"`,
    },
  });
}
