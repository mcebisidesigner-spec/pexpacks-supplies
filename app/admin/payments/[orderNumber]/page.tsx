import Link from "next/link";
import { ArrowLeft, CheckCircle2, CreditCard, DollarSign, RefreshCw, ShieldCheck, User } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
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
        <Link href="/admin/payments" className={`${styles.secondaryBtn} ${styles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to Payments
        </Link>
      </div>

      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            Payment {orderNumber}
            <span className={styles.badgeGreen}>● Received &amp; Reconciled</span>
          </h1>
          <p className={styles.headerSubtitle}>Payment Ref: PAY-51218 • Ozow Instant EFT</p>
        </div>
        <div className={styles.headerActions}>
          <form action="/admin/payments" method="GET" className={`${styles.flex} ${styles.gap8}`}>
            <select name="status" defaultValue="Paid" className={styles.selectField}>
              <option value="Paid">Status: Paid</option>
              <option value="Pending">Status: Pending</option>
              <option value="Refunded">Status: Refunded</option>
              <option value="Chargeback">Status: Chargeback</option>
            </select>
            <button type="submit" className={`${styles.primaryBtn} ${styles.h36}`}>
              <RefreshCw size={13} /> Update Status
            </button>
          </form>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className={styles.metricsGrid4}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Total Amount Paid</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconGreen}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>R 28,430.00</div>
          <div className={styles.metricSub}>Settled via Ozow</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Gateway Provider</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconBlue}`}>
              <CreditCard size={16} />
            </div>
          </div>
          <div className={`${styles.metricValue} ${styles.text18} ${styles.mt4}`}>Ozow Instant EFT</div>
          <div className={styles.metricSub}>Ref: OZ-984218-EFT</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Reconciliation Status</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className={`${styles.metricValue} ${styles.cGreen}`}>Reconciled</div>
          <div className={styles.metricSub}>Matched with Nedbank settlement</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Transaction Date</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconPurple}`}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className={`${styles.metricValue} ${styles.metricValueDate}`}>May 27, 2024</div>
          <div className={styles.metricSub}>14:32:08 SAST</div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className={styles.detailLayout}>
        <div className={`${styles.flex} ${styles["flex-col"]} ${styles.gap18}`}>
          {/* Payer Details */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <User size={16} className={styles.iconTeal} />
                <span>Payer &amp; Customer Information</span>
              </div>
            </div>

            <div className={styles.grid2equal}>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Full Name:</span>
                <span className={styles.sidebarStatVal}>Liam Morgan</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Email:</span>
                <span className={`${styles.sidebarStatVal} ${styles.iconBlue}`}>liam@pexpacks.co.za</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Phone Number:</span>
                <span className={styles.sidebarStatVal}>+27 82 123 4567</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Learner Name:</span>
                <span className={styles.sidebarStatVal}>Ethan Morgan</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Grade:</span>
                <span className={styles.sidebarStatVal}>Grade 4</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Associated School:</span>
                <span className={styles.sidebarStatVal}>3d Christian Academy</span>
              </div>
            </div>
          </div>

          {/* Line Items Summary */}
          <div className={styles.tableCard}>
            <div className={styles.sectionHeader}>
              Purchased Items &amp; Fees Breakdown
            </div>
            <div className={styles.tableWrapper}>
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
                    <td><strong className={styles.cWhite}>3d Christian Academy - Grade 4 Stationery Pack</strong></td>
                    <td>1</td>
                    <td>R 28,400.00</td>
                    <td><strong className={styles.cWhite}>R 28,400.00</strong></td>
                  </tr>
                  <tr className={styles.dataRow}>
                    <td><strong className={styles.cWhite}>Pexcover Protection Add-on</strong></td>
                    <td>1</td>
                    <td>R 30.00</td>
                    <td><strong className={styles.cWhite}>R 30.00</strong></td>
                  </tr>
                  <tr className={styles.dataRow}>
                    <td><strong className={styles.cTeal}>Delivery Fee (School Bulk Fulfilment)</strong></td>
                    <td>1</td>
                    <td>FREE</td>
                    <td><strong className={styles.cGreen}>R 0.00</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Gateway Details */}
        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <CreditCard size={16} className={styles.iconTeal} />
                <span>Gateway &amp; Settlement</span>
              </div>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Provider:</span>
              <span className={styles.sidebarStatVal}>Ozow Instant EFT</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Gateway Ref:</span>
              <span className={`${styles.sidebarStatVal} ${styles.inputFieldMono} ${styles.text11}`}>OZ-984218-EFT</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Settlement Bank:</span>
              <span className={styles.sidebarStatVal}>Nedbank SA</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Reconciliation:</span>
              <span className={styles.badgeGreen}>Matched</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}