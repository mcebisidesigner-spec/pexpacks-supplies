import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type FilterOptions = {
  school_cities?: string[];
  school_provinces?: string[];
  pack_delivery_types?: string[];
  asset_folders?: string[];
};

async function fetchFilterOptions(): Promise<FilterOptions> {
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("get_admin_filter_options" as never);
    if (error || !data) return {};
    return data as FilterOptions;
  } catch {
    return {};
  }
}

export const getAdminFilterOptions = unstable_cache(
  fetchFilterOptions,
  ["admin-filter-options"],
  { revalidate: 300 }
);
