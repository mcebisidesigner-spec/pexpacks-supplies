/**
 * Reusable Supabase Client-side SWR Fetcher Helper
 */

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function supabaseFetcher<T>(table: string, select = "*"): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .select(select);

  if (error) {
    throw new Error(error.message);
  }

  return data as T;
}
