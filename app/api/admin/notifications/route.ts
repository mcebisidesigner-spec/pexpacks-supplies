import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser, hasPermission } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

interface NotificationCounts {
  orders_today: number;
  pending_payments: number;
  failed_payments: number;
  awaiting_fulfilment: number;
  pending_schools: number;
  procurement_outstanding: number;
  open_tasks: number;
  generated_at: string;
}

function johannesburgDayStart() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return new Date(
    `${value.year}-${value.month}-${value.day}T00:00:00+02:00`,
  ).toISOString();
}

const readNotificationCounts = unstable_cache(
  async (): Promise<NotificationCounts> => {
    const admin = createSupabaseAdminClient();
    const [
      today,
      pendingPayments,
      failedPayments,
      fulfilment,
      schools,
      procurement,
      tasks,
    ] = await Promise.all([
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", johannesburgDayStart()),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending_payment", "pending"]),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "payment_failed"),
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["paid", "packing"]),
      admin
        .from("schools")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      admin
        .from("procurement_requirements" as never)
        .select("required_quantity,secured_quantity"),
      admin
        .from("operational_tasks" as never)
        .select("id", { count: "exact", head: true })
        .in("status", ["open", "in_progress", "blocked"]),
    ]);

    const failures = [
      today,
      pendingPayments,
      failedPayments,
      fulfilment,
      schools,
    ]
      .map((result) => result.error?.message)
      .filter(Boolean);
    if (failures.length)
      console.error("[admin-notifications] count query failed:", failures);

    return {
      orders_today: today.count ?? 0,
      pending_payments: pendingPayments.count ?? 0,
      failed_payments: failedPayments.count ?? 0,
      awaiting_fulfilment: fulfilment.count ?? 0,
      pending_schools: schools.count ?? 0,
      procurement_outstanding: (
        (procurement.data ?? []) as Array<{
          required_quantity: number;
          secured_quantity: number;
        }>
      ).reduce(
        (sum, row) =>
          sum +
          Math.max(
            Number(row.required_quantity) - Number(row.secured_quantity),
            0,
          ),
        0,
      ),
      open_tasks: tasks.count ?? 0,
      generated_at: new Date().toISOString(),
    };
  },
  ["admin-operational-notifications"],
  { revalidate: 10 },
);

export async function GET() {
  const session = await getAdminUser();
  if (!session || (!session.isSuperAdmin && session.roles.length === 0)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const counts = await readNotificationCounts();
  const canViewOrders = hasPermission(session, "orders.view");
  const canViewPayments = hasPermission(session, "payments.view");
  const canViewSchools = hasPermission(session, "schools.view");
  const canViewProcurement = hasPermission(session, "procurement.view");
  const canViewTasks = hasPermission(session, "tasks.view");

  return NextResponse.json(
    {
      orders_today: canViewOrders ? counts.orders_today : 0,
      pending_payments:
        canViewPayments || canViewOrders ? counts.pending_payments : 0,
      failed_payments:
        canViewPayments || canViewOrders ? counts.failed_payments : 0,
      awaiting_fulfilment: canViewOrders ? counts.awaiting_fulfilment : 0,
      pending_schools: canViewSchools ? counts.pending_schools : 0,
      procurement_outstanding: canViewProcurement
        ? counts.procurement_outstanding
        : 0,
      open_tasks: canViewTasks ? counts.open_tasks : 0,
      generated_at: counts.generated_at,
    } satisfies NotificationCounts,
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
