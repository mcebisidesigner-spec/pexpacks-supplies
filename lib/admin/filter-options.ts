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
    const rpc = admin.rpc as unknown as (
      fn: string
    ) => Promise<{ data: FilterOptions | null; error: unknown }>;
    const { data, error } = await rpc("get_admin_filter_options");
    if (error || !data) return {};
    return data;
  } catch {
    return {};
  }
}

export const getAdminFilterOptions = unstable_cache(
  fetchFilterOptions,
  ["admin-filter-options"],
  { revalidate: 300 }
);
