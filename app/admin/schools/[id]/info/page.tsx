import Link from "next/link";
import { ArrowLeft, Building2, DollarSign, Edit, GraduationCap, ShieldCheck, User } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { listPacks } from "@/lib/admin/packs";
import { listOrders } from "@/lib/admin/orders";
import adminStyles from "@/app/admin/admin.module.css";
import styles from "@/components/admin/views/CorePagesView.module.css";

interface SchoolInfoPageProps {
  params: Promise<{ id: string }>;
}

function money(v: number): string {
  return `R ${v.toFixed(2)}`;
}

export default async function SchoolInfoPage({ params }: SchoolInfoPageProps) {
  await requireAdmin({ permission: "schools.view" });
  const { id } = await params;
  const school = await getSchool(id);
  if (!school) notFound();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isUuid && school.slug) {
    redirect(`/admin/schools/${school.slug}/info`);
  }

  const [packData, orderData] = await Promise.all([
    listPacks({ school_id: school.id, pageSize: 100 }),
    listOrders({ q: school.name, pageSize: 50 }),
  ]);

  const totalOrders = orderData.total;
  const totalRevenue = orderData.orders.reduce((sum, o) => sum + (o.estimated_total || 0), 0);
  const rebateAmount = totalRevenue * 0.015; // Agreed school rebate percentage: 1.5%

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div>
        <Link href="/admin/schools" className={`${styles.secondaryBtn} ${adminStyles.backLinkOverride}`}>
          <ArrowLeft size={14} /> Back to schools
        </Link>
      </div>

      {/* Header */}
      <div className={adminStyles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {school.name}
            <span className={school.is_partner ? adminStyles.badgeGreen : adminStyles.badgeDark}>
              ● {school.is_partner ? "Partner School" : "Non-partner"}
            </span>
          </h1>
          <p className={styles.headerSubtitle}>
            {school.city || "South Africa"} {school.province ? `• ${school.province}` : ""}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/admin/schools/${school.id}/edit`} className={styles.primaryBtn}>
            <Edit size={14} /> Edit School
          </Link>
          <Link href={`/admin/packs/${school.slug || school.id}`} className={styles.secondaryBtn}>
            <GraduationCap size={14} /> View Grade Packs ({packData.total})
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className={adminStyles.kpiRowGrid}>
        <div className={adminStyles.kpiCardFixed}>
          <div className={adminStyles.kpiCardTop}>
            <span className={adminStyles.kpiCardLabel}>Grade Packs</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconTeal}`}>
              <GraduationCap size={16} />
            </div>
          </div>
          <div className={adminStyles.kpiCardValue}>{packData.total}</div>
          <div className={adminStyles.kpiCardCaption}>Grade R through 12</div>
        </div>

        <div className={adminStyles.kpiCardFixed}>
          <div className={adminStyles.kpiCardTop}>
            <span className={adminStyles.kpiCardLabel}>Total Orders</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconBlue}`}>
              <Building2 size={16} />
            </div>
          </div>
          <div className={adminStyles.kpiCardValue}>{totalOrders}</div>
          <div className={adminStyles.kpiCardCaption}>Lifetime learner orders</div>
        </div>

        <div className={adminStyles.kpiCardFixed}>
          <div className={adminStyles.kpiCardTop}>
            <span className={adminStyles.kpiCardLabel}>Total Gross Revenue</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconGreen}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={adminStyles.kpiCardValue}>{money(totalRevenue)}</div>
          <div className={adminStyles.kpiCardCaption}>Generated sales</div>
        </div>

        <div className={adminStyles.kpiCardFixed}>
          <div className={adminStyles.kpiCardTop}>
            <span className={adminStyles.kpiCardLabel}>School Rebate (1.5%)</span>
            <div className={`${adminStyles.metricIconWrapper} ${adminStyles.metricIconAmber}`}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className={`${adminStyles.kpiCardValue} ${adminStyles["c-amber"]}`}>{money(rebateAmount)}</div>
          <div className={adminStyles.kpiCardCaption}>Agreed payout ledger</div>
        </div>
      </div>

      {/* Main Details & Contact Section */}
      <div className={adminStyles.detailBodyGrid}>
        <div className={adminStyles.detailBodyMain}>
          {/* Metadata Card */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <Building2 size={16} className={adminStyles.iconTeal} />
                <span>School Metadata & Overview</span>
              </div>
              <span className={adminStyles.badgeTeal}>{school.status}</span>
            </div>

            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>EMIS Number:</span>
                <span className={adminStyles.sidebarStatVal}>EMIS-{school.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>District:</span>
                <span className={adminStyles.sidebarStatVal}>{school.district || "Tshwane"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Physical Address:</span>
                <span className={adminStyles.sidebarStatVal}>{school.address || "Not specified"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Parent Collection:</span>
                <span className={adminStyles.sidebarStatVal}>{school.parent_collection_accepted ? "Accepted" : "School delivery only"}</span>
              </div>
            </div>
          </div>

          {/* Assigned Grade Packs */}
          <div className={adminStyles.tableCard}>
            <div className={`${adminStyles["p-12"]} ${adminStyles["fw-700"]} ${adminStyles["border-b"]} ${adminStyles["c-white"]} ${adminStyles.flex} ${adminStyles["items-center"]} ${adminStyles["justify-between"]}`}>
              <span>Assigned Grade Packs</span>
              <Link href={`/admin/packs/${school.slug || school.id}`} className={`${adminStyles["text-11"]} ${adminStyles["c-teal"]}`}>
                Manage Packs →
              </Link>
            </div>
            <div className={adminStyles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>PACK TITLE</th>
                    <th>PRICE</th>
                    <th>ITEMS</th>
                    <th>VISIBILITY</th>
                  </tr>
                </thead>
                <tbody>
                  {packData.packs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`${adminStyles["text-center"]} ${adminStyles["c-subtle"]}`} style={{ padding: 24 }}>
                        No grade packs assigned yet.
                      </td>
                    </tr>
                  ) : (
                    packData.packs.map((p) => (
                      <tr key={p.id} className={styles.dataRow}>
                        <td><strong className={adminStyles["c-white"]}>{p.title}</strong></td>
                        <td className={`${adminStyles["c-white"]} ${adminStyles["fw-600"]}`}>{money(p.price)}</td>
                        <td>{p.item_count} items</td>
                        <td>
                          <span className={p.visible ? adminStyles.badgeTeal : adminStyles.badgeDark}>
                            {p.visible ? "Visible" : "Hidden"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Contacts & Financial Payout Ledger */}
        <div className={adminStyles.sidebarColumn}>
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <User size={16} className={adminStyles.iconTeal} />
                <span>Primary Contacts</span>
              </div>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Principal / Admin:</span>
              <span className={adminStyles.sidebarStatVal}>{school.principal || "Principal Office"}</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Email:</span>
              <span className={`${adminStyles.sidebarStatVal} ${adminStyles["text-11"]} ${adminStyles["c-blue"]}`}>{school.email || "info@pexpacks.co.za"}</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Telephone:</span>
              <span className={adminStyles.sidebarStatVal}>{school.telephone || "N/A"}</span>
            </div>
          </div>

          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <ShieldCheck size={16} className={adminStyles.iconAmber} />
                <span>Rebate Payout Ledger</span>
              </div>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Rebate Rate:</span>
              <span className={adminStyles.sidebarStatVal}>1.5% fixed</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Accrued Rebate:</span>
              <span className={`${adminStyles.sidebarStatVal} ${adminStyles["c-green"]} ${adminStyles["fw-700"]}`}>{money(rebateAmount)}</span>
            </div>
            <div className={adminStyles.sidebarStatRow}>
              <span className={adminStyles.sidebarStatLabel}>Payout Status:</span>
              <span className={adminStyles.badgeGreen}>Up to Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
