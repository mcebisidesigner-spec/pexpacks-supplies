import { requireAdmin } from "@/lib/admin/rbac";
import { listPackSchools, listTemplatePacks } from "@/lib/admin/packs";
import { PackForm } from "@/components/admin/packs/PackForm";
import { createPackAction } from "../actions";
import adminStyles from "../../admin.module.css";

export const metadata = {
  title: "Add pack | Admin | Pexpacks",
};

export default async function NewPackPage() {
  await requireAdmin({ permission: "packs.create" });
  const [schools, templatePacks] = await Promise.all([
    listPackSchools(),
    listTemplatePacks(),
  ]);

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Add a pack</h1>
        <p className={adminStyles.subtitle}>
          Create a stationery pack. It adopts the school&apos;s pack layout from a
          template, then you update the data and items.
        </p>
      </div>
      <PackForm
        pack={null}
        schools={schools}
        templatePacks={templatePacks}
        action={createPackAction}
      />
    </div>
  );
}
