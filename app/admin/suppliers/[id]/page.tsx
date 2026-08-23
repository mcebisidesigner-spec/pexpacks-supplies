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
        <Link href="/admin/suppliers" className={`${styles.secondaryBtn} ${adminStyles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Suppliers
        </Link>
      </div>

      {/* Header */}
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {title}
            <span className={adminStyles.badgeTeal}>Preferred Partner</span>
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
      <div className={adminStyles.metricsGrid4}>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>On-Time Delivery %</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconGreen}`}>
              <Truck size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${adminStyles["c-green"]}`}>98.4%</div>
          <div className={`${adminStyles["text-11"]} ${adminStyles["c-subtle"]}`}>Past 90 days performance</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Avg. Quote Response</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}>
              <Clock size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>2.1 hrs</div>
          <div className={`${adminStyles["text-11"]} ${adminStyles["c-subtle"]}`}>Turnaround speed</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Quoted Master Items</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <Building2 size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>412</div>
          <div className={`${adminStyles["text-11"]} ${adminStyles["c-subtle"]}`}>Catalogue items supplied</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Payment Terms</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconAmber}`}>
              <CreditCard size={16} />
            </div>
          </div>
          <div
            className={`${adminStyles.metricValue} ${adminStyles["text-18"]} ${adminStyles["mt-6"]} ${adminStyles["c-amber"]}`}
          >
            30 Days Net
          </div>
          <div className={`${adminStyles["text-11"]} ${adminStyles["c-subtle"]}`}>Agreed commercial term</div>
        </div>
      </div>

      {/* Detail Layout */}
      <div className={adminStyles.detailLayout}>
        <div className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles["gap-18"]}`}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Building2 size={16} className={adminStyles.iconTeal} />
                <span>Supplier Master Details</span>
              </div>
            </div>

            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Supplier Name:</span>
                <span className={adminStyles.sidebarStatVal}>{title}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Category:</span>
                <span className={adminStyles.sidebarStatVal}>Stationery & Paper</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Procurement Email:</span>
                <span className={`${adminStyles.sidebarStatVal} ${adminStyles["c-blue"]}`}>orders@{id}.co.za</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Standard Lead Time:</span>
                <span className={adminStyles.sidebarStatVal}>2 - 3 business days</span>
              </div>
            </div>
          </div>
        </div>

        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Phone size={16} className={adminStyles.iconTeal} />
                <span>Primary Contacts</span>
              </div>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Account Manager:</span>
              <span className={adminStyles.sidebarStatVal}>Sarah Jenkins</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Phone:</span>
              <span className={adminStyles.sidebarStatVal}>+27 11 987 6543</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
