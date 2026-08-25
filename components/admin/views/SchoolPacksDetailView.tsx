"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Box,
  ChevronRight,
  Clock,
  Copy,
  Download,
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
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { VisibleToggle } from "@/components/admin/packs/VisibleToggle";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

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

function extractGradeLabel(title: string, slug?: string | null): string {
  const text = `${title} ${slug ?? ""}`;
  const match = text.match(/grade\s*([r\d]+)/i);
  if (match) {
    const val = match[1].toUpperCase();
    return val === "R" ? "Grade R – Stationery Pack" : `Grade ${val} – Stationery Pack`;
  }
  return title;
}

export function SchoolPacksDetailView({
  school,
  initialPacks,
  deletePackAction,
}: SchoolPacksDetailViewProps) {
  const filteredPacks = initialPacks;

  const totalPacks = initialPacks.length;
  const { publishedPacks, totalItemsCount, totalRevenue } = useMemo(() => {
    let publishedPacks = 0;
    let totalItemsCount = 0;
    let totalRevenue = 0;
    for (const p of initialPacks) {
      if (p.visible) publishedPacks++;
      totalItemsCount += p.item_count || 0;
      totalRevenue += p.price || 0;
    }
    return { publishedPacks, totalItemsCount, totalRevenue };
  }, [initialPacks]);

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
          <AdminButton
            href={`/admin/packs/${schoolIdentifier}/add-pack`}
            variant="primary"
            icon={<Plus size={14} />}
          >
            Add Pack
          </AdminButton>
        }
      />

      {/* Metric Summary Row (5 cards) */}
      <div className={adminStyles.metricsGrid5}>
        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Grade Packs</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <Box size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{totalPacks}</div>
          <div className={styles.metricSubtext}>Configured</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Published</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconGreen}`}>
              <Zap size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{publishedPacks}</div>
          <div className={styles.metricSubtext}>Live on storefront</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Total Items</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconPurple}`}>
              <Layers size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{totalItemsCount}</div>
          <div className={styles.metricSubtext}>Across all packs</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Pack Value</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconEmerald}`}>
              <HeartPulse size={16} />
            </div>
          </div>
          <div className={adminStyles.metricValue}>{money(totalRevenue)}</div>
          <div className={styles.metricSubtext}>Catalogue total</div>
        </div>

        <div className={adminStyles.metricCard}>
          <div className={adminStyles.metricTop}>
            <span className={adminStyles.metricLabel}>Last Updated</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}>
              <Clock size={16} />
            </div>
          </div>
          <div className={`${adminStyles.metricValue} ${styles.metricValueDate}`}>
            May 21, 2024
          </div>
          <div className={styles.metricSubtext}>By Liam Morgan</div>
        </div>
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
                    <th>
                      <div className={styles.headerContent}>
                        <span>Total Items</span>
                        <span className={styles.sortIcon}>↑↓</span>
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerContent}>
                        <span>Status</span>
                        <span className={styles.sortIcon}>↑↓</span>
                      </div>
                    </th>
                    <th>
                      <div className={styles.headerContent}>
                        <span>Last Edited</span>
                        <span className={styles.sortIcon}>↑↓</span>
                      </div>
                    </th>
                    <th className={styles.alignRight}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPacks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={adminStyles.emptyCell}>
                        No grade packs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPacks.map((pack) => {
                      const formattedGrade = extractGradeLabel(pack.title, pack.slug);

                      return (
                        <tr key={pack.id} className={styles.dataRow}>
                          <td>
                            <div className={styles.productCell}>
                              <Link
                                href={`/admin/packs/${pack.slug || pack.id}`}
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
                            {money(pack.price)}
                          </td>
                          <td className={styles.textMuted}>
                            {pack.item_count} items
                          </td>
                          <td>
                            <StatusBadge
                              status={pack.visible ? "Active" : "Hidden"}
                              tone={pack.visible ? "emerald" : "slate"}
                              showDot
                            />
                          </td>
                          <td>
                            <div className={styles.textMuted}>May 21, 2024</div>
                            <div className={styles.productBrand}>Liam Morgan</div>
                          </td>
                          <td className={styles.alignRight}>
                            <div className={styles.actionsCell}>
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
