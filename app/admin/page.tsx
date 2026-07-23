import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import styles from "./admin.module.css";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // Fetch orders from Supabase
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Query Error:", error.message);
  }

  const orderList = orders || [];

  return (
    <div className={styles.adminContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Pexpacks Order Management</h1>
        <p className={styles.subtitle}>
          Live orders, pre-lay-by schedules, and fulfillment statuses.
        </p>
      </div>

      {/* Orders Table Container */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Buyer &amp; School</th>
                <th>Learner &amp; Grade</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orderList.length > 0 ? (
                orderList.map((order) => (
                  <tr key={order.id}>
                    <td className={styles.orderRef}>
                      {order.order_reference}
                    </td>
                    <td>
                      <div className={styles.buyerName}>{order.buyer_name}</div>
                      <div className={styles.schoolName}>{order.school_name}</div>
                    </td>
                    <td>
                      <div className={styles.learnerName}>{order.learner_name}</div>
                      <div className={styles.gradeText}>Grade {order.grade}</div>
                    </td>
                    <td className={styles.totalPrice}>
                      R {order.estimated_total}
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          order.status === "paid"
                            ? styles.badgePaid
                            : styles.badgePending
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                /* Empty State when zero orders exist */
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyStateContainer}>
                      <div className={styles.emptyStateInner}>
                        <div className={styles.emptyIconWrapper}>
                          <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            focusable="false"
                          >
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <h2 className={styles.emptyStateTitle}>No orders yet</h2>
                        <p className={styles.emptyStateText}>
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
    </div>
  );
}
