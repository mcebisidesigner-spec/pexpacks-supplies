import { ArrowLeft, Building2, Clock, CreditCard, Edit2, Mail, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
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
      <AdminPageHeader
        title={title}
        subtitle={`Supplier Code: SUP-${id.toUpperCase().slice(0, 8)}`}
        actions={
          <div className={styles.headerActions}>
            <StatusBadge status="Preferred Partner" tone="emerald" showDot />
            <AdminButton
              href="/admin/suppliers"
              variant="secondary"
              icon={<ArrowLeft size={14} />}
            >
              Back to Suppliers
            </AdminButton>
            <AdminButton
              href={`/admin/suppliers/${id}/edit`}
              variant="primary"
              icon={<Edit2 size={14} />}
            >
              Edit Supplier
            </AdminButton>
          </div>
        }
      />

      {/* Metrics Grid */}
      <div className={styles.kpiGrid}>
        <MetricCard
          label="On-Time Delivery %"
          value="98.4%"
          subtext="Past 90 days fulfillment"
          icon={<Truck size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Avg. Response"
          value="2.4 hrs"
          subtext="Price update turnaround"
          icon={<Clock size={16} />}
          iconTone="blue"
        />
        <MetricCard
          label="Active Catalogue"
          value="1,420 Items"
          subtext="Indexed stationery lines"
          icon={<Building2 size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Payment Terms"
          value="30 Days Net"
          subtext="Trade credit account"
          icon={<CreditCard size={16} />}
          iconTone="amber"
        />
      </div>

      <div className={adminStyles.detailBodyGrid}>
        <div className={adminStyles.detailBodyMain}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Building2 size={16} className={adminStyles.iconTeal} />
                <span>Supplier Overview</span>
              </div>
            </div>

            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Company Name:</span>
                <span className={adminStyles.sidebarStatVal}>{title}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Registration / VAT:</span>
                <span className={adminStyles.sidebarStatVal}>4920182749</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Primary Email:</span>
                <span className={adminStyles.sidebarStatVal}>orders@{id.toLowerCase()}.co.za</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Warehouse City:</span>
                <span className={adminStyles.sidebarStatVal}>Johannesburg, Gauteng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
