"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CSVStationeryRow {
  sku?: string;
  title: string;
  description?: string;
  unit_price: number;
  category?: string;
}

export async function bulkImportStationeryAction(items: CSVStationeryRow[]) {
  const supabase = await createSupabaseServerClient();

  // 1. Verify user authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized access");
  }

  if (!items || items.length === 0) {
    throw new Error("No items provided for import.");
  }

  // 2. Format & sanitize payload
  const formattedItems = items.map((item) => ({
    name: item.title.trim(),
    description: item.description?.trim() || null,
    unit_price: Math.max(0, Number(item.unit_price) || 0),
    specification: item.category?.trim() || "General",
    visible: true,
    updated_at: new Date().toISOString(),
  }));

  // 3. Batch Upsert to Supabase
  const { data, error } = await supabase
    .from("stationery_items")
    .upsert(formattedItems as any, {
      ignoreDuplicates: false,
    })
    .select("id");

  if (error) {
    throw new Error(`Database import failed: ${error.message}`);
  }

  revalidatePath("/admin/items");
  return { success: true, importedCount: data?.length ?? formattedItems.length };
}
