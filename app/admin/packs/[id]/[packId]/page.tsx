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

  return (
    <div className={styles.page}>
      <p className={styles.backRow}>
        <Link href={backHref} className={styles.backLink}>
          <ArrowLeft aria-hidden="true" /> Back to {school ? `${school.name} packs` : "school packs"}
        </Link>
      </p>
      <div className={styles.stack}>
        <PackPriceForm
          packId={pack.id}
          price={pack.price}
          itemCount={items.length}
          subtotal={subtotal}
          schoolName={school?.name || ""}
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
