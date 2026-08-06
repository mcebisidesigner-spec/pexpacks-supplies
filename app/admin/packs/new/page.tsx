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
          Choose a school and add a grade to create its stationery pack. The
          public pack card is built automatically from the live site data.
        </p>
      </div>
      <PackForm schools={schools} action={createPackAction} />
    </div>
  );
}
