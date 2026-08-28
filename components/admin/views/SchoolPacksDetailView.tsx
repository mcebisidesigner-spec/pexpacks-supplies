"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Box,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  HeartPulse,
  Layers,
  Plus,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import styles from "./CorePagesView.module.css";
import adminStyles from "@/app/admin/admin.module.css";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { VisibleToggle } from "@/components/admin/packs/VisibleToggle";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

import { buildTailoredAdminPacks } from "@/lib/schools/school-grade-packs";

interface PackItem {
  id: string;
  title: string;
  slug?: string | null;
  price: number;
  item_count: number;
  visible: boolean;
  featured?: boolean;
  updated_at?: string;
}

interface SchoolData {
  id: string;
  name: string;
  slug?: string | null;
  city?: string | null;
  province?: string | null;
}

interface SchoolPacksDetailViewProps {
  school: SchoolData;
  initialPacks: PackItem[];
  deletePackAction?: (id: string) => Promise<void>;
}

function money(v: number): string {
  return `R ${v.toFixed(2)}`;
}

export function SchoolPacksDetailView({
  school,
  initialPacks,
  deletePackAction,
}: SchoolPacksDetailViewProps) {
  const tailoredPacks = useMemo(() => {
    return buildTailoredAdminPacks(school, initialPacks);
  }, [school, initialPacks]);

  const filteredPacks = tailoredPacks;
  const totalPacks = tailoredPacks.length;

  const { publishedPacks, totalItemsCount, totalRevenue } = useMemo(() => {
    let publishedPacks = 0;
    let totalItemsCount = 0;
    let totalRevenue = 0;
    for (const p of tailoredPacks) {
      if (p.visible) publishedPacks++;
      totalItemsCount += p.item_count || 0;
      totalRevenue += p.price || 0;
    }
    return { publishedPacks, totalItemsCount, totalRevenue };
  }, [tailoredPacks]);

  const schoolIdentifier = school.slug || school.id;

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <AdminPageHeader
        backHref="/admin/packs"
        backLabel="Back to Packs"
        title={school.name}
        count={totalPacks}
        subtitle={`${school.city || "Johannesburg"}, ${school.province || "Gauteng"} • Grade Pack Directory`}
        actions={
          <div className={styles.headerActions}>
            <AdminButton
              href={`/schools/${schoolIdentifier}`}
              target="_blank"
              variant="secondary"
              icon={<ExternalLink size={14} />}
            >
              View Public Page
            </AdminButton>
            <AdminButton
              href={`/admin/${schoolIdentifier}/add-pack-items`}
              variant="primary"
              icon={<Plus size={14} />}
            >
              Add Pack
            </AdminButton>
          </div>
        }
      />

      {/* Metric Summary Row (5 cards) */}
      <div className={adminStyles.metricsGrid5}>
        <MetricCard
          label="Grade Packs"
          value={totalPacks}
          subtext="Configured"
          icon={<Box size={16} />}
          iconTone="green"
        />

        <MetricCard
          label="Published"
          value={publishedPacks}
          subtext="Live on storefront"
          icon={<Zap size={16} />}
          iconTone="green"
        />

        <MetricCard
          label="Total Items"
          value={totalItemsCount}
          subtext="Across all packs"
          icon={<Layers size={16} />}
          iconTone="purple"
        />

        <MetricCard
          label="Pack Value"
          value={money(totalRevenue)}
          subtext="Catalogue total"
          icon={<HeartPulse size={16} />}
          iconTone="green"
        />

        <MetricCard
          label="Last Updated"
          value="May 21, 2024"
          subtext="By Liam Morgan"
          icon={<Clock size={16} />}
          iconTone="blue"
        />
      </div>

      {/* Main 2-Column Layout */}
      <div className={adminStyles.detailLayout}>
        {/* Left Column: Table and Toolbar */}
        <div className={adminStyles.leftColumn}>

          {/* Data Table */}
          <div className={adminStyles.tableCard}>
            <div className={adminStyles.tableWrapper}>
              <table className={adminStyles.table}>
                <thead>
                  <tr>
                    <th>
                      <div className={styles.headerContent}>
                        <span>Grade Pack &amp; School</span>
                        <span className={styles.sortIcon}>↑↓</span>
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerContent}>
                        <span>Selling Price</span>
                        <span className={styles.sortIcon}>↑↓</span>
                      </div>
                    </th>
                    <th className={styles.alignRight}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPacks.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={adminStyles.emptyCell}>
                        No grade packs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPacks.map((pack) => {
                      const formattedGrade = pack.grade_label;
                      const isConfigured = pack.is_configured;
                      const editHref = isConfigured
                        ? `/admin/packs/${pack.slug || pack.id}`
                        : `/admin/${schoolIdentifier}/add-pack-items?grade=${encodeURIComponent(formattedGrade.replace(/ – Stationery Pack/i, ""))}`;

                      return (
                        <tr key={pack.id} className={styles.dataRow}>
                          <td>
                            <div className={styles.productCell}>
                              <Link
                                href={editHref}
                                className={styles.schoolNameTitle}
                              >
                                {formattedGrade}
                              </Link>
                              <div className={styles.productBrand}>
                                {school.name}
                              </div>
                            </div>
                          </td>
                          <td className={styles.priceHighlight}>
                            {pack.price > 0 ? (
                              money(pack.price)
                            ) : (
                              <span className={styles.textMuted}>
                                From Quote
                              </span>
                            )}
                          </td>
                          <td className={styles.alignRight}>
                            <div className={styles.actionsCell}>
                              {isConfigured ? (
                                <>
                                  <VisibleToggle id={pack.id} visible={pack.visible} />
                                  {deletePackAction && (
                                    <form action={deletePackAction.bind(null, pack.id)}>
                                      <ConfirmButton
                                        label=""
                                        icon={<Trash2 size={13} />}
                                        title="Delete Pack Permanently"
                                        confirmLabel="Delete Pack"
                                        confirmText={`Permanently delete "${pack.title}"`}
                                        busyLabel=""
                                        className={`${adminStyles.actionIconBtn} ${adminStyles.actionIconBtnRed}`}
                                      />
                                    </form>
                                  )}
                                </>
                              ) : (
                                <AdminButton
                                  href={editHref}
                                  variant="outline"
                                  size="sm"
                                  icon={<Plus size={12} />}
                                >
                                  Set Pack
                                </AdminButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className={styles.paginationFooter}>
              <span>
                Showing 1 to {filteredPacks.length} of {filteredPacks.length} grade packs
              </span>
              <div className={adminStyles.paginationControls}>
                <button className={styles.pageBtn}>&lt;</button>
                <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                <button className={styles.pageBtn}>&gt;</button>
              </div>
              <div className={adminStyles.paginationSelectWrap}>
                <select className={`${styles.selectInput} ${adminStyles.paginationSelect}`}>
                  <option>10 per page</option>
                  <option>20 per page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className={adminStyles.sidebarColumn}>
          {/* School Health Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <HeartPulse size={16} className={adminStyles.iconTeal} />
                <span>School Health</span>
              </div>
              <span className={`${adminStyles.badgeGreen} ${adminStyles.badgeTiny}`}>Healthy</span>
            </div>

            <div className={adminStyles.sidebarStack}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Grade Packs</span>
                <div className={adminStyles.sidebarStatGroup}>
                  <span className={adminStyles.sidebarStatVal}>{totalPacks} / {totalPacks}</span>
                  <span className={adminStyles.sidebarStatPercent}>100%</span>
                </div>
              </div>

              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Published Packs</span>
                <div className={adminStyles.sidebarStatGroup}>
                  <span className={adminStyles.sidebarStatVal}>{publishedPacks}</span>
                  <span className={adminStyles.sidebarStatPercent}>100%</span>
                </div>
              </div>

              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Total Items</span>
                <span className={adminStyles.sidebarStatVal}>{totalItemsCount}</span>
              </div>

              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Last Activity</span>
                <span className={adminStyles.sidebarStatVal}>May 21, 2024</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Zap size={16} className={adminStyles.iconTeal} />
                <span>Quick Actions</span>
              </div>
            </div>

            <div className={`${adminStyles.sidebarStack} ${adminStyles.gap8}`}>
              <Link
                href={`/admin/packs/${schoolIdentifier}/add-pack`}
                className={adminStyles.quickActionItem}
              >
                <div className={adminStyles.sidebarStatGroup}>
                  <Plus size={14} className={adminStyles.iconTeal} />
                  <span>Add new pack</span>
                </div>
                <ChevronRight size={14} className={adminStyles.iconMuted} />
              </Link>

              <button className={adminStyles.quickActionItem} type="button">
                <div className={adminStyles.sidebarStatGroup}>
                  <Copy size={14} className={adminStyles.iconTeal} />
                  <span>Duplicate existing pack</span>
                </div>
                <ChevronRight size={14} className={adminStyles.iconMuted} />
              </button>

              <button className={adminStyles.quickActionItem} type="button">
                <div className={adminStyles.sidebarStatGroup}>
                  <Download size={14} className={adminStyles.iconTeal} />
                  <span>Import packs from template</span>
                </div>
                <ChevronRight size={14} className={adminStyles.iconMuted} />
              </button>

              <button className={adminStyles.quickActionItem} type="button">
                <div className={adminStyles.sidebarStatGroup}>
                  <Upload size={14} className={adminStyles.iconTeal} />
                  <span>Export school packs</span>
                </div>
                <ChevronRight size={14} className={adminStyles.iconMuted} />
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Clock size={16} className={adminStyles.iconTeal} />
                <span>Recent Activity</span>
              </div>
              <Link href="#" className={adminStyles.sidebarHeaderLink}>
                View all
              </Link>
            </div>

            <div className={adminStyles.activityList}>
              <div className={adminStyles.activityItem}>
                <div className={adminStyles.activityTitle}>Grade R – Stationery Pack updated</div>
                <div className={adminStyles.activityMeta}>May 21, 2024 • 10:24 AM • Liam Morgan</div>
              </div>

              <div className={adminStyles.activityItem}>
                <div className={adminStyles.activityTitle}>Grade R – Stationery Pack created</div>
                <div className={adminStyles.activityMeta}>May 21, 2024 • 10:15 AM • Liam Morgan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
