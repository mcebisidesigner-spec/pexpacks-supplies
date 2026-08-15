import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/rbac";
import { getItem } from "@/lib/admin/items";
import { listPacksForFilter } from "@/lib/admin/packs";
import { ItemForm } from "@/components/admin/items/ItemForm";
import adminStyles from "../../admin.module.css";
import shared from "../../schools/schools.module.css";

interface EditItemPageProps {
  params: Promise<{ id?: string; slug?: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}

function safeReturnTo(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "/admin/items";
  if (!raw.startsWith("/admin/packs/")) return "/admin/items";
  if (raw.includes("://") || raw.startsWith("//")) return "/admin/items";
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
      <p>
        <Link href={returnTo} className={shared.resetLink}>
          {returnTo === "/admin/items" ? "Back to items" : "Back to pack"}
        </Link>
      </p>
      <div className={adminStyles.headerSection}>
        <h1 className={adminStyles.title}>Edit item</h1>
        <p className={adminStyles.subtitle}>{item.name}</p>
      </div>
      <ItemForm item={item} packs={packs} returnTo={returnTo} />
    </div>
  );
}
