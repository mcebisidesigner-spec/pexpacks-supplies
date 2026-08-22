import Link from "next/link";
import {
  ArrowLeft,
  Box,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  Layers,
  Save,
  School,
} from "lucide-react";
import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getPack, listPacks } from "@/lib/admin/packs";
import { deletePackAction } from "../actions";
import { getSchool } from "@/lib/admin/schools";
import { PackPriceForm } from "@/components/admin/packs/PackPriceForm";
import { PackItemsSection } from "@/components/admin/packs/PackItemsSection";
import { SchoolPacksDetailView } from "@/components/admin/views/SchoolPacksDetailView";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface EditPackPageProps {
  params: Promise<{ id: string }>;
}

export default async function PackOrSchoolPacksPage({
  params,
}: EditPackPageProps) {
  const session = await requireAdmin({ permission: "packs.view" });
  const { id } = await params;

  const school = await getSchool(id);

  if (school) {
    const packResult = await listPacks({ school_id: school.id, pageSize: 100 });

    return (
      <SchoolPacksDetailView
        school={school}
        initialPacks={packResult.packs}
        deletePackAction={deletePackAction}
      />
    );
  }

  const { pack, items } = await getPack(id);
  if (!pack) notFound();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unit_price ?? 0) * item.quantity,
    0,
  );

  const schoolData = pack.school_id ? await getSchool(pack.school_id) : null;
  const schoolName = schoolData?.name || "3d Christian Academy";
  const backHref = schoolData
    ? `/admin/packs/${schoolData.slug || schoolData.id}`
    : "/admin/packs";
  const itemCount = items.length;
  const formattedSubtotal = `R ${subtotal.toFixed(2)}`;
  const formattedPrice = `R ${(pack.price ?? 0).toFixed(2)}`;
  const priceFormId = `pack-price-form-${pack.id}`;

  return (
    <div className={`${styles.container} ${styles.packEditorContainer}`}>
      <Link href={backHref} className={styles.backLink}>
        <ArrowLeft size={14} /> Back to {schoolName}
      </Link>

      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>{pack.title}</h1>
          <p className={styles.headerMeta}>
            {schoolName} / {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          type="submit"
          form={priceFormId}
          className={`${styles.primaryBtn} ${styles.headerSaveBtn}`}
        >
          <Save size={14} /> Save pack
        </button>
      </div>

      <div className={`${styles.metricsGrid5} ${styles.packMetricsGrid}`}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Pack Price</span>
            <div
              className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}
            >
              <DollarSign size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{formattedPrice}</div>
          <div className={styles.metricSub}>Retail selling price</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Item Subtotal</span>
            <div
              className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}
            >
              <Layers size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{formattedSubtotal}</div>
          <div className={styles.metricSub}>Sum of line items</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Items</span>
            <div
              className={`${styles.metricIconWrapper} ${styles.metricIconBlue}`}
            >
              <FileText size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{itemCount}</div>
          <div className={styles.metricSub}>Line items in pack</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>School</span>
            <div
              className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}
            >
              <School size={16} />
            </div>
          </div>
          <div className={`${styles.metricValue} ${styles.metricValueSmall}`}>
            {schoolData ? schoolName : "Unassigned"}
          </div>
          <div className={styles.metricSub}>{schoolData?.province || ""}</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Visibility</span>
            <div
              className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}
            >
              {pack.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </div>
          </div>
          <div className={`${styles.metricValue} ${styles.metricValueSmall}`}>
            {pack.visible ? "Visible" : "Hidden"}
          </div>
          <div className={styles.metricSub}>
            {pack.visible ? "Public listing" : "Draft / hidden"}
          </div>
        </div>
      </div>

      <div className={styles.detailLayout}>
        <div className={styles.formStack}>
          <PackPriceForm
            formId={priceFormId}
            packId={pack.id}
            price={pack.price}
            itemCount={itemCount}
            subtotal={subtotal}
            schoolName={schoolName}
            packTitle={pack.title}
            showSubmit={false}
          />
        </div>

        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Box size={16} className={styles.iconTeal} />
                <span>Pack Summary</span>
              </div>
              <span className={`${styles.badgeGreen} ${styles.badgeTiny}`}>
                {pack.visible ? "Live" : "Draft"}
              </span>
            </div>

            <div className={styles.summaryStack}>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Title</span>
                <span className={styles.sidebarStatVal}>{pack.title}</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Price</span>
                <span className={styles.sidebarStatVal}>{formattedPrice}</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Subtotal</span>
                <span className={styles.sidebarStatVal}>
                  {formattedSubtotal}
                </span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Items</span>
                <span className={styles.sidebarStatVal}>{itemCount}</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>School</span>
                <span className={styles.sidebarStatVal}>{schoolName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PackItemsSection
        packId={pack.id}
        packTitle={pack.title}
        items={items}
        subtotal={subtotal}
        showImporter={hasPermission(session, "items.import")}
      />
    </div>
  );
}
