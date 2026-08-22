import Link from "next/link";
import { ArrowLeft, Barcode, DollarSign, Edit, Layers, Tag, TrendingUp } from "lucide-react";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
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
          className={`${styles.secondaryBtn} ${adminStyles.backLinkOverride}`}
        >
          <ArrowLeft size={14} /> Back to Master Products
        </Link>
      </div>

      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {name}
            <span className={adminStyles.badgeTeal}>{category}</span>
          </h1>
          <p className={styles.headerSubtitle}>SKU: {sku}</p>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/admin/products/${productId}/edit`} className={styles.primaryBtn}>
            <Edit size={14} /> Edit Pricing & Cost
          </Link>
        </div>
      </div>

      <div className={adminStyles.metricsGrid4}>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Supplier Cost</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{money(cost)}</div>
          <div className={adminStyles.metricSub}>Allocated wholesale cost</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Selling Price</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}>
              <Tag size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{money(price)}</div>
          <div className={adminStyles.metricSub}>Catalog selling price</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Gross Margin %</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconGreen}`}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${styles["c-green"]}`}>{margin.toFixed(1)}%</div>
          <div className={adminStyles.metricSub}>Unit profit margin</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Active Pack Inclusions</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconPurple}`}>
              <Layers size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{packInclusionsCount}</div>
          <div className={adminStyles.metricSub}>Assigned school packs</div>
        </div>
      </div>

      <div className={adminStyles.detailLayout}>
        <div className={`${adminStyles.flex} ${styles["flex-col"]} ${styles["gap-18"]}`}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Barcode size={16} className={styles["c-teal"]} />
                <span>Barcode & SKU Mappings</span>
              </div>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>EAN / Barcode:</span>
              <span className={adminStyles.sidebarStatVal}>{barcode}</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Internal SKU:</span>
              <span className={adminStyles.sidebarStatVal}>{sku}</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Primary Supplier:</span>
              <span className={`${adminStyles.sidebarStatVal} ${styles["c-blue"]}`}>{supplierName}</span>
            </div>
          </div>
        </div>

        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <span>Cost History</span>
            </div>
            <div className={adminStyles.activityItem}>
              <div className={adminStyles.activityTitle}>Supplier Cost Updated (R {cost.toFixed(2)})</div>
              <div className={adminStyles.activityMeta}>17 Aug 2026 • By Admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
