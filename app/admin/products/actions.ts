"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { requireAdmin } from "@/lib/admin/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/admin/rbac";
import { SCHOOL_DATA_TAG } from "@/lib/school-utils";

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

    // Single tag revalidation instead of multiple revalidatePath calls
    revalidateTag(SCHOOL_DATA_TAG, { expire: 0 });
  } catch (err) {
    // Re-throw Next.js redirect/notFound errors — they must not be caught
    if (isRedirectError(err)) throw err;
    console.error("[deleteItemAction] error:", err);
    throw err;
  }

  redirect("/admin/products");
}
