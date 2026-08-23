import Link from "next/link";
import { ArrowLeft, Building2, Edit, GraduationCap, ShieldCheck, User } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getSchool } from "@/lib/admin/schools";
import { listPacks } from "@/lib/admin/packs";
import { listOrders } from "@/lib/admin/orders";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { MetricCard } from "@/components/admin/ui/AdminCard";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ZarIcon } from "@/components/admin/ui/ZarIcon";
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
      <AdminPageHeader
        backHref="/admin/schools"
        backLabel="Back to Schools"
        title={school.name}
        subtitle={`${school.city || "South Africa"} ${school.province ? `• ${school.province}` : ""}`}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <StatusBadge
              status={school.is_partner ? "Partner School" : "Non-partner"}
              tone={school.is_partner ? "emerald" : "slate"}
              showDot
            />
            <AdminButton
              href={`/admin/packs/${school.slug || school.id}`}
              variant="teal"
              icon={<GraduationCap size={14} />}
            >
              Packs ({packData.total})
            </AdminButton>
            <AdminButton
              href={`/admin/schools/${school.id}/edit`}
              variant="primary"
              icon={<Edit size={14} />}
            >
              Edit School
            </AdminButton>
          </div>
        }
      />

      {/* 4 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
        <MetricCard
          label="Grade Packs"
          value={packData.total}
          subtext="Grade R through 12"
          icon={<GraduationCap size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Total Orders"
          value={totalOrders}
          subtext="Lifetime learner orders"
          icon={<Building2 size={16} />}
          iconTone="blue"
        />
        <MetricCard
          label="Gross Revenue"
          value={money(totalRevenue)}
          subtext="Generated pack sales"
          icon={<ZarIcon size={16} />}
          iconTone="green"
        />
        <MetricCard
          label="Rebate (1.5%)"
          value={money(rebateAmount)}
          subtext="School fundraising payout"
          icon={<ShieldCheck size={16} />}
          iconTone="amber"
        />
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
              <StatusBadge status={school.status || "active"} showDot />
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
                <span className={adminStyles.sidebarStatLabel}>Principal / Head:</span>
                <span className={adminStyles.sidebarStatVal}>{school.principal || "Principal Office"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Grades Covered:</span>
                <span className={adminStyles.sidebarStatVal}>
                  {school.grades
                    ? Array.isArray(school.grades)
                      ? school.grades.join(", ")
                      : String(school.grades)
                    : "Grade R - 7"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className={adminStyles.sidebarCard}>
            <div className={adminStyles.sidebarCardHeader}>
              <div className={adminStyles.sidebarHeaderTitle}>
                <User size={16} className={adminStyles.iconTeal} />
                <span>Contact &amp; Logistics</span>
              </div>
            </div>

            <div className={adminStyles["grid-2equal"]}>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Email:</span>
                <span className={adminStyles.sidebarStatVal}>{school.email || "admin@school.za"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Telephone:</span>
                <span className={adminStyles.sidebarStatVal}>{school.telephone || "—"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Address:</span>
                <span className={adminStyles.sidebarStatVal}>{school.address || "Main Campus"}</span>
              </div>
              <div className={adminStyles.sidebarStatRow}>
                <span className={adminStyles.sidebarStatLabel}>Parent Collection:</span>
                <span className={adminStyles.sidebarStatVal}>{school.parent_collection_accepted ? "Accepted" : "Direct Delivery Only"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
