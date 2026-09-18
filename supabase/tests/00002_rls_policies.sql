-- pgTAP Automated Test: 00002_rls_policies.sql
-- Verifies Row-Level Security (RLS) enforcement, policy coverage, and role boundaries.

BEGIN;
SELECT plan(16);

-- 1. Verify RLS is Enabled on Core Public Tables
SELECT row_security_active('public', 'master_products');
SELECT row_security_active('public', 'school_packs');
SELECT row_security_active('public', 'school_pack_items');
SELECT row_security_active('public', 'orders');
SELECT row_security_active('public', 'order_items');
SELECT row_security_active('public', 'system_settings');
SELECT row_security_active('public', 'brands');
SELECT row_security_active('public', 'quotations');
SELECT row_security_active('public', 'documents_letters');
SELECT row_security_active('public', 'schools');
SELECT row_security_active('public', 'suppliers');

-- 2. Verify Policy Existence on Sensitive Operations
SELECT policies_are(
  'public',
  'system_settings',
  ARRAY[
    'admin_full_access_system_settings'
  ],
  'system_settings table must have admin access policy'
);

-- 3. Verify Anonymous Role Read Boundaries
SET LOCAL ROLE anon;

-- Anon should not be able to insert orders directly without application RPC
PREPARE insert_order_as_anon AS
  INSERT INTO orders (id, user_id, school_id, total_amount, status)
  VALUES (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 1000, 'pending');

SELECT throws_ok(
  'insert_order_as_anon',
  '42501',
  NULL,
  'Anon must not be able to directly insert orders'
);

-- Anon should not be able to read system_settings
PREPARE select_settings_as_anon AS
  SELECT * FROM system_settings;

SELECT throws_ok(
  'select_settings_as_anon',
  '42501',
  NULL,
  'Anon must not be able to select from system_settings'
);

-- Reset role
RESET ROLE;

-- 4. Verify Authenticated Admin Capabilities
-- Checks that admin helper function exists
SELECT has_function('public', 'is_admin', 'Helper function is_admin must exist');
SELECT has_function('public', 'has_permission', ARRAY['text'], 'Helper function has_permission must exist');

SELECT * FROM finish();
ROLLBACK;
