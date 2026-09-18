"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Download,
  ShoppingCart,
  CheckCircle2,
  Package,
  Truck,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import {
  QuickMetricsGrid,
  type QuickMetricItem,
} from "@/components/admin/ui/QuickMetricsGrid";
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
  { key: "dispatched", label: "Dispatched" },
  { key: "completed", label: "Completed" },
];

export function OrdersPageView({ initialData }: OrdersPageViewProps) {
  const router = useRouter();
  const { params, setParams, isPending } = useTableParams();
  const currentTab = params.status || params.tab || "all";

  const columns: ColumnDef<OrderRow>[] = [
    {
      key: "order_reference",
      header: "ORDER REF",
      sortable: true,
      width: "160px",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
          {row.order_reference || `ORD-${row.id.slice(0, 8).toUpperCase()}`}
        </span>
      ),
    },
    {
      key: "buyer_name",
      header: "CUSTOMER & SCHOOL",
      sortable: true,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <Link
            href={`/admin/orders/${row.id}`}
            className="text-slate-100 font-semibold text-xs hover:text-emerald-400 transition-colors no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.buyer_name || "Guest Customer"}
          </Link>
          <span className="text-[11px] text-slate-400">
            {row.school_name || "General Order"}{" "}
            {row.grade ? `• Grade ${row.grade}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: "ORDER DATE",
      sortable: true,
      width: "140px",
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString("en-ZA")
            : "—"}
        </span>
      ),
    },
    {
      key: "estimated_total",
      header: "TOTAL",
      sortable: true,
      align: "right",
      width: "130px",
      render: (row) => (
        <span className="font-mono text-emerald-400 font-bold text-xs">
          R {(row.estimated_total || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      header: "STATUS",
      sortable: true,
      align: "center",
      width: "140px",
      render: (row) => <StatusBadge status={row.status || "pending"} showDot />,
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      sticky: "right",
      width: "80px",
      render: (row) => (
        <div
          className="flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/admin/orders/${row.id}`}
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            data-db-tooltip={`View order ${row.order_reference}`}
          >
            <Eye size={14} />
          </Link>
        </div>
      ),
    },
  ];

  const paidCount = initialData.orders.filter(
    (o) => Boolean(o.paid_at) || o.status === "paid",
  ).length;
  const packingCount = initialData.orders.filter(
    (o) => o.status === "packing" || o.status === "ready_to_pack",
  ).length;
  const completedCount = initialData.orders.filter(
    (o) => o.status === "completed" || o.status === "dispatched",
  ).length;

  const metrics: QuickMetricItem[] = [
    {
      label: "TOTAL ORDERS",
      value: initialData.total || initialData.orders.length,
      subtitle: "+18% vs last month",
      trendDirection: "up",
      tone: "cyan",
      icon: <ShoppingCart size={16} />,
    },
    {
      label: "PAID & READY",
      value: paidCount || initialData.orders.length,
      subtitle: "Verified payment",
      trendDirection: "up",
      tone: "emerald",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "IN PACKING",
      value: packingCount,
      subtitle: "Packing workstation",
      trendDirection: "neutral",
      tone: "blue",
      icon: <Package size={16} />,
    },
    {
      label: "DISPATCHED",
      value: completedCount,
      subtitle: "Handed to courier",
      trendDirection: "up",
      tone: "purple",
      icon: <Truck size={16} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-slate-200">
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

      <QuickMetricsGrid metrics={metrics} />

      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border-0 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-emerald-300"
                  : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
              onClick={() => setParams({ status: tab.key, tab: tab.key }, true)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <DataTableToolbar
        searchPlaceholder="Search orders by reference, buyer name, email..."
        className="mt-3"
        filters={
          <div className="flex items-center gap-2">
            <AdminSelect
              value={params.status || "all"}
              onChange={(e) => setParams({ status: e.target.value }, true)}
              className="min-w-[140px]"
            >
              <option value="all">Status: All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="ready_to_pack">Ready to Pack</option>
              <option value="packing">Packing</option>
              <option value="dispatched">Dispatched</option>
              <option value="completed">Completed</option>
            </AdminSelect>
          </div>
        }
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
            pageSize={params.pageSize}
            currentPage={initialData.page}
          />
        }
      />
    </div>
  );
}
