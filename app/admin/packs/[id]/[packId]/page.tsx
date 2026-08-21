import React from "react";
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

  // 1. Fetch School metadata
  const school = await getSchool(id);

  // 2. Fetch Pack details
  const { pack, items } = await getPack(packId);
  if (!pack) notFound();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unit_price ?? 0) * item.quantity,
    0
  );

  const schoolName = school?.name || "3d Christian Academy";
  const schoolSlugOrId = school?.slug || school?.id || id;
  const backHref = `/admin/packs/${schoolSlugOrId}`;

  return (
    <div className={styles.page} style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 0" }}>
      {/* Top Back Link matching reference screenshot */}
      <div style={{ marginBottom: 16 }}>
        <Link
          href={backHref}
          className={styles.backLink}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: "#94a3b8",
            textDecoration: "none",
            transition: "color 140ms ease",
          }}
        >
          <ArrowLeft size={15} /> Back to [{schoolName}]
        </Link>
      </div>

      {/* Main Stack Container */}
      <div className={styles.stack} style={{ gap: 20 }}>
        {/* Header Title, Items Count Badge, Subtitle & Save Pack Button */}
        <PackPriceForm
          packId={pack.id}
          price={pack.price}
          itemCount={items.length}
          subtotal={subtotal}
          schoolName={schoolName}
          packTitle={pack.title}
        />

        {/* Search Bar, Big Total Price & Items Table */}
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
