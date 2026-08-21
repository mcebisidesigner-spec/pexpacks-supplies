import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getPack } from "@/lib/admin/packs";
import { getSchool } from "@/lib/admin/schools";
import { PackPriceForm } from "@/components/admin/packs/PackPriceForm";
import { PackItemsSection } from "@/components/admin/packs/PackItemsSection";
import styles from "@/components/admin/packs/EditPack.module.css";

interface NestedEditPackPageProps {
  params: Promise<{ id: string; packId: string }>;
}

export default async function NestedEditPackPage({ params }: NestedEditPackPageProps) {
  const session = await requireAdmin({ permission: "packs.view" });
  const { id, packId } = await params;

  // 1. Fetch School metadata for back link
  const school = await getSchool(id);

  // 2. Fetch Pack details
  const { pack, items } = await getPack(packId);
  if (!pack) notFound();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unit_price ?? 0) * item.quantity,
    0
  );

  const backHref = school ? `/admin/packs/${school.slug || school.id}` : "/admin/packs";
  const schoolName = school?.name || "Dawnview High priv";
  const isVisible = pack.visible ?? true;

  return (
    <div className={styles.page}>
      {/* Top Back Link */}
      <div style={{ marginBottom: 12 }}>
        <Link
          href={backHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: "#94a3b8",
            textDecoration: "none",
            transition: "color 140ms ease",
          }}
        >
          <ArrowLeft size={14} /> Back to {schoolName}
        </Link>
      </div>

      {/* Header Row */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          Edit School: {schoolName}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 12,
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#10b981",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 8 }}>●</span> {isVisible ? "active" : "draft"}
          </span>
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#94a3b8" }}>
          Update school profile, primary contacts, address, grades, search badge, logo, and partnership status.
        </p>
      </div>

      {/* Main 2-Column Layout */}
      <div className={styles.stack}>
        <PackPriceForm
          packId={pack.id}
          price={pack.price}
          itemCount={items.length}
          subtotal={subtotal}
          schoolName={schoolName}
          packTitle={pack.title}
        />
        <PackItemsSection
          packId={pack.id}
          packTitle={pack.title}
          items={items}
          subtotal={subtotal}
          showImporter={hasPermission(session, "items.import")}
        />
      </div>
    </div>
  );
}
