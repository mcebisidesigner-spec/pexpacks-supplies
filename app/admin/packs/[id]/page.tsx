import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { hasPermission, requireAdmin } from "@/lib/admin/rbac";
import { getPack, listPacks } from "@/lib/admin/packs";
import { deletePackAction } from "../actions";
import { getSchool } from "@/lib/admin/schools";
import { PackPriceForm } from "@/components/admin/packs/PackPriceForm";
import { PackItemsSection } from "@/components/admin/packs/PackItemsSection";
import { SchoolPacksDetailView } from "@/components/admin/views/SchoolPacksDetailView";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";

interface EditPackPageProps {
  params: Promise<{ id: string }>;
}

export default async function PackOrSchoolPacksPage({ params }: EditPackPageProps) {
  const session = await requireAdmin({ permission: "packs.view" });
  const { id } = await params;

  // 1. Check if slug/ID matches a School (e.g. /admin/packs/3d-christian-academy)
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

  // 2. Otherwise, check if slug/ID matches a Grade Pack ID
  const { pack, items } = await getPack(id);
  if (!pack) notFound();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unit_price ?? 0) * item.quantity,
    0
  );

  return (
    <div className={adminStyles.adminContainer}>
      <p style={{ marginBottom: 12 }}>
        <Link href="/admin/packs" prefetch={false} className={shared.resetLink}>
          <ArrowLeft aria-hidden="true" /> Back to school packs
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit pack</h1>
        <p className={adminStyles.subtitle}>{pack.title}</p>
      </div>
      <div className={adminStyles.stack}>
        <PackPriceForm
          packId={pack.id}
          price={pack.price}
          itemCount={items.length}
          subtotal={subtotal}
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
