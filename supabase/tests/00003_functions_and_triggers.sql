-- pgTAP Automated Test: 00003_functions_and_triggers.sql
-- Verifies RPC signatures, trigger existence, and security definer search_path enforcement.

BEGIN;
SELECT plan(10);

-- 1. Verify Core Public RPCs Exist
SELECT has_function('public', 'get_public_school_directory', 'get_public_school_directory RPC must exist');
SELECT has_function('public', 'get_public_school_pack', ARRAY['uuid'], 'get_public_school_pack RPC must accept UUID pack id');
SELECT has_function('public', 'search_master_products_v2', ARRAY['text'], 'search_master_products_v2 RPC must accept search query text');

-- 2. Verify Database Trigger Attachments
SELECT has_trigger('public', 'master_products', 'trigger_update_master_products_updated_at', 'master_products must have updated_at trigger');
SELECT has_trigger('public', 'school_packs', 'trigger_update_school_packs_updated_at', 'school_packs must have updated_at trigger');
SELECT has_trigger('public', 'orders', 'trigger_update_orders_updated_at', 'orders must have updated_at trigger');

-- 3. Verify Security Definer search_path Safety
-- All SECURITY DEFINER functions must have proconfig containing search_path
SELECT is(
  (
    SELECT count(*)::integer
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND (p.proconfig IS NULL OR NOT EXISTS (
        SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'
      ))
  ),
  0,
  'All public SECURITY DEFINER functions must explicitly set search_path'
);

-- 4. Verify Pricing Calculation Integrity
SELECT has_function('public', 'recalculate_pack_pricing_bulk', 'Bulk pricing recalculation function must exist');
SELECT has_function('public', 'get_current_pricing_settings', 'Pricing settings lookup RPC must exist');
SELECT has_function('public', 'validate_order_items_checksum', ARRAY['uuid'], 'Order items checksum validation must exist');

SELECT * FROM finish();
ROLLBACK;
