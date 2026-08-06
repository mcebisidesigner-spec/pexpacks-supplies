import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";
import {
  parseRange,
  getOrdersByStatus,
  getOrdersByPackType,
  getTopSchools,
  getReportSummary,
  statusToCsv,
  packTypeToCsv,
  topSchoolsToCsv,
} from "@/lib/admin/reports";

export async function GET(req: NextRequest) {
  const session = await getAdminUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session, "reports.export")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sp = req.nextUrl.searchParams;
  const kind = sp.get("kind") ?? "status";
  const range = parseRange(sp.get("from") ?? undefined, sp.get("to") ?? undefined);
  const date = new Date().toISOString().slice(0, 10);

  let filename = `pexpacks-report-${date}.csv`;
  let csv = "";

  switch (kind) {
    case "summary": {
      const summary = await getReportSummary(range.from, range.to);
      csv = [
        "total_orders,paid_orders,refunded_orders,cancelled_orders,revenue,avg_order_value",
        `${summary.totalOrders},${summary.paidOrders},${summary.refundedOrders},${summary.cancelledOrders},${summary.revenue},${summary.avgOrderValue}`,
      ].join("\r\n");
      filename = `pexpacks-report-summary-${date}.csv`;
      break;
    }
    case "pack_type": {
      csv = packTypeToCsv(await getOrdersByPackType(range.from, range.to));
      filename = `pexpacks-report-pack-types-${date}.csv`;
      break;
    }
    case "schools": {
      csv = topSchoolsToCsv(await getTopSchools(range.from, range.to, 10));
      filename = `pexpacks-report-top-schools-${date}.csv`;
      break;
    }
    default: {
      csv = statusToCsv(await getOrdersByStatus(range.from, range.to));
      filename = `pexpacks-report-status-${date}.csv`;
    }
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
