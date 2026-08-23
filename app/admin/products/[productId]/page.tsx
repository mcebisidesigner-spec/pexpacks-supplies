import { Edit, Layers, Tag, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

function money(v: number): string {
  return `R ${v.toFixed(2)}`;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  await requireAdmin({ permission: "items.view" });
  const { productId } = await params;
  const item = await getItem(productId);

  const rawItem = item as Record<string, unknown> | null;

  const name = typeof rawItem?.name === "string" ? rawItem.name : "A4 Hardcover Book 192pg";
  const sku = typeof rawItem?.sku === "string" ? rawItem.sku : "BK-A4-192";
  const barcode = typeof rawItem?.barcode === "string" ? rawItem.barcode : "6001234567890";
  const category = typeof rawItem?.category === "string" ? rawItem.category : "Stationery";
  const cost = typeof rawItem?.unit_cost === "number" ? rawItem.unit_cost : 18.50;
  const price = typeof rawItem?.unit_price === "number" ? rawItem.unit_price : 28.00;
  const supplierName = typeof rawItem?.supplier_name === "string" ? rawItem.supplier_name : "Makro";
  const packInclusionsCount = typeof rawItem?.pack_inclusions_count === "number" ? rawItem.pack_inclusions_count : 14;

  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

  return (
    <div className={styles.container}>
      <AdminPageHeader
        backHref="/admin/products"
        backLabel="Back to Products"
        title={name}
        subtitle={`SKU: ${sku} • Barcode: ${barcode}`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StatusBadge status={category} tone="emerald" showDot />
            <AdminButton
              href={`/admin/products/${productId}/edit`}
              variant="primary"
              icon={<Edit size={14} />}
            >
              Edit Item
            </AdminButton>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
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
          label="Pack Inclusions"
          value={`${packInclusionsCount} Packs`}
          subtext="Active school packs"
          icon={<Layers size={16} />}
          iconTone="purple"
        />
      </div>

      <div className={adminStyles.detailBodyGrid}>
        <div className={adminStyles.detailBodyMain}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Tag size={16} className={adminStyles.iconTeal} />
                <span>Commercial &amp; Supplier Information</span>
              </div>
            </div>

            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Item Name:</span>
                <span className={adminStyles.sidebarStatVal}>{name}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Category:</span>
                <span className={adminStyles.sidebarStatVal}>{category}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Preferred Supplier:</span>
                <span className={adminStyles.sidebarStatVal}>{supplierName}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Barcode / EAN:</span>
                <span className={adminStyles.sidebarStatVal}>{barcode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
