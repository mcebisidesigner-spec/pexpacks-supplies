import { requireAdmin, displayName } from "@/lib/admin/rbac";
import { getDashboardStats } from "@/lib/admin/dashboard";
import {
  StatCard,
  VerticalBars,
  HorizontalBars,
} from "@/components/admin/dashboard";
import { AdminIcon } from "@/components/admin/icons";
import { formatCurrency } from "@/lib/formatCurrency";
import adminStyles from "./admin.module.css";
import styles from "@/components/admin/dashboard.module.css";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

const ORDER_STATUS_BADGE: Record<string, string> = {
  paid: adminStyles.badgePaid,
  pending_payment: adminStyles.badgePending,
  cancelled: adminStyles.badgePending,
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin({ permission: "dashboard.view" });
  const stats = await getDashboardStats();
  const name = displayName(session.user);

  return (
    <div className={adminStyles.adminContainer}>
      <header className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Dashboard</h1>
        <p className={adminStyles.subtitle}>
          Live overview of schools, packs, orders and revenue.
        </p>
        <p className={adminStyles.signedInAs}>Signed in as {name}</p>
      </header>

      <section className={styles.statsGrid} aria-label="Key statistics">
        <StatCard
          label="Total Schools"
          value={stats.schools.total}
          hint={`${stats.schools.featured} featured`}
          icon="school"
          badge="Schools"
        />
        <StatCard
          label="Featured Schools"
          value={stats.schools.featured}
          hint={`${stats.schools.partner} partners`}
          icon="star"
          tone="coral"
        />
        <StatCard
          label="Pending Schools"
          value={stats.schools.pending}
          hint="Awaiting approval"
          icon="clock"
          tone="navy"
        />
        <StatCard
          label="Total Packs"
          value={stats.packs}
          icon="pack"
          badge="Packs"
        />
        <StatCard
          label="Total Orders"
          value={stats.orders.total}
          hint={`${stats.orders.thisMonth} this month`}
          icon="orders"
          badge="Orders"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.orders.revenue)}
          hint="Paid orders"
          icon="wallet"
          tone="coral"
        />
        <StatCard label="Users" value={stats.users} icon="users" tone="navy" />
        <StatCard
          label="Assets"
          value={stats.assets.total}
          hint={formatBytes(stats.assets.sizeBytes)}
          icon="image"
        />
      </section>

      <section className={styles.chartGrid} aria-label="Order and revenue charts">
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Orders</h2>
          <p className={styles.cardSubtitle}>Last 30 days</p>
          <VerticalBars
            data={stats.ordersDaily.map((d) => ({ label: d.day, value: d.orders }))}
          />
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Revenue</h2>
          <p className={styles.cardSubtitle}>Last 30 days · paid orders</p>
          <VerticalBars
            data={stats.ordersDaily.map((d) => ({ label: d.day, value: d.revenue }))}
            formatValue={formatCurrency}
            tone="coral"
          />
        </div>
      </section>

      <section className={styles.chartGrid} aria-label="Breakdowns">
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Schools by City</h2>
          <p className={styles.cardSubtitle}>Top 6 districts</p>
          <HorizontalBars
            data={stats.schoolsByCity.map((d) => ({ label: d.label, count: d.count }))}
            emptyText="No school data in the database yet."
          />
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Popular Packs</h2>
          <p className={styles.cardSubtitle}>Orders by pack type</p>
          <HorizontalBars
            data={stats.ordersByPackType.map((d) => ({
              label: d.label,
              count: d.count,
            }))}
            tone="coral"
            emptyText="No orders yet."
          />
        </div>
      </section>

      <section className={styles.card} aria-label="Recent orders">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <h2 className={styles.cardTitle}>Recent Orders</h2>
          <span className={adminStyles.signedInAs} style={{ marginTop: 0 }}>
            {stats.orders.total} total
          </span>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Buyer</th>
                  <th>School</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className={adminStyles.orderRef}>{order.order_reference}</td>
                      <td className={adminStyles.buyerName}>{order.buyer_name}</td>
                      <td className={adminStyles.schoolName}>{order.school_name}</td>
                      <td className={adminStyles.totalPrice}>
                        {order.estimated_total != null
                          ? formatCurrency(order.estimated_total)
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`${adminStyles.badge} ${
                            ORDER_STATUS_BADGE[order.status] ?? ""
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className={adminStyles.emptyStateContainer}>
                        <div className={adminStyles.emptyStateInner}>
                          <div className={adminStyles.emptyIconWrapper}>
                            <AdminIcon name="orders" size={28} />
                          </div>
                          <h2 className={adminStyles.emptyStateTitle}>No orders yet</h2>
                          <p className={adminStyles.emptyStateText}>
                            When parents complete checkout, their orders will populate here automatically.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
