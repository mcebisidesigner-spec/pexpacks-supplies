import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getPack } from "@/lib/admin/packs";
import { PackPriceForm } from "@/components/admin/packs/PackPriceForm";
import { ItemsManager } from "@/components/admin/packs/ItemsManager";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";

interface EditPackPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPackPage({ params }: EditPackPageProps) {
  await requireAdmin({ permission: "packs.view" });
  const { id } = await params;
  const { pack, items } = await getPack(id);
  if (!pack) notFound();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unit_price ?? 0) * item.quantity,
    0
  );

  return (
    <div className={adminStyles.adminContainer}>
      <p>
        <Link href="/admin/packs" className={shared.resetLink}>
          ← Back to packs
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit pack</h1>
        <p className={adminStyles.subtitle}>{pack.title}</p>
      </div>
      <div className={adminStyles.stack}>
        <PackPriceForm packId={pack.id} price={pack.price} subtotal={subtotal} />
        <ItemsManager packId={pack.id} items={items} />
      </div>
    </div>
  );
}
