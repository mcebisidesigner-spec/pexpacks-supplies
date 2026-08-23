import { CheckCircle2, CreditCard, RefreshCw, ShieldCheck, User } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface PaymentDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  await requireAdmin({ permission: "payments.view" });
  const { orderNumber } = await params;

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/payments"
        backLabel="Back to Payments"
        title={`Payment: ${orderNumber}`}
        subtitle="Gateway Ref: PAY-51218 • Ozow Instant EFT Settlement"
        actions={<StatusBadge status="paid" showDot />}
      />

      {/* 4 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <MetricCard
          label="Total Amount Paid"
          value="R 28,430.00"
          subtext="Settled via Ozow"
          icon={<ZarIcon size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Processing Fee"
          value="R 426.45"
          subtext="1.5% + R0.00 rate"
          icon={<CreditCard size={16} />}
          iconTone="blue"
        />
        <MetricCard
          label="Net Payout"
          value="R 28,003.55"
          subtext="Deposited to FNB"
          icon={<CheckCircle2 size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Fraud Risk Assessment"
          value="Passed"
          subtext="3D-Secure 2.0 Auth"
          icon={<ShieldCheck size={16} />}
          iconTone="green"
        />
      </div>

      <div className={adminStyles.detailBodyGrid}>
        <div className={adminStyles.detailBodyMain}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CreditCard size={16} className={adminStyles.iconTeal} />
                <span>Transaction Metadata &amp; Bank Confirmation</span>
              </div>
            </div>

            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Order Reference:</span>
                <span className={adminStyles.sidebarStatVal}>{orderNumber}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Payment Method:</span>
                <span className={adminStyles.sidebarStatVal}>Ozow Instant EFT</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Payer Name:</span>
                <span className={adminStyles.sidebarStatVal}>Liam Morgan</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Originating Bank:</span>
                <span className={adminStyles.sidebarStatVal}>Capitec Bank Ltd</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}