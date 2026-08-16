import styles from "@/components/admin/DashboardClient.module.css";

const METRIC_PLACEHOLDERS = ["Revenue", "Orders", "Payments", "Fulfilment"];

export default function AdminDashboardLoading() {
  return (
    <div className={styles.loadingRoot} aria-busy="true" aria-label="Loading dashboard">
      <div className={styles.loadingHeader}>
        <span className={styles.loadingLineShort} />
        <span className={styles.loadingTitle} />
        <span className={styles.loadingLine} />
      </div>

      <div className={styles.loadingTabs} aria-hidden="true">
        <span />
        <span />
      </div>

      <div className={styles.primaryMetrics} aria-hidden="true">
        {METRIC_PLACEHOLDERS.map((label) => (
          <div className={styles.loadingMetric} key={label}>
            <span className={styles.loadingLineShort} />
            <span className={styles.loadingValue} />
            <span className={styles.loadingLine} />
          </div>
        ))}
      </div>

      <div className={styles.loadingPanels} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
