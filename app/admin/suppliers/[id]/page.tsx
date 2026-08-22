import Link from "next/link";
import { ArrowLeft, Building2, Clock, CreditCard, Edit2, Mail, Phone, Save, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface SupplierDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  await requireAdmin({ permission: "suppliers.view" });
  const { id } = await params;

  const title = id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div>
        <Link href="/admin/suppliers" className={`${styles.secondaryBtn} ${styles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Suppliers
        </Link>
      </div>

      {/* Header */}
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {title}
            <span className={styles.badgeTeal}>Preferred Partner</span>
          </h1>
          <p className={styles.headerSubtitle}>Supplier Code: SUP-{id.toUpperCase().slice(0, 8)}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/admin/suppliers/${id}/edit`} className={styles.primaryBtn}>
            <Edit2 size={14} /> Edit Supplier
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={styles.metricsGrid4}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>On-Time Delivery %</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconGreen}`}>
              <Truck size={16} />
            </div>
          </div>
          <div className={`${styles.metricValue} ${styles["c-green"]}`}>98.4%</div>
          <div className={`${styles["text-11"]} ${styles["c-subtle"]}`}>Past 90 days performance</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Avg. Quote Response</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconBlue}`}>
              <Clock size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>2.1 hrs</div>
          <div className={`${styles["text-11"]} ${styles["c-subtle"]}`}>Turnaround speed</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Quoted Master Items</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <Building2 size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>412</div>
          <div className={`${styles["text-11"]} ${styles["c-subtle"]}`}>Catalogue items supplied</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Payment Terms</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconAmber}`}>
              <CreditCard size={16} />
            </div>
          </div>
          <div
            className={`${styles.metricValue} ${styles["text-18"]} ${styles["mt-6"]} ${styles["c-amber"]}`}
          >
            30 Days Net
          </div>
          <div className={`${styles["text-11"]} ${styles["c-subtle"]}`}>Agreed commercial term</div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className={styles.detailLayout}>
        <div className={`${styles.flex} ${styles["flex-col"]} ${styles["gap-18"]}`}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Building2 size={16} className={styles.iconTeal} />
                <span>Supplier Master Details</span>
              </div>
            </div>

            <div className={styles["grid-2equal"]}>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Supplier Name:</span>
                <span className={styles.sidebarStatVal}>{title}</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Category:</span>
                <span className={styles.sidebarStatVal}>Stationery & Paper</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Procurement Email:</span>
                <span className={`${styles.sidebarStatVal} ${styles["c-blue"]}`}>orders@{id}.co.za</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Standard Lead Time:</span>
                <span className={styles.sidebarStatVal}>2 - 3 business days</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Phone size={16} className={styles.iconTeal} />
                <span>Primary Contacts</span>
              </div>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Account Manager:</span>
              <span className={styles.sidebarStatVal}>Sarah Jenkins</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Phone:</span>
              <span className={styles.sidebarStatVal}>+27 11 987 6543</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
