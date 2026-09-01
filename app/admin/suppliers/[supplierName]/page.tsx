import { Building2, Clock, CreditCard, Edit2, Truck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSupplierBySlug } from "@/lib/admin/suppliers";
import {
  supplierCodeFromSlug,
  supplierEmailFromSlug,
  supplierNameFromSlug,
} from "@/lib/admin/supplier-slug";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface SupplierDetailPageProps {
  params: Promise<{ supplierName: string }>;
}

export default async function SupplierDetailPage({
  params,
}: SupplierDetailPageProps) {
  await requireAdmin({ permission: "suppliers.view" });
  const { supplierName } = await params;

  const row = await getSupplierBySlug(supplierName);
  const name = row?.name ?? supplierNameFromSlug(supplierName);
  const code = row?.code ?? supplierCodeFromSlug(supplierName);
  const email = row?.email ?? supplierEmailFromSlug(supplierName);
  const contactName = row?.contact_name ?? "Account Representative";
  const telephone = row?.telephone ?? "+27 11 000 0000";
  const paymentTerms = row?.payment_terms ?? "30 Days Net";
  const leadTimeDays =
    row?.lead_time_days != null ? String(row.lead_time_days) : "3";
  const active = row?.active ?? true;

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title={name}
        subtitle={`Supplier Code: ${code}`}
        backHref="/admin/suppliers"
        backLabel="Back to Suppliers"
        actions={
          <div className={styles.headerActions}>
            <StatusBadge
              status={active ? "Preferred Partner" : "Prospect"}
              tone={active ? "emerald" : "amber"}
              showDot
            />
            <AdminButton
              href={`/admin/suppliers/${supplierName}/edit`}
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
          value={paymentTerms}
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
                <span className={adminStyles.sidebarStatLabel}>
                  Company Name:
                </span>
                <span className={adminStyles.sidebarStatVal}>{name}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Primary Contact:
                </span>
                <span className={adminStyles.sidebarStatVal}>
                  {contactName}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Primary Email:
                </span>
                <span className={adminStyles.sidebarStatVal}>{email}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Telephone:</span>
                <span className={adminStyles.sidebarStatVal}>{telephone}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Payment Terms:
                </span>
                <span className={adminStyles.sidebarStatVal}>
                  {paymentTerms}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Standard Lead Time:
                </span>
                <span className={adminStyles.sidebarStatVal}>
                  {leadTimeDays} days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
