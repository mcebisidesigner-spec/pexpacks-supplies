"use client";

import React from "react";
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
import type { PaymentListResult, OrderRow } from "@/lib/admin/payments";

interface PaymentsPageViewProps {
  initialData: PaymentListResult;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-ZA");
}

function formatMoney(value: number | null | undefined): string {
  return `R ${Number(value ?? 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function paymentRef(row: OrderRow): string {
  return row.gateway_reference || row.payment_reference || row.order_reference || row.id;
}

function providerLabel(value: string | null | undefined): string {
  if (!value) return "Pending";
  if (value.toLowerCase() === "ozow") return "Ozow";
  return value;
}

export function PaymentsPageView({ initialData }: PaymentsPageViewProps) {
  const router = useRouter();
  const { params, setParams } = useTableParams();

  const columns: ColumnDef<OrderRow>[] = [
    {
      key: "gateway_reference",
      header: "PAYMENT REF",
      sortable: true,
      width: "180px",
      render: (row) => <span className={styles.skuBadge}>{paymentRef(row)}</span>,
    },
    {
      key: "order_reference",
      header: "ORDER REFERENCE",
      sortable: true,
      render: (row) => (
        <Link
          href={`/admin/payments/${row.order_reference || row.id}`}
          className={styles.schoolNameTitle}
          onClick={(e) => e.stopPropagation()}
        >
          {row.order_reference || row.id}
        </Link>
      ),
    },
    {
      key: "payment_gateway",
      header: "GATEWAY",
      sortable: true,
      width: "130px",
      render: (row) => <span className={styles.textMuted}>{providerLabel(row.payment_gateway)}</span>,
    },
    {
      key: "created_at",
      header: "DATE",
      sortable: true,
      width: "130px",
      render: (row) => <span className={styles.textMuted}>{formatDate(row.paid_at || row.created_at)}</span>,
    },
    {
      key: "estimated_total",
      header: "AMOUNT",
      sortable: true,
      align: "right",
      width: "140px",
      render: (row) => <span className={styles.priceHighlight}>{formatMoney(row.estimated_total)}</span>,
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "150px",
      render: (row) => <StatusBadge status={row.status || "pending_payment"} showDot />,
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
            href={`/admin/payments/${row.order_reference || row.id}`}
            className={styles.actionEditBtn}
            title={`View payment for ${row.order_reference || row.id}`}
          >
            <Eye size={14} />
          </Link>
        </div>
      ),
    },
  ];

  const pendingCount = initialData.payments.filter((p) => ["pending", "pending_payment"].includes(p.status || "")).length;
  const failedCount = initialData.payments.filter((p) => p.status === "payment_failed").length;

  const metrics: QuickMetricItem[] = [
    {
      label: "TOTAL REVENUE",
      value: formatMoney(initialData.paidTotal),
      subtitle: "Verified paid orders",
      trendDirection: "neutral",
      tone: "emerald",
      icon: <ZarIcon size={16} />,
    },
    {
      label: "SETTLED ORDERS",
      value: initialData.paidCount,
      subtitle: "Payment complete",
      trendDirection: "neutral",
      tone: "cyan",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "PENDING PAYMENT",
      value: pendingCount,
      subtitle: "Awaiting gateway result",
      trendDirection: "neutral",
      tone: "amber",
      icon: <Clock size={16} />,
    },
    {
      label: "FAILED / VOID",
      value: failedCount,
      subtitle: "Unsuccessful transactions",
      trendDirection: "neutral",
      tone: "red",
      icon: <XCircle size={16} />,
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Payments"
        count={initialData.total}
        subtitle="Gateway transaction reconciliation and automated payment audit logs."
        actions={
          <AdminButton href="/admin/payments/export" variant="secondary" icon={<Download size={14} />}>
            Export Ledger
          </AdminButton>
        }
      />

      <QuickMetricsGrid metrics={metrics} />

      <DataTableToolbar
        searchPlaceholder="Search payments by ref, order, or customer..."
        filters={
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Status: All</option>
              {initialData.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </AdminSelect>
          </div>
        }
      />

      <DataTable
        data={initialData.payments}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/payments/${row.order_reference || row.id}`)}
        emptyTitle="No payments found"
        emptySubtitle="Try adjusting your search criteria."
        footer={
          <DataTablePagination
            total={initialData.total}
            pageSize={params.pageSize}
            currentPage={initialData.page}
          />
        }
      />
    </div>
  );
}