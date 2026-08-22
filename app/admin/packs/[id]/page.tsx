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
import adminStyles from "@/app/admin/admin.module.css";
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
      <Link href={backHref} className={adminStyles.backLink}>
        <ArrowLeft size={14} /> Back to {schoolName}
      </Link>

      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {schoolName}{" "}
            <span className={adminStyles.titleAccent}>
              {pack.title.toLowerCase().startsWith(schoolName.toLowerCase())
                ? pack.title.slice(schoolName.length).trim() || "Pack"
                : pack.title}
            </span>
          </h1>
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

      <div className={`${adminStyles.metricsGrid5} ${styles.packMetricsGrid}`}>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Pack Price</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}
            >
              <span className={adminStyles.currencyText}>R</span>
            </div>
          </div>
          <div className={adminStyles.metricValue}>{formattedPrice}</div>
          <div className={adminStyles.metricSub}>Retail selling price</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Item Subtotal</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}
            >
              <Layers size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{formattedSubtotal}</div>
          <div className={adminStyles.metricSub}>Sum of line items</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Items</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}
            >
              <FileText size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{itemCount}</div>
          <div className={adminStyles.metricSub}>Line items in pack</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>School</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}
            >
              <School size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${adminStyles.metricValueSmall}`}>
            {schoolData ? schoolName : "Unassigned"}
          </div>
          <div className={adminStyles.metricSub}>{schoolData?.province || ""}</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Visibility</span>
            <div
              className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}
            >
              {pack.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${adminStyles.metricValueSmall}`}>
            {pack.visible ? "Visible" : "Hidden"}
          </div>
          <div className={adminStyles.metricSub}>
            {pack.visible ? "Public listing" : "Draft / hidden"}
          </div>
        </div>
      </div>

      <div className={adminStyles.detailLayout}>
        <div className={adminStyles.formStack}>
          <PackPriceForm
            formId={priceFormId}
            packId={pack.id}
            price={pack.price}
            itemCount={itemCount}
            subtotal={subtotal}
            schoolName={schoolName}
            packTitle={pack.title}
            showSubmit={false}
            title="Set Pack Grade & Items"
          >
            <PackItemsSection
              packId={pack.id}
              packTitle={pack.title}
              items={items}
              subtotal={subtotal}
              mode="inlineSearch"
            />
          </PackPriceForm>
        </div>

        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Box size={16} className={adminStyles.iconTeal} />
                <span>Pack Summary</span>
              </div>
              <span className={`${adminStyles.badgeGreen} ${adminStyles.badgeTiny}`}>
                {pack.visible ? "Live" : "Draft"}
              </span>
            </div>

            <div className={adminStyles.summaryStack}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Title</span>
                <span className={adminStyles.sidebarStatVal}>{pack.title}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Price</span>
                <span className={adminStyles.sidebarStatVal}>{formattedPrice}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Subtotal</span>
                <span className={adminStyles.sidebarStatVal}>
                  {formattedSubtotal}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Items</span>
                <span className={adminStyles.sidebarStatVal}>{itemCount}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>School</span>
                <span className={adminStyles.sidebarStatVal}>{schoolName}</span>
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
        mode="list"
      />
    </div>
  );
}
