"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdmin } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/admin/rbac";
import { revalidateCatalog } from "@/lib/admin/catalog-revalidate";

export interface ClearMasterProductsResult {
  ok: boolean;
  deleted?: number;
  message?: string;
}

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

export async function clearMasterProductsAction(): Promise<ClearMasterProductsResult> {
  try {
    const session = await requireAdmin({ permission: "items.delete" });
    const admin = createSupabaseAdminClient();

    const { count: before } = await admin
      .from("master_products")
      .select("id", { count: "exact", head: true });

    // Delete in dependency order so ON DELETE RESTRICT / CASCADE links to
    // master_products cannot block the wipe. Order line items (order_items),
    // quotations (quotation_items) and legacy rows (stationery_items) keep
    // their history via ON DELETE SET NULL foreign keys.
    const tables: string[] = [
      "substitutions",
      "supplier_purchase_items",
      "procurement_requirements",
      "price_history",
      "supplier_offers",
      "school_pack_items",
      "master_products",
    ];

    for (const table of tables) {
      const { error } = await admin
        .from(table as never)
        .delete()
        .neq("id" as never, ZERO_UUID as never);
      if (error) {
        throw new Error(`Failed to clear ${table}: ${error.message}`);
      }
    }

    void writeAuditLog({
      actorId: session.user.id,
      actorName: session.user.email,
      action: "items.delete",
      entityType: "master_product",
      summary: `Cleared entire master catalogue (${before ?? 0} products)`,
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/items");
    revalidateCatalog();

    return { ok: true, deleted: before ?? 0 };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    console.error("[clearMasterProductsAction] error:", err);
    return {
      ok: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to clear the product catalogue.",
    };
  }
}

export async function deleteItemAction(id: string): Promise<void> {
  try {
    const session = await requireAdmin({ permission: "items.delete" });
    const admin = createSupabaseAdminClient();

    // Verify the product exists
    const { data: existing, error: fetchError } = await admin
      .from("master_products")
      .select("id, name, sku")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !existing) {
      // Not a master_product — try school_pack_items direct delete
      const { error: packItemError } = await admin
        .from("school_pack_items" as never)
        .delete()
        .eq("id" as never, id as never);
      if (packItemError) {
        throw new Error("Item not found or could not be deleted.");
      }
    } else {
      // It's a master_product — clean up FK references first, then delete
      await admin
        .from("school_pack_items" as never)
        .delete()
        .eq("product_id" as never, id as never);

      const { error: deleteError } = await admin
        .from("master_products")
        .delete()
        .eq("id", id);

      if (deleteError) {
        // FK violation still present — archive instead
        if (deleteError.code === "23503") {
          await admin
            .from("master_products")
            .update({ active: false } as never)
            .eq("id", id);
        } else {
          console.error("[deleteItemAction] delete failed:", deleteError);
          throw new Error("Failed to delete product: " + deleteError.message);
        }
      }

      void writeAuditLog({
        actorId: session.user.id,
        actorName: session.user.email,
        action: "items.delete",
        entityType: "master_product",
        entityId: id,
        summary: `Deleted product "${existing.name}" (${existing.sku})`,
      });
    }

    revalidatePath("/admin/products");
    revalidatePath("/admin/items");
    revalidatePath(`/admin/products/${id}`);
  } catch (err) {
    // Re-throw Next.js redirect/notFound errors — they must not be caught
    if (isRedirectError(err)) throw err;
    console.error("[deleteItemAction] error:", err);
    throw err;
  }

  redirect("/admin/products");
}
