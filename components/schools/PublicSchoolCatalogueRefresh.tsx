"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PublicSchoolCatalogueRefreshProps = {
  schoolId: string;
};

/** Refreshes an open school page when its admin-managed catalogue changes. */
export function PublicSchoolCatalogueRefresh({
  schoolId,
}: PublicSchoolCatalogueRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!schoolId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`public-catalogue:${schoolId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "public_catalogue_versions",
          filter: `school_id=eq.${schoolId}`,
        },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, schoolId]);

  return null;
}
