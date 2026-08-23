import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, DollarSign, RefreshCw, ShieldCheck, User } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
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
      {/* Breadcrumb */}
      <div>
        <Link href="/admin/payments" className={`${styles.secondaryBtn} ${adminStyles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Payments
        </Link>
      </div>

      {/* Header */}
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Payment {orderNumber}
            <span className={adminStyles.badgeGreen}>● Received &amp; Reconciled</span>
          </h1>
          <p className={styles.headerSubtitle}>Payment Ref: PAY-51218 • Ozow Instant EFT</p>
        </div>
        <div className={styles.headerActions}>
          <form action="/admin/payments" method="GET" className={`${adminStyles.flex} ${adminStyles.gap8}`}>
            <select name="status" defaultValue="Paid" className={adminStyles.selectField}>
              <option value="Paid">Status: Paid</option>
              <option value="Pending">Status: Pending</option>
              <option value="Refunded">Status: Refunded</option>
              <option value="Chargeback">Status: Chargeback</option>
            </select>
            <button type="submit" className={`${styles.primaryBtn} ${adminStyles.h36}`}>
              <RefreshCw size={13} /> Update Status
            </button>
          </form>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className={adminStyles.metricsGrid4}>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Total Amount Paid</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconGreen}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>R 28,430.00</div>
          <div className={adminStyles.metricSub}>Settled via Ozow</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Gateway Provider</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}>
              <CreditCard size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${adminStyles.text18} ${adminStyles.mt4}`}>Ozow Instant EFT</div>
          <div className={adminStyles.metricSub}>Ref: OZ-984218-EFT</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Reconciliation Status</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${adminStyles.cGreen}`}>Reconciled</div>
          <div className={adminStyles.metricSub}>Matched with Nedbank settlement</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Transaction Date</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconPurple}`}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${styles.metricValueDate}`}>May 27, 2024</div>
          <div className={adminStyles.metricSub}>14:32:08 SAST</div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className={adminStyles.detailLayout}>
        <div className={`${adminStyles.flex} ${adminStyles["flex-col"]} ${adminStyles.gap18}`}>
          {/* Payer Details */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <User size={16} className={adminStyles.iconTeal} />
                <span>Payer &amp; Customer Information</span>
              </div>
            </div>

            <div className={adminStyles.grid2equal}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Full Name:</span>
                <span className={adminStyles.sidebarStatVal}>Liam Morgan</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Email:</span>
                <span className={`${adminStyles.sidebarStatVal} ${adminStyles.iconBlue}`}>liam@pexpacks.co.za</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Phone Number:</span>
                <span className={adminStyles.sidebarStatVal}>+27 82 123 4567</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Learner Name:</span>
                <span className={adminStyles.sidebarStatVal}>Ethan Morgan</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Grade:</span>
                <span className={adminStyles.sidebarStatVal}>Grade 4</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Associated School:</span>
                <span className={adminStyles.sidebarStatVal}>3d Christian Academy</span>
              </div>
            </div>
          </div>

          {/* Line Items Summary */}
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.sectionHeader}>
              Purchased Items &amp; Fees Breakdown
            </div>
            <div className={adminStyles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ITEM DESCRIPTION</th>
                    <th>QTY</th>
                    <th>UNIT PRICE</th>
                    <th>TOTAL PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.dataRow}>
                    <td><strong className={adminStyles.cWhite}>3d Christian Academy - Grade 4 Stationery Pack</strong></td>
                    <td>1</td>
                    <td>R 28,400.00</td>
                    <td><strong className={adminStyles.cWhite}>R 28,400.00</strong></td>
                  </tr>
                  <tr className={styles.dataRow}>
                    <td><strong className={adminStyles.cWhite}>Pexcover Protection Add-on</strong></td>
                    <td>1</td>
                    <td>R 30.00</td>
                    <td><strong className={adminStyles.cWhite}>R 30.00</strong></td>
                  </tr>
                  <tr className={styles.dataRow}>
                    <td><strong className={adminStyles.cTeal}>Delivery Fee (School Bulk Fulfilment)</strong></td>
                    <td>1</td>
                    <td>FREE</td>
                    <td><strong className={adminStyles.cGreen}>R 0.00</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Gateway Details */}
        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <CreditCard size={16} className={adminStyles.iconTeal} />
                <span>Gateway &amp; Settlement</span>
              </div>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Provider:</span>
              <span className={adminStyles.sidebarStatVal}>Ozow Instant EFT</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Gateway Ref:</span>
              <span className={`${adminStyles.sidebarStatVal} ${adminStyles.inputFieldMono} ${styles.text11}`}>OZ-984218-EFT</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Settlement Bank:</span>
              <span className={adminStyles.sidebarStatVal}>Nedbank SA</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Reconciliation:</span>
              <span className={adminStyles.badgeGreen}>Matched</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}