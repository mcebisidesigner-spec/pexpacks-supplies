"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Package, CheckCircle2, Truck, Trash2 } from "lucide-react";
import styles from "./CorePagesView.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
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
import type {
  MasterProductRow,
  SupplierCostStats,
} from "@/lib/admin/operations";
import { CSVStationeryImporter } from "@/components/inventory/CSVStationeryImporter";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { clearMasterProductsAction } from "@/app/admin/products/actions";
import { useDbNotice } from "@/components/admin/ui/DbNotice";

interface MasterProductsPageViewProps {
  initialData: {
    products: MasterProductRow[];
    total: number;
    page: number;
  };
  supplierStats?: SupplierCostStats;
}

function getProductSlug(row: MasterProductRow): string {
  if (row.name) {
    return row.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  if (row.sku) {
    return row.sku
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  return row.id;
}

export function MasterProductsPageView({
  initialData,
  supplierStats,
}: MasterProductsPageViewProps) {
  const router = useRouter();
  const { notifySuccess, notifyError } = useDbNotice();
  const { params, setParams, isPending } = useTableParams();
  const [isClearing, setIsClearing] = useState(false);
  const [catalogueMessage, setCatalogueMessage] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  async function performClear() {
    if (isClearing) return;
    setConfirmClearOpen(false);
    setIsClearing(true);
    setCatalogueMessage(null);
    try {
      const res = await clearMasterProductsAction();
      if (res.ok) {
        notifySuccess(
          `Catalogue cleared — ${res.deleted ?? 0} products removed.`,
        );
        setParams({}, true);
        router.refresh();
      } else {
        notifyError(res.message || "Failed to clear the product catalogue.");
      }
    } catch {
      notifyError("Failed to clear the product catalogue.");
    } finally {
      setIsClearing(false);
    }
  }

  const columns: ColumnDef<MasterProductRow>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      width: "120px",
      render: (row) => <span className={styles.itemSkuBadge}>{row.sku}</span>,
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
            {row.brand && (
              <span className={styles.productBrand}>{row.brand}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      width: "140px",
      render: (row) => <span>{row.category || "Stationery"}</span>,
    },
    {
      key: "latest_verified_cost",
      header: "Cost price",
      sortable: true,
      align: "right",
      width: "130px",
      render: (row) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "2px",
          }}
        >
          <span className={styles.costPrice}>
            {row.latest_verified_cost != null
              ? `R ${Number(row.latest_verified_cost).toFixed(2)}`
              : "—"}
          </span>
          {row.supplier?.name ? (
            <span
              style={{
                fontSize: "10.5px",
                color: "var(--db-brand, #10b981)",
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
              title={`Supplier cost source: ${row.supplier.name}`}
            >
              {row.supplier.code || row.supplier.name}
            </span>
          ) : null}
        </div>
      ),
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
      header: "ACTIONS",
      align: "right",
      sticky: "right",
      width: "90px",
      render: (row) => {
        const slug = getProductSlug(row);
        return (
          <div
            className={styles.actionsCell}
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={`/admin/products/${slug}`}
              className={styles.actionEditBtn}
              data-db-tooltip={`View ${row.name}`}
              aria-label={`View ${row.name}`}
            >
              <Eye size={14} />
            </Link>
          </div>
        );
      },
    },
  ];

  // Determine distinct supplier names/codes mapped across products (e.g. "BSC/Makro")
  const supplierNamesLabel = (() => {
    if (
      supplierStats?.supplierNamesLabel &&
      supplierStats.supplierNamesLabel !== "Unassigned"
    ) {
      return supplierStats.supplierNamesLabel;
    }
    const names = Array.from(
      new Set(
        initialData.products
          .map((p) => {
            if (!p.supplier && !p.preferred_supplier_id) return null;
            const code = p.supplier?.code?.trim() || "";
            const name = p.supplier?.name?.trim() || "";
            return code && code.length > 0 && code.length < name.length
              ? code
              : name || code;
          })
          .filter(Boolean) as string[],
      ),
    );
    return names.length > 0 ? names.join("/") : "Unassigned";
  })();

  const metrics: QuickMetricItem[] = [
    {
      label: "TOTAL PRODUCTS",
      value: initialData.total || initialData.products.length || 0,
      subtitle: "+14 this month",
      trendDirection: "up",
      tone: "cyan",
      icon: <Package size={16} />,
    },
    {
      label: "ACTIVE IN PACKS",
      value: Math.min(initialData.total || 48, 48),
      subtitle: "Assigned to school lists",
      trendDirection: "up",
      tone: "emerald",
      icon: <CheckCircle2 size={16} />,
    },
    {
      label: "AVG SELLING PRICE",
      value: "R 48.50",
      subtitle: "Weighted catalogue margin",
      trendDirection: "up",
      tone: "blue",
      icon: <ZarIcon size={16} />,
    },
    {
      label: "SUPPLIER",
      value: supplierNamesLabel !== "Unassigned" ? supplierNamesLabel : "—",
      subtitle: "Preferred Supplier",
      trend: "Preferred Supplier",
      trendDirection: "neutral",
      tone: "purple",
      icon: <Truck size={16} />,
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
            Add Product
          </AdminButton>
        }
      />

      <QuickMetricsGrid metrics={metrics} />

      <DataTableToolbar
        searchPlaceholder="Search master products by SKU, name, or brand…"
        actions={
          <div className={styles.headerActions}>
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
        onRowClick={(row) =>
          router.push(`/admin/products/${getProductSlug(row)}`)
        }
        isLoading={isPending}
        emptyTitle="No products found"
        emptySubtitle="Try adjusting your search term or category filter."
        footer={
          <DataTablePagination
            total={initialData.total}
            pageSize={params.pageSize}
            currentPage={initialData.page}
          />
        }
      />

      {catalogueMessage && (
        <p className={styles.catalogueMessage} role="status">
          {catalogueMessage}
        </p>
      )}

      <section className={styles.catalogueReset} aria-label="Catalogue reset">
        <div className={styles.resetCopy}>
          <Trash2 className={styles.resetIcon} size={18} />
          <div>
            <strong>Reset the product catalogue</strong>
            <small>
              Permanently removes every master product (pack compositions are
              reset too). Order line items and quotations keep their snapshots.
              Rebuild the list manually or with the CSV importer below.
            </small>
          </div>
        </div>
        <AdminButton
          type="button"
          variant="danger"
          loading={isClearing}
          disabled={isClearing}
          onClick={() => setConfirmClearOpen(true)}
        >
          {isClearing ? "Clearing…" : "Clear all products"}
        </AdminButton>
      </section>

      <section
        className={styles.csvBanner}
        aria-label="Bulk CSV product import"
      >
        <CSVStationeryImporter
          variant="tiles"
          onImported={() => router.refresh()}
        />
      </section>

      <ConfirmModal
        isOpen={confirmClearOpen}
        variant="danger"
        title="Clear all products?"
        message={`Permanently delete ALL ${initialData.total || 0} products from the master catalogue? Pack compositions referencing them will also be removed. Order and quotation history is preserved as snapshots. This cannot be undone.`}
        confirmLabel="Clear all products"
        cancelLabel="Cancel"
        onConfirm={performClear}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
}
