import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PublicSeason } from "./contracts";

export const SEASON_CACHE_TAG = "public-season-v1";
export const SEASON_REVALIDATE_SECONDS = 3600;

export const DEFAULT_PUBLIC_SEASON: PublicSeason = {
  id: "season-2027",
  name: "2027 Back-to-School",
  academicYear: 2027,
  isDefault: true,
  orderingStatus: "open",
  orderingOpensAt: "2026-09-01",
  orderingClosesAt: "2027-02-28",
  fulfilmentStart: "2026-12-01",
  fulfilmentEnd: "2027-01-31",
};

export const DEFAULT_PACKS_BADGE = `${DEFAULT_PUBLIC_SEASON.academicYear} Packs`;

/**
 * Retrieves the authoritative active public commercial season.
 * Queries Supabase `seasons` table where `is_default = true` or `status = 'active'`.
 * Falls back to default 2027 season if unconfigured.
 */
export const getActivePublicSeason = unstable_cache(
  async (): Promise<PublicSeason> => {
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase
        .from("seasons" as never)
        .select("id, name, academic_year, status, is_default, starts_on, ordering_closes_on, fulfilment_starts_on, fulfilment_ends_on")
        .or("is_default.eq.true,status.eq.active")
        .order("is_default", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return DEFAULT_PUBLIC_SEASON;
      }

      const row = data as {
        id: string;
        name: string;
        academic_year: number;
        status: string;
        is_default: boolean;
        starts_on?: string | null;
        ordering_closes_on?: string | null;
        fulfilment_starts_on?: string | null;
        fulfilment_ends_on?: string | null;
      };

      let orderingStatus: PublicSeason["orderingStatus"] = "open";
      if (row.status === "closed" || row.status === "archived") {
        orderingStatus = "closed";
      } else if (row.status === "planning") {
        orderingStatus = "coming_soon";
      }

      return {
        id: row.id,
        name: row.name,
        academicYear: row.academic_year || 2027,
        isDefault: Boolean(row.is_default),
        orderingStatus,
        orderingOpensAt: row.starts_on,
        orderingClosesAt: row.ordering_closes_on,
        fulfilmentStart: row.fulfilment_starts_on,
        fulfilmentEnd: row.fulfilment_ends_on,
      };
    } catch {
      return DEFAULT_PUBLIC_SEASON;
    }
  },
  ["active-public-season"],
  { revalidate: SEASON_REVALIDATE_SECONDS, tags: [SEASON_CACHE_TAG] }
);
