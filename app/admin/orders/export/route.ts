import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";
import { exportOrders, ordersToCsv } from "@/lib/admin/orders";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAdminUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session, "orders.export")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const rows = await exportOrders({
    q: sp.get("q") || undefined,
    status: sp.get("status") || undefined,
    pack_type: sp.get("pack_type") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
  });

  const csv = ordersToCsv(rows);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pexpacks-orders-${date}.csv"`,
    },
  });
}
