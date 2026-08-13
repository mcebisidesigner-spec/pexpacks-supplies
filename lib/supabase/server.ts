import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Creates a server-side Supabase client with cookie management.
 * Note: Under high concurrency (1,500+ users), @supabase/ssr utilizes
 * Supabase's HTTP REST Gateway (Kong) which automatically manages 
 * pooled PostgreSQL connections via Supavisor Transaction Pooler.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore — called from Server Components where mutation is blocked
          }
        },
      },
    }
  );
}
