"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Plus } from "lucide-react";
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
import type { SupplierRow } from "@/lib/admin/operations";

interface SuppliersPageViewProps {
  initialSuppliers?: SupplierRow[];
}

export function SuppliersPageView({ initialSuppliers = [] }: SuppliersPageViewProps) {
  const router = useRouter();
  const { params } = useTableParams();

  // Fallback defaults if table is empty
  const defaultSuppliers: SupplierRow[] = [
    {
      id: "sup-makro",
      code: "SUP-MAKRO",
      name: "Makro",
      contact_name: "Trade Desk",
      email: "orders@makro.co.za",
      telephone: "+27 11 797 0000",
      lead_time_days: 2,
      payment_terms: "30 Days Net",
      active: true,
      offer_count: 1420,
    },
    {
      id: "sup-bsc",
      code: "SUP-BSC",
      name: "BSC Stationers",
      contact_name: "Key Accounts",
      email: "orders@bscstationers.co.za",
      telephone: "+27 11 837 0000",
      lead_time_days: 3,
      payment_terms: "30 Days Net",
      active: true,
      offer_count: 850,
    },
  ];

  const [suppliers] = useState<SupplierRow[]>(
    initialSuppliers.length > 0 ? initialSuppliers : defaultSuppliers
  );

  const filtered = useMemo(() => {
    if (!params.q.trim()) return suppliers;
    const q = params.q.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  }, [suppliers, params.q]);

  const columns: ColumnDef<SupplierRow>[] = [
    {
      key: "code",
      header: "CODE",
      sortable: true,
      width: "160px",
      render: (row) => (
        <span className={styles.skuBadge}>{row.code}</span>
      ),
    },
    {
      key: "name",
      header: "SUPPLIER NAME",
      sortable: true,
      render: (row) => (
        <Link
          href={`/admin/suppliers/${row.id}`}
          className={styles.schoolNameTitle}
          onClick={(e) => e.stopPropagation()}
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "contact",
      header: "CONTACT & EMAIL",
      render: (row) => (
        <div className={styles.productCell}>
          <span className={styles.textMuted}>{row.contact_name || "Trade Desk"}</span>
          <span className={styles.productBrand}>{row.email || row.telephone || "—"}</span>
        </div>
      ),
    },
    {
      key: "lead_time_days",
      header: "LEAD TIME",
      sortable: true,
      width: "130px",
      render: (row) => (
        <span className={styles.textMuted}>{row.lead_time_days ? `${row.lead_time_days} Days` : "2-3 Days"}</span>
      ),
    },
    {
      key: "payment_terms",
      header: "TERMS",
      width: "140px",
      render: (row) => <span className={styles.textMuted}>{row.payment_terms || "30 Days Net"}</span>,
    },
    {
      key: "status",
      header: "STATUS",
      align: "center",
      width: "130px",
      render: (row) => (
        <StatusBadge
          status={row.active ? "Preferred" : "Inactive"}
          tone={row.active ? "emerald" : "slate"}
          showDot
        />
      ),
    },
    {
      key: "actions",
      header: "ACTIONS",
      align: "right",
      width: "90px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/suppliers/${row.id}/edit`}
            className={styles.actionEditBtn}
            title={`Edit ${row.name}`}
          >
            <Edit2 size={14} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Suppliers"
        count={filtered.length}
        subtitle="Manage your preferred supplier network and procurement terms."
        actions={
          <AdminButton
            href="/admin/suppliers/new-supplier"
            variant="primary"
            icon={<Plus size={14} />}
          >
            New Supplier
          </AdminButton>
        }
      />

      <DataTableToolbar
        searchPlaceholder="Search suppliers by name, code, email..."
      />

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/suppliers/${row.id}`)}
        emptyTitle="No suppliers found"
        emptySubtitle="Try adjusting your search query."
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
