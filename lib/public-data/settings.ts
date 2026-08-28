import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActivePublicSeason } from "./seasons";
import type { PublicSiteSettings } from "./contracts";
import { PEXCOVER_PRICE } from "@/lib/constants";
import { phoneNumber, generalEmail } from "@/data/contact";

export const SETTINGS_CACHE_TAG = "public-site-settings-v1";
export const SETTINGS_REVALIDATE_SECONDS = 3600;

export const DEFAULT_SITE_SETTINGS: PublicSiteSettings = {
  activeSeason: {
    id: "season-2027",
    name: "2027 Back-to-School",
    academicYear: 2027,
    isDefault: true,
    orderingStatus: "open",
  },
  supportPhone: phoneNumber || "0780036048",
  supportEmail: generalEmail || "helpme@pexpacks.co.za",
  whatsappNumber: "0780036048",
  whatsappUrl: "https://wa.me/27780036048",
  pexcoverPrice: PEXCOVER_PRICE,
  enabledPaymentMethods: ["ozow", "happypay"],
};

/**
 * Retrieves unified public configuration from database settings
 * and active season.
 */
export const getPublicSiteSettings = unstable_cache(
  async (): Promise<PublicSiteSettings> => {
    const activeSeason = await getActivePublicSeason();

    try {
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase
        .from("system_settings" as never)
        .select("key, value")
        .in("key", [
          "pricing.pexcover_price",
          "payments.ozow_enabled",
          "payments.happypay_enabled",
          "company.support_phone",
          "company.support_email",
        ]);

      const settingsMap = new Map(
        (data as Array<{ key: string; value: unknown }> || []).map((s) => [s.key, s.value])
      );

      const pexcoverVal = Number(settingsMap.get("pricing.pexcover_price"));
      const pexcoverPrice = Number.isFinite(pexcoverVal) && pexcoverVal > 0 ? pexcoverVal : PEXCOVER_PRICE;

      const ozowEnabled = settingsMap.get("payments.ozow_enabled") !== false;
      const happyPayEnabled = settingsMap.get("payments.happypay_enabled") !== false;
      const enabledPaymentMethods: ("ozow" | "happypay")[] = [];
      if (ozowEnabled) enabledPaymentMethods.push("ozow");
      if (happyPayEnabled) enabledPaymentMethods.push("happypay");

      const phone = String(settingsMap.get("company.support_phone") || DEFAULT_SITE_SETTINGS.supportPhone);
      const email = String(settingsMap.get("company.support_email") || DEFAULT_SITE_SETTINGS.supportEmail);

      return {
        activeSeason,
        supportPhone: phone,
        supportEmail: email,
        whatsappNumber: "0780036048",
        whatsappUrl: "https://wa.me/27780036048",
        pexcoverPrice,
        enabledPaymentMethods: enabledPaymentMethods.length ? enabledPaymentMethods : ["ozow", "happypay"],
      };
    } catch {
      return {
        ...DEFAULT_SITE_SETTINGS,
        activeSeason,
      };
    }
  },
  ["unified-public-site-settings"],
  { revalidate: SETTINGS_REVALIDATE_SECONDS, tags: [SETTINGS_CACHE_TAG] }
);
