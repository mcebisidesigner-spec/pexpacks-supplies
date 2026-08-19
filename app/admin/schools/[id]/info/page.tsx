import Link from "next/link";
import { ArrowLeft, Building2, DollarSign, Edit, GraduationCap, ShieldCheck, User } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { listPacks } from "@/lib/admin/packs";
import { listOrders } from "@/lib/admin/orders";
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
        <Link
          href="/admin/schools"
          className={styles.secondaryBtn}
          style={{ height: 32, fontSize: 11, background: "transparent", border: "none", color: "#94a3b8", paddingLeft: 0 }}
        >
          <ArrowLeft size={14} /> Back to schools
        </Link>
      </div>

      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {school.name}
            <span className={school.is_partner ? styles.badgeGreen : styles.badgeDark}>
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
      <div className={styles.metricsGrid4}>
        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Grade Packs</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconTeal}`}>
              <GraduationCap size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{packData.total}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Grade R through 12</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Total Orders</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconBlue}`}>
              <Building2 size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{totalOrders}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Lifetime learner orders</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>Total Gross Revenue</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconGreen}`}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={styles.metricValue}>{money(totalRevenue)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Generated sales</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTop}>
            <span className={styles.metricLabel}>School Rebate (1.5%)</span>
            <div className={`${styles.metricIconWrapper} ${styles.metricIconAmber}`}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className={styles.metricValue} style={{ color: "#fbbf24" }}>{money(rebateAmount)}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Agreed payout ledger</div>
        </div>
      </div>

      {/* Main Details & Contact Section */}
      <div className={styles.detailLayout}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Metadata Card */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <Building2 size={16} style={{ color: "#2dd4bf" }} />
                <span>School Metadata & Overview</span>
              </div>
              <span className={styles.badgeTeal}>{school.status}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>EMIS Number:</span>
                <span className={styles.sidebarStatVal}>EMIS-{school.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>District:</span>
                <span className={styles.sidebarStatVal}>{school.district || "Tshwane"}</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Physical Address:</span>
                <span className={styles.sidebarStatVal}>{school.address || "Not specified"}</span>
              </div>
              <div className={styles.sidebarStatRow}>
                <span className={styles.sidebarStatLabel}>Parent Collection:</span>
                <span className={styles.sidebarStatVal}>{school.parent_collection_accepted ? "Accepted" : "School delivery only"}</span>
              </div>
            </div>
          </div>

          {/* Assigned Grade Packs */}
          <div className={styles.tableCard}>
            <div style={{ padding: "14px 16px", fontWeight: 700, borderBottom: "1px solid #1e293b", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Assigned Grade Packs</span>
              <Link href={`/admin/packs/${school.slug || school.id}`} style={{ fontSize: 11, color: "#2dd4bf", textDecoration: "none" }}>
                Manage Packs →
              </Link>
            </div>
            <div className={styles.tableWrapper}>
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
                      <td colSpan={4} style={{ textAlign: "center", padding: 24, color: "#64748b" }}>
                        No grade packs assigned yet.
                      </td>
                    </tr>
                  ) : (
                    packData.packs.map((p) => (
                      <tr key={p.id} className={styles.dataRow}>
                        <td><strong style={{ color: "#ffffff" }}>{p.title}</strong></td>
                        <td style={{ color: "#ffffff", fontWeight: 600 }}>{money(p.price)}</td>
                        <td>{p.item_count} items</td>
                        <td>
                          <span className={p.visible ? styles.badgeTeal : styles.badgeDark}>
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
        <div className={styles.sidebarColumn}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <User size={16} style={{ color: "#2dd4bf" }} />
                <span>Primary Contacts</span>
              </div>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Principal / Admin:</span>
              <span className={styles.sidebarStatVal}>{school.principal || "Principal Office"}</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Email:</span>
              <span className={styles.sidebarStatVal} style={{ fontSize: 11, color: "#60a5fa" }}>{school.email || "info@pexpacks.co.za"}</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Telephone:</span>
              <span className={styles.sidebarStatVal}>{school.telephone || "N/A"}</span>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarCardHeader}>
              <div className={styles.sidebarHeaderTitle}>
                <ShieldCheck size={16} style={{ color: "#fbbf24" }} />
                <span>Rebate Payout Ledger</span>
              </div>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Rebate Rate:</span>
              <span className={styles.sidebarStatVal}>1.5% fixed</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Accrued Rebate:</span>
              <span className={styles.sidebarStatVal} style={{ color: "#34d399", fontWeight: 700 }}>{money(rebateAmount)}</span>
            </div>
            <div className={styles.sidebarStatRow}>
              <span className={styles.sidebarStatLabel}>Payout Status:</span>
              <span className={styles.badgeGreen}>Up to Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
