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
import styles from "@/components/admin/packs/EditPack.module.css";

interface EditPackPageProps {
  params: Promise<{ id: string }>;
}

export default async function PackOrSchoolPacksPage({
  params,
}: EditPackPageProps) {
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
    0,
  );

  const schoolData = pack.school_id ? await getSchool(pack.school_id) : null;
  const schoolName = schoolData?.name || "3d Christian Academy";
  const backHref = schoolData
    ? `/admin/packs/${schoolData.slug || schoolData.id}`
    : "/admin/packs";

  return (
    <div className={styles.page}>
      <section className={styles.editorPanel}>
        <div className={styles.backRow}>
          <Link href={backHref} className={styles.backLink}>
            <ArrowLeft size={15} /> Back to [{schoolName}]
          </Link>
        </div>

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
      </section>
    </div>
  );
}
