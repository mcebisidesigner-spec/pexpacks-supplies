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

export async function saveProductWithVariantsAction(data: {
  masterProduct: {
    id: string;
    name: string;
    category: string;
    description: string;
    pack_unit: string;
    quantity: number;
    requires_covering: boolean;
    pexco_code: string;
  };
  variants: Array<{
    id: string;
    master_product_id: string;
    brand_id: string;
    brand_name: string;
    sku: string;
    cost_price: number;
    selling_price: number;
    supplier_id: string;
    supplier_name?: string;
    visible_on_catalogue: boolean;
  }>;
}): Promise<{ ok: boolean; message?: string }> {
  try {
    const session = await requireAdmin({ permission: "items.edit" });
    const admin = createSupabaseAdminClient();
    const { masterProduct, variants } = data;

    // 1. Update master product metadata
    const primaryVariant = variants[0];
    const updatePayload: Record<string, unknown> = {
      name: masterProduct.name.trim(),
      category: masterProduct.category || "Stationery",
      description: masterProduct.description?.trim() || null,
      specification: masterProduct.pack_unit?.trim() || null,
      requires_pexcover: masterProduct.requires_covering ?? false,
      pexco_code: masterProduct.requires_covering ? masterProduct.pexco_code : null,
      updated_at: new Date().toISOString(),
    };

    if (primaryVariant) {
      updatePayload.current_selling_price = primaryVariant.selling_price;
      updatePayload.latest_verified_cost = primaryVariant.cost_price;
      if (primaryVariant.supplier_id) {
        updatePayload.preferred_supplier_id = primaryVariant.supplier_id;
      }
      if (primaryVariant.brand_name) {
        updatePayload.brand = primaryVariant.brand_name;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: masterErr } = await (admin.from("master_products") as any)
      .update(updatePayload)
      .eq("id", masterProduct.id);

    if (masterErr) {
      console.warn("[saveProductWithVariantsAction] master_product update warning:", masterErr);
    }

    // 2. Sync variants in product_variants table (if migrated)
    try {
      if (variants.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variantsTable = admin.from("product_variants" as any) as any;
        for (const v of variants) {
          const variantPayload = {
            id: v.id.startsWith("var-") && !v.id.includes("-") ? undefined : v.id,
            master_product_id: masterProduct.id,
            brand_id: v.brand_id,
            sku: v.sku,
            cost_price: v.cost_price,
            selling_price: v.selling_price,
            supplier_id: v.supplier_id || null,
            visible_on_catalogue: v.visible_on_catalogue ?? true,
            updated_at: new Date().toISOString(),
          };
          await variantsTable.upsert(variantPayload, { onConflict: "master_product_id,brand_id" });
        }
      }
    } catch {
      // Graceful fallback if product_variants table is not yet migrated in current DB
    }

    void writeAuditLog({
      actorId: session.user.id,
      actorName: session.user.email,
      action: "items.edit",
      entityType: "master_product",
      entityId: masterProduct.id,
      summary: `Updated master product "${masterProduct.name}" with ${variants.length} variant(s)`,
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin/items");
    revalidatePath(`/admin/products/${masterProduct.id}`);
    const productSlug = masterProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (productSlug) {
      revalidatePath(`/admin/products/${productSlug}`);
      revalidatePath(`/admin/products/${productSlug}/edit`);
    }
    revalidateCatalog();

    return {
      ok: true,
      message: `Product "${masterProduct.name}" and ${variants.length} brand variant(s) saved successfully.`,
    };
  } catch (err) {
    console.error("[saveProductWithVariantsAction] error:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Failed to save product and variants.",
    };
  }
}
