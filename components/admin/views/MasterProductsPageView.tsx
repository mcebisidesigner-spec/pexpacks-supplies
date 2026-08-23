"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Plus } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import {
  DataTable,
  DataTableToolbar,
  DataTablePagination,
  useTableParams,
  type ColumnDef,
} from "@/components/admin/shared/DataTable";
import type { MasterProductRow } from "@/lib/admin/operations";

interface MasterProductsPageViewProps {
  initialData: {
    products: MasterProductRow[];
    total: number;
    page: number;
    pageCount: number;
  };
}

export function MasterProductsPageView({ initialData }: MasterProductsPageViewProps) {
  const router = useRouter();
  const { params, setParams, isPending } = useTableParams();

  const columns: ColumnDef<MasterProductRow>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      width: "120px",
      render: (row) => (
        <span className={styles.itemSkuBadge}>
          {row.sku}
        </span>
      ),
    },
    {
      key: "name",
      header: "Product Name",
      sortable: true,
      render: (row) => (
        <div className={styles.productCell}>
          <Link
            href={`/admin/products/${row.id}`}
            className={styles.productNameLink}
            onClick={(e) => e.stopPropagation()}
          >
            {row.name}
          </Link>
          {row.brand && <span className={styles.productBrand}>{row.brand}</span>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      width: "140px",
      render: (row) => <span>{row.category || "General"}</span>,
    },
    {
      key: "current_selling_price",
      header: "Selling Price",
      sortable: true,
      align: "right",
      width: "130px",
      render: (row) => (
        <span className={styles.priceHighlight}>
          R {(row.current_selling_price || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "latest_verified_cost",
      header: "Cost Price",
      sortable: true,
      align: "right",
      width: "120px",
      render: (row) => (
        <span className={styles.costPrice}>
          R {(row.latest_verified_cost || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: "active",
      header: "Status",
      sortable: true,
      align: "center",
      width: "110px",
      render: (row) => (
        <StatusBadge
          status={row.active ? "Active" : "Draft"}
          tone={row.active ? "emerald" : "slate"}
          showDot
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      width: "90px",
      render: (row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <AdminButton
            href={`/admin/products/${row.id}/edit`}
            variant="iconTeal"
            size="sm"
            aria-label={`Edit ${row.name}`}
            icon={<Edit2 size={13} />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Master Products"
        count={initialData.total}
        subtitle="Manage the master catalogue used across all school packs."
        actions={
          <AdminButton
            href="/admin/products/add-item"
            variant="primary"
            icon={<Plus size={14} />}
          >
            New Item
          </AdminButton>
        }
      />

      <DataTableToolbar
        searchPlaceholder="Search products by name, SKU, category..."
        filters={
          <div className={styles.filterGroup}>
            <AdminSelect
              value={params.category || "all"}
              onChange={(e) => setParams({ category: e.target.value }, true)}
              className={styles.toolbarSelect}
            >
              <option value="all">Category: All</option>
              <option value="Stationery">Stationery</option>
              <option value="Books">Books</option>
              <option value="Art & Craft">Art &amp; Craft</option>
              <option value="Packaging">Packaging</option>
            </AdminSelect>
          </div>
        }
      />

      <DataTable
        data={initialData.products}
        columns={columns}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => router.push(`/admin/products/${row.id}`)}
        isLoading={isPending}
        emptyTitle="No products found"
        emptySubtitle="Try adjusting your search term or category filter."
        footer={
          <DataTablePagination
            total={initialData.total}
            pageSize={initialData.products.length || 25}
            currentPage={initialData.page}
          />
        }
      />
    </div>
  );
}
