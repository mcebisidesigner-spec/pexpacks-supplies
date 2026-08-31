-- Migration 00074: Drop redundant per-row pricing settings trigger
-- ============================================================================
-- ROOT CAUSE OF CONTINUED TIMEOUT:
--   The trigger trg_pricing_settings_sync fires recalculate_all_grade_pack_prices()
--   FOR EACH ROW updated in system_settings.
--
--   When the admin saves Pricing & Margin settings, the app upserts multiple
--   rows (e.g. target_margin_pct, packaging_cost, assembly_cost) in one call.
--   Each row fires the trigger independently WITHIN the same transaction:
--     - 3 settings changed → trigger fires 3 times
--     - 3 × ~7s recalculation = ~21s → statement timeout
--
--   Then the app layer (savePricingSettings in system-settings.ts:508) calls
--   recalculate_all_grade_pack_prices() a 4th time after the upsert anyway.
--
-- FIX:
--   Drop the DB trigger — it is completely redundant.
--   The app already handles recalculation explicitly once after all settings
--   are persisted. The trigger was double (or triple+) firing with no benefit.
-- ============================================================================

DROP TRIGGER IF EXISTS trg_pricing_settings_sync ON public.system_settings;

-- Note: fn_trg_pricing_settings_sync() function is retained but now inactive.
-- The app layer (lib/admin/system-settings.ts -> savePricingSettings) is the
-- single source of recalculation authority after settings changes.
