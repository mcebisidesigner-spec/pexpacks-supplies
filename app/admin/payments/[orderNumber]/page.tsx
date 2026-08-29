import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getOrder } from "@/lib/admin/orders";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface PaymentDetailPageProps {
  params: Promise<{ orderNumber: string }>;
}

function money(value: number | null | undefined): string {
  return `R ${Number(value ?? 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gatewayLabel(value: string | null | undefined): string {
  if (!value) return "Pending";
  if (value.toLowerCase() === "ozow") return "Ozow Instant EFT";
  return value;
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  await requireAdmin({ permission: "payments.view" });
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) {
    notFound();
  }

  const gatewayReference = order.gateway_reference ?? order.payment_reference ?? "Pending gateway reference";
  const paid = Boolean(order.paid_at) || order.status === "paid";

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/payments"
        backLabel="Back to Payments"
        title={`Payment: ${order.order_reference}`}
        subtitle={`Gateway Ref: ${gatewayReference} - ${gatewayLabel(order.payment_gateway)}`}
        actions={<StatusBadge status={order.status} showDot />}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <MetricCard
          label="Order Amount"
          value={money(order.estimated_total)}
          subtext={paid ? `Paid ${formatDateTime(order.paid_at)}` : "Awaiting payment confirmation"}
          icon={<ZarIcon size={16} />}
          iconTone={paid ? "green" : "amber"}
        />
        <MetricCard
          label="Gateway"
          value={gatewayLabel(order.payment_gateway)}
          subtext={gatewayReference}
          icon={<CreditCard size={16} />}
          iconTone="blue"
        />
        <MetricCard
          label="Payment Status"
          value={paid ? "Paid" : order.status}
          subtext="Synced from orders/payment pipeline"
          icon={<CheckCircle2 size={16} />}
          iconTone={paid ? "green" : "amber"}
        />
        <MetricCard
          label="Audit State"
          value={paid ? "Verified" : "Pending"}
          subtext="Webhook-locked commercial snapshot"
          icon={<ShieldCheck size={16} />}
          iconTone={paid ? "green" : "blue"}
        />
      </div>

      <div className={adminStyles.detailBodyGrid}>
        <div className={adminStyles.detailBodyMain}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CreditCard size={16} className={adminStyles.iconTeal} />
                <span>Transaction Metadata &amp; Order Confirmation</span>
              </div>
            </div>

            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Order Reference:</span>
                <span className={adminStyles.sidebarStatVal}>{order.order_reference}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Payment Method:</span>
                <span className={adminStyles.sidebarStatVal}>{gatewayLabel(order.payment_gateway)}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Payer Name:</span>
                <span className={adminStyles.sidebarStatVal}>{order.buyer_name || "-"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Customer Email:</span>
                <span className={adminStyles.sidebarStatVal}>{order.buyer_email || "-"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>School:</span>
                <span className={adminStyles.sidebarStatVal}>{order.school_name || "-"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Grade:</span>
                <span className={adminStyles.sidebarStatVal}>{order.grade || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}