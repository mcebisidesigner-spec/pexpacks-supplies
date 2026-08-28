"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import { QuickMetricsGrid, type QuickMetricItem } from "@/components/admin/ui/QuickMetricsGrid";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";

export interface PaymentItem {
  id: string;
  paymentId: string;
  orderNumber: string;
  date: string;
  provider: string;
  amount: number;
  status: string;
  reconciled: boolean;
}

const SEED_PAYMENTS: PaymentItem[] = [
  { id: "p-1", paymentId: "PAY-51218", orderNumber: "ORD-10528", date: "2026-05-27", provider: "Yoco", amount: 28430.00, status: "paid", reconciled: true },
  { id: "p-2", paymentId: "PAY-51217", orderNumber: "ORD-10527", date: "2026-05-26", provider: "Ozow", amount: 16230.00, status: "paid", reconciled: true },
  { id: "p-3", paymentId: "PAY-51216", orderNumber: "ORD-10526", date: "2026-05-26", provider: "EFT", amount: 35435.00, status: "pending", reconciled: false },
  { id: "p-4", paymentId: "PAY-51215", orderNumber: "ORD-10525", date: "2026-05-25", provider: "Yoco", amount: 34131.00, status: "paid", reconciled: true },
  { id: "p-5", paymentId: "PAY-51214", orderNumber: "ORD-10524", date: "2026-05-25", provider: "HappyPay", amount: 18360.00, status: "pending", reconciled: false },
  { id: "p-6", paymentId: "PAY-51213", orderNumber: "ORD-10523", date: "2026-05-24", provider: "EFT", amount: 12450.00, status: "paid", reconciled: true },
  { id: "p-7", paymentId: "PAY-51212", orderNumber: "ORD-10522", date: "2026-05-24", provider: "Ozow", amount: 28361.00, status: "paid", reconciled: true },
  { id: "p-8", paymentId: "PAY-51211", orderNumber: "ORD-10521", date: "2026-05-23", provider: "Yoco", amount: 15671.00, status: "failed", reconciled: false },
];

export function PaymentsPageView() {
  const router = useRouter();
  const { params, setParams } = useTableParams();

  const filtered = useMemo(() => {
    return SEED_PAYMENTS.filter((p) => {
      const matchSearch =
        !params.q.trim() ||
        p.paymentId.toLowerCase().includes(params.q.toLowerCase()) ||
        p.orderNumber.toLowerCase().includes(params.q.toLowerCase());

      const matchProv =
        !params.category || params.category === "all" || p.provider === params.category;

      return matchSearch && matchProv;
    });
  }, [params.q, params.category]);

  const columns: ColumnDef<PaymentItem>[] = [
    {
      key: "paymentId",
      header: "PAYMENT REF",
      sortable: true,
      width: "160px",
      render: (row) => (
        <span className={styles.skuBadge}>{row.paymentId}</span>
      ),
    },
    {
      key: "orderNumber",
      header: "ORDER REFERENCE",
      sortable: true,
      render: (row) => (
        <Link
          href={`/admin/payments/${row.orderNumber}`}
          className={styles.schoolNameTitle}
          onClick={(e) => e.stopPropagation()}
        >
          {row.orderNumber}
        </Link>
      ),
    },
    {
      key: "provider",
      header: "GATEWAY",
      sortable: true,
      width: "130px",
      render: (row) => <span className={styles.textMuted}>{row.provider}</span>,
    },
    {
      key: "date",
      header: "DATE",
      sortable: true,
      width: "130px",
      render: (row) => <span className={styles.textMuted}>{row.date}</span>,
    },
    {
      key: "amount",
      header: "AMOUNT",
      sortable: true,
      align: "right",
      width: "140px",
      render: (row) => (
        <span className={styles.priceHighlight}>
          R {row.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "130px",
      render: (row) => <StatusBadge status={row.status} showDot />,
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      sticky: "right",
      width: "80px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/payments/${row.orderNumber}`}
            className={styles.actionEditBtn}
            title={`View payment for ${row.orderNumber}`}
          >
            <Eye size={14} />
          </Link>
        </div>
      ),
    },
  ];

  const totalRev = filtered
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const paidCount = filtered.filter((p) => p.status === "paid").length;
  const pendingCount = filtered.filter((p) => p.status === "pending").length;
  const failedCount = filtered.filter((p) => p.status === "failed").length;

  const metrics: QuickMetricItem[] = [
    {
      label: "TOTAL REVENUE",
      value: `R ${totalRev.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      subtitle: "+22% vs last month",
      trendDirection: "up",
      tone: "emerald",
      icon: <ZarIcon size={16} />,
    },
    {
      label: "SETTLED ORDERS",
      value: paidCount,
      subtitle: "Instant gateway capture",
      trendDirection: "up",
      tone: "cyan",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "PENDING ESCROW",
      value: pendingCount,
      subtitle: "EFT & PayFast processing",
      trendDirection: "neutral",
      tone: "amber",
      icon: <Clock size={16} />,
    },
    {
      label: "FAILED / VOID",
      value: failedCount,
      subtitle: "Unsuccessful transactions",
      trendDirection: "down",
      tone: "red",
      icon: <XCircle size={16} />,
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Payments"
        count={filtered.length}
        subtitle="Gateway transaction reconciliation and automated payment audit logs."
        actions={
          <AdminButton
            href="/admin/payments/export"
            variant="secondary"
            icon={<Download size={14} />}
          >
            Export Ledger
          </AdminButton>
        }
      />

      <QuickMetricsGrid metrics={metrics} />

      <DataTableToolbar
        searchPlaceholder="Search payments by ref or order number..."
        filters={
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.category || "all"}
              onChange={(e) => setParams({ category: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Gateway: All</option>
              <option value="Yoco">Yoco</option>
              <option value="Ozow">Ozow</option>
              <option value="HappyPay">HappyPay</option>
              <option value="EFT">Direct EFT</option>
            </AdminSelect>
          </div>
        }
      />

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/payments/${row.orderNumber}`)}
        emptyTitle="No payments found"
        emptySubtitle="Try adjusting your search criteria."
        footer={
          <DataTablePagination
            total={filtered.length}
            pageSize={filtered.length || 25}
            currentPage={1}
          />
        }
      />
    </div>
  );
}
