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
  };
}

function getProductSlug(row: MasterProductRow): string {
  if (row.name) {
    return row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  if (row.sku) {
    return row.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  return row.id;
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
      render: (row) => {
        const slug = getProductSlug(row);
        return (
          <div className={styles.productCell}>
            <Link
              href={`/admin/products/${slug}`}
              className={styles.productNameLink}
              onClick={(e) => e.stopPropagation()}
            >
              {row.name}
            </Link>
            {row.brand && <span className={styles.productBrand}>{row.brand}</span>}
          </div>
        );
      },
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
      render: (row) => {
        const slug = getProductSlug(row);
        return (
          <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
            <AdminButton
              href={`/admin/products/${slug}/edit`}
              variant="iconTeal"
              size="sm"
              aria-label={`Edit ${row.name}`}
              icon={<Edit2 size={13} />}
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <AdminPageHeader
        title="Master Products"
        count={initialData.total}
        subtitle="Centralised product catalogue managing verified supplier costs and active retail selling prices."
        actions={
          <AdminButton
            href="/admin/products/add-item"
            variant="primary"
            icon={<Plus size={14} />}
          >
            Add Master Item
          </AdminButton>
        }
      />

      <DataTableToolbar
        searchPlaceholder="Search master products by SKU, name, or brand…"
        actions={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
        onRowClick={(row) => router.push(`/admin/products/${getProductSlug(row)}`)}
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
