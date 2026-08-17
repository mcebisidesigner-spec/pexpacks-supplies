import { requireAdmin } from "@/lib/admin/rbac";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { getOperationsSummary } from "@/lib/admin/operations";
import DashboardClient from "@/components/admin/DashboardClient";
import styles from "./operations.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin({ permission: "dashboard.view" });
  const [stats, operations] = await Promise.all([
    getDashboardStats(),
    getOperationsSummary().catch(() => null),
  ]);
  return (
    <>
      {operations ? (
        <section className={styles.page} aria-label="Operations control tower">
          <header className={styles.header}>
            <div>
              <h1>Operations Control Tower</h1>
              <p>
                Paid demand, procurement readiness and work requiring attention.
              </p>
            </div>
          </header>
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <span>Paid orders</span>
              <strong>{operations.paidOrders}</strong>
            </div>
            <div className={styles.kpi}>
              <span>Revenue received</span>
              <strong>R {operations.revenueReceived.toFixed(2)}</strong>
            </div>
            <div className={styles.kpi}>
              <span>Procurement outstanding</span>
              <strong>{operations.procurementOutstanding}</strong>
            </div>
            <div className={styles.kpi}>
              <span>Ready to pack</span>
              <strong>{operations.readyToPack}</strong>
            </div>
          </div>
          <div className={styles.kpis}>
            <div className={styles.kpi}>
              <span>Deadline risks</span>
              <strong>{operations.deadlineRisks}</strong>
            </div>
            <div className={styles.kpi}>
              <span>Pricing exceptions</span>
              <strong>{operations.pricingExceptions}</strong>
            </div>
            <div className={styles.kpi}>
              <span>Open tasks</span>
              <strong>{operations.openTasks}</strong>
            </div>
            <div className={styles.kpi}>
              <span>Demand model</span>
              <strong>Paid only</strong>
            </div>
          </div>
        </section>
      ) : null}
      <DashboardClient stats={stats} />
    </>
  );
}
