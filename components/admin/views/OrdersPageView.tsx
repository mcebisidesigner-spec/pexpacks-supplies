"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Download } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import type { OrderListResult, OrderRow } from "@/lib/admin/orders";

interface OrdersPageViewProps {
  initialData: OrderListResult;
}

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "paid", label: "Paid" },
  { key: "procurement", label: "Procurement" },
  { key: "ready_to_pack", label: "Ready to Pack" },
  { key: "packing", label: "Packing" },
  { key: "completed", label: "Completed" },
  { key: "at_risk", label: "At Risk" },
];

export function OrdersPageView({ initialData }: OrdersPageViewProps) {
  const router = useRouter();
  const { params, setParams, isPending } = useTableParams();

  const currentTab = params.status || params.tab || "all";

  const columns: ColumnDef<OrderRow>[] = [
    {
      key: "order_reference",
      header: "Order Ref",
      sortable: true,
      width: "140px",
      render: (row) => (
        <span className={styles.itemSkuBadge}>
          {row.order_reference || `ORD-${row.id.slice(0, 8)}`}
        </span>
      ),
    },
    {
      key: "buyer_name",
      header: "Customer & School",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <Link
            href={`/admin/orders/${row.id}`}
            className={styles.productNameLink}
            onClick={(e) => e.stopPropagation()}
          >
            {row.buyer_name || "Guest Customer"}
          </Link>
          <span className={styles.productBrand}>
            {row.school_name || "General Order"} {row.grade ? `• Grade ${row.grade}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Order Date",
      sortable: true,
      width: "130px",
      render: (row) => (
        <span>
          {row.created_at ? new Date(row.created_at).toLocaleDateString("en-ZA") : "—"}
        </span>
      ),
    },
    {
      key: "estimated_total",
      header: "Total",
      sortable: true,
      align: "right",
      width: "120px",
      render: (row) => (
        <span className={styles.priceHighlight}>
          R {(row.estimated_total || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      align: "center",
      width: "120px",
      render: (row) => <StatusBadge status={row.status || "pending"} showDot />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "80px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <AdminButton
            href={`/admin/orders/${row.id}`}
            variant="icon"
            size="sm"
            aria-label={`View order ${row.order_reference}`}
            icon={<Eye size={13} />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Orders & Commerce"
        count={initialData.total}
        subtitle="Order status lifecycle & fulfillment tracking"
        actions={
          <AdminButton
            href="/admin/orders/export"
            variant="secondary"
            icon={<Download size={14} />}
          >
            Export Orders
          </AdminButton>
        }
      />

      <div className={styles.tabsRow}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tabBtn} ${currentTab === tab.key ? styles.tabBtnActive : ""}`}
            onClick={() => setParams({ status: tab.key, tab: tab.key }, true)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTableToolbar
        searchPlaceholder="Search orders by reference, buyer name, email..."
        className={styles.mt12}
      />

      <DataTable
        data={initialData.orders}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
        isLoading={isPending}
        emptyTitle="No orders found"
        emptySubtitle="There are currently no orders matching the selected filter."
        footer={
          <DataTablePagination
            total={initialData.total}
            pageSize={initialData.orders.length || 25}
            currentPage={initialData.page}
          />
        }
      />
    </div>
  );
}
