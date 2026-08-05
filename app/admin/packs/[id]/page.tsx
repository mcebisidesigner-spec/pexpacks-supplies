import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getPack, listPackSchools } from "@/lib/admin/packs";
import { PackForm } from "@/components/admin/packs/PackForm";
import { ItemsManager } from "@/components/admin/packs/ItemsManager";
import { updatePackAction } from "../actions";
import adminStyles from "../../admin.module.css";

interface EditPackPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPackPage({ params }: EditPackPageProps) {
  await requireAdmin({ permission: "packs.view" });
  const { id } = await params;
  const { pack, items } = await getPack(id);
  if (!pack) notFound();
  const schools = await listPackSchools();

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit pack</h1>
        <p className={adminStyles.subtitle}>{pack.title}</p>
      </div>
      <div className={adminStyles.stack}>
        <PackForm pack={pack} schools={schools} action={updatePackAction.bind(null, id)} />
        <ItemsManager packId={pack.id} items={items} />
      </div>
    </div>
  );
}
