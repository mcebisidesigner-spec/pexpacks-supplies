import Link from "next/link";
import { requireAdmin, hasPermission } from "@/lib/admin/rbac";
import {
  parseRange,
  getReportSummary,
  getOrdersByStatus,
  getOrdersByPackType,
  getTopSchools,
} from "@/lib/admin/reports";
import { orderStatusLabel } from "@/lib/admin/order-constants";
import { DateField } from "@/components/admin/DateField";
import adminStyles from "../admin.module.css";
import styles from "./reports.module.css";

export const metadata = {
  title: "Reports | Admin | Pexpacks",
};

const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

function exportHref(kind: string, from: string, to: string): string {
  return `/admin/reports/export?kind=${kind}&from=${from}&to=${to}`;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await requireAdmin({ permission: "reports.view" });
  const params = await searchParams;
  const range = parseRange(params.from, params.to);
  const canExport = hasPermission(session, "reports.export");

  const [summary, statusRows, packTypeRows, topSchools] = await Promise.all([
    getReportSummary(range.from, range.to),
    getOrdersByStatus(range.from, range.to),
    getOrdersByPackType(range.from, range.to),
    getTopSchools(range.from, range.to, 10),
  ]);

  const stats = [
    {
      label: "Total orders",
      value: String(summary.totalOrders),
      help: "All statuses",
    },
    {
      label: "Paid",
      value: String(summary.paidOrders),
      help: "Completed orders",
    },
    {
      label: "Refunded",
      value: String(summary.refundedOrders),
      help: "Refunded orders",
    },
    {
      label: "Cancelled",
      value: String(summary.cancelledOrders),
      help: "Cancelled orders",
    },
    {
      label: "Revenue",
      value: currency.format(summary.revenue),
      help: "Paid orders only",
    },
    {
      label: "Avg order value",
      value: currency.format(summary.avgOrderValue),
      help: "Paid orders only",
    },
  ];

  return (
    <div className={adminStyles.adminContainer}>
      <div className={styles.toolbar}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.pageTitle}>Reports</h1>
            <p className={styles.subtitle}>
              Order performance for the selected date range. Defaults to the
              last 30 days.
            </p>
          </div>
        </div>

        <form
          method="get"
          action="/admin/reports"
          className={styles.filterForm}
        >
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="from">
              From
            </label>
            <DateField
              id="from"
              name="from"
              className={styles.filterInput}
              defaultValue={range.from}
              ariaLabel="Report start date"
              placeholder="Start date"
            />
          </div>
          <div className={styles.filterField}>
            <label className={styles.filterLabel} htmlFor="to">
              To
            </label>
            <DateField
              id="to"
              name="to"
              className={styles.filterInput}
              defaultValue={range.to}
              ariaLabel="Report end date"
              placeholder="End date"
            />
          </div>
          <button type="submit" className={styles.applyButton}>
            Run report
          </button>
          <Link href="/admin/reports" className={styles.resetLink}>
            Reset
          </Link>
        </form>
      </div>

      <div className={styles.statGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value}</div>
            <p className={styles.statHelp}>{s.help}</p>
          </div>
        ))}
      </div>

      <div className={styles.stack}>
        <section className={adminStyles.tableCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Orders by status</h2>
            {canExport ? (
              <a
                href={exportHref("status", range.from, range.to)}
                className={styles.exportLink}
              >
                Export CSV
              </a>
            ) : null}
          </div>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {statusRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.rangeNote}>
                      No orders in this range.
                    </td>
                  </tr>
                ) : (
                  statusRows.map((row) => (
                    <tr key={row.status}>
                      <td>{orderStatusLabel(row.status)}</td>
                      <td>{row.orderCount}</td>
                      <td>{currency.format(row.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={adminStyles.tableCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Orders by pack type</h2>
            {canExport ? (
              <a
                href={exportHref("pack_type", range.from, range.to)}
                className={styles.exportLink}
              >
                Export CSV
              </a>
            ) : null}
          </div>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>Pack type</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {packTypeRows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className={styles.rangeNote}>
                      No orders in this range.
                    </td>
                  </tr>
                ) : (
                  packTypeRows.map((row) => (
                    <tr key={row.packType}>
                      <td>{row.packType}</td>
                      <td>{row.orderCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={adminStyles.tableCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top schools</h2>
            {canExport ? (
              <a
                href={exportHref("schools", range.from, range.to)}
                className={styles.exportLink}
              >
                Export CSV
              </a>
            ) : null}
          </div>
          <div className={adminStyles.tableWrapper}>
            <table className={adminStyles.table}>
              <thead>
                <tr>
                  <th>School</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSchools.length === 0 ? (
                  <tr>
                    <td colSpan={3} className={styles.rangeNote}>
                      No school orders in this range.
                    </td>
                  </tr>
                ) : (
                  topSchools.map((row) => (
                    <tr key={row.schoolName}>
                      <td>{row.schoolName}</td>
                      <td>{row.orderCount}</td>
                      <td>{currency.format(row.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
