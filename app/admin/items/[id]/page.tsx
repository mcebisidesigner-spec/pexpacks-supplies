import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { listPacksForFilter } from "@/lib/admin/packs";
import { ItemForm } from "@/components/admin/items/ItemForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import adminStyles from "../../admin.module.css";

interface EditItemPageProps {
  params: Promise<{ id?: string; slug?: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

function safeReturnTo(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "/admin/products";
  if (!raw.startsWith("/admin/packs/")) return "/admin/products";
  if (raw.includes("://") || raw.startsWith("//")) return "/admin/products";
  return raw;
}

export default async function EditItemPage({ params, searchParams }: EditItemPageProps) {
  await requireAdmin({ permission: "items.edit" });
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const idOrSlug = resolvedParams.slug || resolvedParams.id;
  if (!idOrSlug) notFound();
  const returnTo = safeReturnTo(resolvedSearchParams.returnTo);

  const [item, packs] = await Promise.all([getItem(idOrSlug), listPacksForFilter()]);
  if (!item) notFound();

  return (
    <div className={adminStyles.adminContainer}>
      <AdminPageHeader
        title="Edit Item"
        subtitle={item.name}
        actions={
          <AdminButton
            href={returnTo}
            variant="secondary"
            icon={<ArrowLeft size={14} />}
          >
            {returnTo === "/admin/products" ? "Back to Products" : "Back to Pack"}
          </AdminButton>
        }
      />

      <ItemForm item={item} packs={packs} returnTo={returnTo} />
    </div>
  );
}
