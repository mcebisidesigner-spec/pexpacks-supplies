import {
  Box,
  Eye,
  EyeOff,
  FileText,
  Layers,
  Save,
  School,
  ExternalLink,
} from "lucide-react";
import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getPack, listPacks } from "@/lib/admin/packs";
import { deletePackAction } from "../actions";
import { getSchool } from "@/lib/admin/schools";
import { PackPriceForm } from "@/components/admin/packs/PackPriceForm";
import { PackItemsSection } from "@/components/admin/packs/PackItemsSection";
import { SchoolPacksDetailView } from "@/components/admin/views/SchoolPacksDetailView";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
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
  const schoolName = schoolData?.name || "Unassigned school";
  const backHref = schoolData
    ? `/admin/packs/${schoolData.slug || schoolData.id}`
    : "/admin/packs";
  const itemCount = items.length;
  const formattedSubtotal = `R ${subtotal.toFixed(2)}`;
  const formattedPrice = `R ${(pack.price ?? 0).toFixed(2)}`;
  const priceFormId = `pack-price-form-${pack.id}`;

  return (
    <div className={`${styles.container} ${styles.packEditorContainer}`}>
      <AdminPageHeader
        backHref={backHref}
        backLabel={`Back to ${schoolName}`}
        title={schoolName}
        titleHighlight={pack.title.toLowerCase().startsWith(schoolName.toLowerCase())
          ? pack.title.slice(schoolName.length).trim() || "Pack"
          : pack.title}
        subtitle={`${schoolName} / ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            {schoolData ? (
              <AdminButton
                href={`/schools/${schoolData.slug || schoolData.id}`}
                target="_blank"
                variant="secondary"
                size="md"
                icon={<ExternalLink size={14} />}
              >
                View Public Page
              </AdminButton>
            ) : null}
            <AdminButton
              type="submit"
              form={priceFormId}
              variant="primary"
              size="md"
              icon={<Save size={14} />}
            >
              Save pack
            </AdminButton>
          </div>
        }
      />

      <div className={`${adminStyles.metricsGrid5} ${styles.packMetricsGrid}`}>
        <MetricCard
          label="Pack Price"
          value={formattedPrice}
          subtext="Retail selling price"
          icon={<span className={adminStyles.currencyText}>R</span>}
          iconTone="green"
        />

        <MetricCard
          label="Item Subtotal"
          value={formattedSubtotal}
          subtext="Sum of line items"
          icon={<Layers size={16} />}
          iconTone="green"
        />

        <MetricCard
          label="Items"
          value={itemCount}
          subtext="Line items in pack"
          icon={<FileText size={16} />}
          iconTone="blue"
        />

        <MetricCard
          label="School"
          value={schoolData ? schoolName : "Unassigned"}
          subtext={schoolData?.province || ""}
          icon={<School size={16} />}
          iconTone="green"
        />

        <MetricCard
          label="Visibility"
          value={pack.visible ? "Visible" : "Hidden"}
          subtext={pack.visible ? "Live on site" : "Not public"}
          icon={pack.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          iconTone="green"
        />
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
              <StatusBadge
                status={pack.visible ? "Live" : "Draft"}
                showDot
              />
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
