import { requireAdmin } from "@/lib/admin/rbac";
import { listPackSchools } from "@/lib/admin/packs";
import { PackForm } from "@/components/admin/packs/PackForm";
import { createPackAction } from "../actions";
import adminStyles from "../../admin.module.css";

export const metadata = {
  title: "Add pack | Admin | Pexpacks",
};

export default async function NewPackPage() {
  await requireAdmin({ permission: "packs.create" });
  const schools = await listPackSchools();

  return (
    <div className={adminStyles.adminContainer}>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Add a pack</h1>
        <p className={adminStyles.subtitle}>
          Create a stationery pack. Add items to it after saving.
        </p>
      </div>
      <PackForm pack={null} schools={schools} action={createPackAction} />
    </div>
  );
}
