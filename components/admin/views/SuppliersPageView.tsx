"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Edit2, Plus, Trash2 } from "lucide-react";
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
  const { params, setParams } = useTableParams();

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

  const [suppliers, setSuppliers] = useState<SupplierRow[]>(
    initialSuppliers.length > 0 ? initialSuppliers : defaultSuppliers
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

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
      key: "name",
      header: "Supplier Name",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <Link
            href={`/admin/suppliers/${row.id}`}
            className={styles.productNameLink}
            onClick={(e) => e.stopPropagation()}
          >
            {row.name}
          </Link>
          <span className={styles.productBrand}>Code: {row.code}</span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact & Email",
      render: (row) => (
        <div className={styles.productCell}>
          <span>{row.contact_name || "Account Representative"}</span>
          <span className={styles.productBrand}>{row.email || row.telephone || "—"}</span>
        </div>
      ),
    },
    {
      key: "lead_time_days",
      header: "Lead Time",
      sortable: true,
      width: "120px",
      render: (row) => (
        <span>{row.lead_time_days ? `${row.lead_time_days} Days` : "2-3 Days"}</span>
      ),
    },
    {
      key: "payment_terms",
      header: "Terms",
      width: "140px",
      render: (row) => <span>{row.payment_terms || "30 Days Net"}</span>,
    },
    {
      key: "status",
      header: "Status",
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
      header: "Actions",
      align: "right",
      width: "100px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <AdminButton
            href={`/admin/suppliers/${row.id}/edit`}
            variant="iconTeal"
            size="sm"
            aria-label={`Edit ${row.name}`}
            icon={<Edit2 size={13} />}
          />
          <AdminButton
            type="button"
            variant="iconRed"
            size="sm"
            aria-label={`Delete ${row.name}`}
            onClick={(e) => handleDelete(row.id, e)}
            icon={<Trash2 size={13} />}
          />
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
