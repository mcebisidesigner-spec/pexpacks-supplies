import { redirect } from "next/navigation";
import { Edit, BookOpen, TrendingUp, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import { ItemIcon } from "@/components/ui/ItemIcon";
import { inferIcon } from "@/lib/packs/normalisePackItems";
import { deleteItemAction } from "../actions";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

function money(v: number): string {
  return `R ${v.toFixed(2)}`;
}

function getProductSlug(item: {
  slug?: string | null;
  name?: string | null;
  sku?: string | null;
  id?: string;
}): string {
  if (item.slug) return item.slug;
  if (item.name) {
    return item.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  if (item.sku) {
    return item.sku
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  return item.id || "";
}

function formatProductNameFromSlug(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  await requireAdmin({ permission: "items.view" });
  const { productId } = await params;
  const item = await getItem(productId);

  const rawItem = item as Record<string, unknown> | null;

  const productSlug =
    getProductSlug({
      slug: item?.slug,
      name: item?.name,
      sku: item?.sku,
      id: item?.id,
    }) || productId;

  const name =
    typeof rawItem?.name === "string" && rawItem.name
      ? rawItem.name
      : formatProductNameFromSlug(productId);
  const sku =
    typeof rawItem?.sku === "string" && rawItem.sku
      ? rawItem.sku
      : `PEX-${productSlug.slice(0, 10).toUpperCase()}`;
  const barcode =
    typeof rawItem?.barcode === "string" && rawItem.barcode
      ? rawItem.barcode
      : "—";
  const category =
    typeof rawItem?.category === "string" && rawItem.category
      ? rawItem.category
      : "Stationery";
  const cost = typeof rawItem?.unit_cost === "number" ? rawItem.unit_cost : 0;
  const price =
    typeof rawItem?.unit_price === "number" ? rawItem.unit_price : 0;
  const supplierName =
    typeof rawItem?.supplier_name === "string"
      ? rawItem.supplier_name
      : "Preferred Supplier";
  const requiresPexcover = item?.requires_pexcover === true;
  const pexcoCode =
    typeof rawItem?.pexco_code === "string" && rawItem.pexco_code
      ? rawItem.pexco_code
      : null;

  // If accessed by UUID, redirect to clean slugified /admin/products/[product-name]
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      productId,
    );
  if (isUuid && productSlug && productId !== productSlug) {
    redirect(`/admin/products/${productSlug}`);
  }

  const margin = price > 0 && cost > 0 ? ((price - cost) / price) * 100 : 0;

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/products"
        backLabel="Back to Products"
        title={name}
        badge={<StatusBadge status={category} tone="emerald" showDot />}
        subtitle={`SKU: ${sku} • Barcode: ${barcode}`}
        actions={
          <div className={styles.headerActions}>
            <AdminButton
              href={`/admin/products/${productSlug}/edit`}
              variant="primary"
              icon={<Edit size={14} />}
            >
              Edit Product
            </AdminButton>
            {item?.id ? (
              <form action={deleteItemAction.bind(null, item.id)}>
                <ConfirmButton
                  label="Delete Product"
                  title="Delete Product"
                  confirmText={`Delete "${name}"? If the product is referenced by school packs or orders, it will be archived (deactivated) instead of permanently deleted.`}
                  busyLabel="Deleting…"
                  className={adminStyles.dangerButton}
                  icon={<Trash2 size={14} />}
                />
              </form>
            ) : null}
          </div>
        }
      />

      <div className={styles.kpiGrid}>
        <MetricCard
          label="Selling Price"
          value={money(price)}
          subtext="Catalogue list price"
          icon={<ZarIcon size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Purchase Cost"
          value={money(cost)}
          subtext="Verified supplier cost"
          icon={<ZarIcon size={16} />}
          iconTone="blue"
        />
        <MetricCard
          label="Gross Margin"
          value={`${margin.toFixed(1)}%`}
          subtext="Unit profitability"
          icon={<TrendingUp size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="PEXCOVER"
          value={requiresPexcover && pexcoCode ? pexcoCode : "Not Covered"}
          subtext={
            requiresPexcover && pexcoCode
              ? "Assigned covering service"
              : "No covering service selected"
          }
          icon={<BookOpen size={16} />}
          iconTone="purple"
        />
      </div>

      <div className={adminStyles.detailBodyGrid}>
        <div className={adminStyles.detailBodyMain}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <div
                  className={adminStyles.sectionIconTeal}
                  style={{ display: "inline-flex", alignItems: "center" }}
                >
                  <ItemIcon name={item?.icon || inferIcon(name)} size={16} />
                </div>
                <span>Commercial &amp; Supplier Information</span>
              </div>
            </div>

            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Product Name:
                </span>
                <span className={adminStyles.sidebarStatVal}>{name}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Category:</span>
                <span className={adminStyles.sidebarStatVal}>{category}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Preferred Supplier:
                </span>
                <span className={adminStyles.sidebarStatVal}>
                  {supplierName}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Barcode / EAN:
                </span>
                <span className={adminStyles.sidebarStatVal}>{barcode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
