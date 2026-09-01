import {
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

/** Augments PackRow with computed columns added by DB triggers (not yet in generated types) */
type PackWithComputedCosts = Awaited<ReturnType<typeof getPack>>["pack"] & {
  items_cost?: number | null;
  packaging_cost?: number | null;
  assembly_cost?: number | null;
  freight_cost?: number | null;
  other_cost?: number | null;
  total_landed_cost?: number | null;
  margin_rate_used?: number | null;
  calculated_selling_price?: number | null;
};

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

  const { pack: rawPack, items } = await getPack(id);
  if (!rawPack) notFound();
  const pack = rawPack as PackWithComputedCosts;

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
        titleHighlight={
          pack.title.toLowerCase().startsWith(schoolName.toLowerCase())
            ? pack.title.slice(schoolName.length).trim() || "Pack"
            : pack.title
        }
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
            price={pack.calculated_selling_price ?? pack.price}
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
                <span style={{ fontWeight: 700, color: "var(--color-navy)" }}>
                  Automated Pricing Engine
                </span>
              </div>
              <StatusBadge
                status={
                  pack.pricing_status === "incomplete"
                    ? "Action Required"
                    : "Automated"
                }
                tone={
                  pack.pricing_status === "incomplete" ? "amber" : "emerald"
                }
                showDot
              />
            </div>

            <div className={adminStyles.summaryStack}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Stationery Items Cost
                </span>
                <span className={adminStyles.sidebarStatVal}>
                  R {(pack.items_cost ?? 0).toFixed(2)}
                </span>
              </div>
              {(pack.packaging_cost ?? 0) > 0 ? (
                <div className={adminStyles.sidebarStatRow}>
                  <span className={adminStyles.sidebarStatLabel}>
                    Packaging Cost
                  </span>
                  <span className={adminStyles.sidebarStatVal}>
                    R {(pack.packaging_cost ?? 0).toFixed(2)}
                  </span>
                </div>
              ) : null}
              {(pack.assembly_cost ?? 0) > 0 ? (
                <div className={adminStyles.sidebarStatRow}>
                  <span className={adminStyles.sidebarStatLabel}>
                    Assembly Cost
                  </span>
                  <span className={adminStyles.sidebarStatVal}>
                    R {(pack.assembly_cost ?? 0).toFixed(2)}
                  </span>
                </div>
              ) : null}
              {(pack.freight_cost ?? 0) > 0 ? (
                <div className={adminStyles.sidebarStatRow}>
                  <span className={adminStyles.sidebarStatLabel}>
                    Freight Cost
                  </span>
                  <span className={adminStyles.sidebarStatVal}>
                    R {(pack.freight_cost ?? 0).toFixed(2)}
                  </span>
                </div>
              ) : null}
              {(pack.other_cost ?? 0) > 0 ? (
                <div className={adminStyles.sidebarStatRow}>
                  <span className={adminStyles.sidebarStatLabel}>
                    Other Cost
                  </span>
                  <span className={adminStyles.sidebarStatVal}>
                    R {(pack.other_cost ?? 0).toFixed(2)}
                  </span>
                </div>
              ) : null}
              <div
                className={adminStyles.sidebarStatRow}
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  paddingTop: "8px",
                  fontWeight: 700,
                }}
              >
                <span className={adminStyles.sidebarStatLabel}>
                  Total Landed Cost
                </span>
                <span
                  className={adminStyles.sidebarStatVal}
                  style={{ fontWeight: 800 }}
                >
                  R{" "}
                  {(pack.total_landed_cost ?? pack.items_cost ?? 0).toFixed(2)}
                </span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>
                  Target Margin Rate
                </span>
                <span
                  className={adminStyles.sidebarStatVal}
                  style={{ color: "var(--color-teal)", fontWeight: 700 }}
                >
                  {((pack.margin_rate_used ?? 0.499) * 100).toFixed(1)}%
                </span>
              </div>
              <div
                className={adminStyles.sidebarStatRow}
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  paddingTop: "8px",
                }}
              >
                <span
                  className={adminStyles.sidebarStatLabel}
                  style={{ fontWeight: 700, color: "var(--color-navy)" }}
                >
                  Calculated Selling Price
                </span>
                <span
                  className={adminStyles.sidebarStatVal}
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "var(--color-teal)",
                  }}
                >
                  {formattedPrice}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                paddingTop: "10px",
                borderTop: "1px dashed rgba(0,0,0,0.08)",
              }}
            >
              <AdminButton
                href="/admin/settings?tab=pricing"
                variant="secondary"
                size="sm"
                className="w-full justify-center"
              >
                Manage Pricing & Margin
              </AdminButton>
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
