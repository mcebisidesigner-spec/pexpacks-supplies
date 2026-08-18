import Link from "next/link";
import { ArrowLeft, Barcode, DollarSign, Edit, Layers, Tag, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
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
  const category = typeof rawItem?.category === "string" ? rawItem.category : "Books & Paper";
  const cost = typeof rawItem?.unit_cost === "number" ? rawItem.unit_cost : 18.50;
  const price = typeof rawItem?.unit_price === "number" ? rawItem.unit_price : 28.00;
  const supplierName = typeof rawItem?.supplier_name === "string" ? rawItem.supplier_name : "Waltons Stationery";
  const packInclusionsCount = typeof rawItem?.pack_inclusions_count === "number" ? rawItem.pack_inclusions_count : 14;

  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

  return (
    <div className={styles.container}>
      <div>
        <Link
          href="/admin/products"
          className={styles.secondaryBtn}
          style={{ height: 32, fontSize: 11, background: "transparent", border: "none", color: "#94a3b8", paddingLeft: 0 }}
        >
          <ArrowLeft size={14} /> Back to Master Products
        </Link>
      </div>

      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {name}
            <span className={styles.badgeTeal}>{category}</span>
          </h1>
          <p className={styles.headerSubtitle}>SKU: {sku}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/admin/products/${productId}/edit`} className={styles.primaryBtn}>
            <Edit size={14} /> Edit Pricing & Cost
          </Link>
        </div>
      </div>

      <div className={styles.metricsGrid4}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Supplier Cost</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{money(cost)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Allocated wholesale cost</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Selling Price</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconBlue}`}>
              <Tag size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{money(price)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Catalog selling price</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Gross Margin %</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconGreen}`}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className={styles.metricValue} style={{ color: "#34d399" }}>{margin.toFixed(1)}%</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Unit profit margin</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Active Pack Inclusions</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconPurple}`}>
              <Layers size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{packInclusionsCount}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Assigned school packs</div>
        </div>
      </div>

      <div className={styles.detailLayout}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Barcode size={16} style={{ color: "#2dd4bf" }} />
                <span>Barcode & SKU Mappings</span>
              </div>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>EAN / Barcode:</span>
              <span className={styles.sidebarStatVal}>{barcode}</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Internal SKU:</span>
              <span className={styles.sidebarStatVal}>{sku}</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Primary Supplier:</span>
              <span className={styles.sidebarStatVal} style={{ color: "#60a5fa" }}>{supplierName}</span>
            </div>
          </div>
        </div>

        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <span>Cost History</span>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityTitle}>Supplier Cost Updated (R {cost.toFixed(2)})</div>
              <div className={styles.activityMeta}>17 Aug 2026 • By Admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
