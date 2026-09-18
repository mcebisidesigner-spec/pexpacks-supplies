-- pgTAP Automated Test: 00001_schema_invariants.sql
-- Verifies database schema invariants, canonical tables, PKs, FKs, and required columns.

BEGIN;
SELECT plan(35);

-- 1. Verify Core Canonical Tables Exist
SELECT has_table('public', 'master_products', 'Canonical table master_products must exist');
SELECT has_table('public', 'school_packs', 'Canonical table school_packs must exist');
SELECT has_table('public', 'school_pack_items', 'Canonical table school_pack_items must exist');
SELECT has_table('public', 'orders', 'Canonical table orders must exist');
SELECT has_table('public', 'order_items', 'Canonical table order_items must exist');
SELECT has_table('public', 'system_settings', 'Canonical table system_settings must exist');
SELECT has_table('public', 'brands', 'Canonical table brands must exist');
SELECT has_table('public', 'quotations', 'Canonical table quotations must exist');
SELECT has_table('public', 'documents_letters', 'Canonical table documents_letters must exist');
SELECT has_table('public', 'suppliers', 'Canonical table suppliers must exist');
SELECT has_table('public', 'schools', 'Canonical table schools must exist');

-- 2. Verify Primary Key Invariants
SELECT has_pk('public', 'master_products', 'master_products must have a primary key');
SELECT has_pk('public', 'school_packs', 'school_packs must have a primary key');
SELECT has_pk('public', 'school_pack_items', 'school_pack_items must have a primary key');
SELECT has_pk('public', 'orders', 'orders must have a primary key');
SELECT has_pk('public', 'order_items', 'order_items must have a primary key');
SELECT has_pk('public', 'system_settings', 'system_settings must have a primary key');
SELECT has_pk('public', 'brands', 'brands must have a primary key');
SELECT has_pk('public', 'quotations', 'quotations must have a primary key');
SELECT has_pk('public', 'documents_letters', 'documents_letters must have a primary key');
SELECT has_pk('public', 'suppliers', 'suppliers must have a primary key');
SELECT has_pk('public', 'schools', 'schools must have a primary key');

-- 3. Verify Foreign Key Invariants
SELECT has_fk('public', 'school_pack_items', 'school_pack_items must have foreign key constraints');
SELECT has_fk('public', 'order_items', 'order_items must have foreign key constraints');

-- 4. Verify Critical Business Columns
SELECT has_column('public', 'master_products', 'id', 'master_products must have id column');
SELECT has_column('public', 'master_products', 'title', 'master_products must have title column');
SELECT has_column('public', 'master_products', 'sku', 'master_products must have sku column');
SELECT has_column('public', 'school_packs', 'school_id', 'school_packs must have school_id column');
SELECT has_column('public', 'school_packs', 'grade', 'school_packs must have grade column');
SELECT has_column('public', 'orders', 'status', 'orders must have status column');
SELECT has_column('public', 'orders', 'total_amount', 'orders must have total_amount column');
SELECT has_column('public', 'order_items', 'order_id', 'order_items must have order_id column');
SELECT has_column('public', 'order_items', 'quantity', 'order_items must have quantity column');
SELECT has_column('public', 'order_items', 'price_cents', 'order_items must have price_cents column');
SELECT has_column('public', 'system_settings', 'key', 'system_settings must have key column');

SELECT * FROM finish();
ROLLBACK;
