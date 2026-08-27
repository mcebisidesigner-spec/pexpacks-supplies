-- ============================================================================
-- 00055: Permanent Legacy Cleanup & Schema Hardening
-- ============================================================================

BEGIN;

-- 1. Recreate Data Quality Issues View to be 100% Canonical
DROP VIEW IF EXISTS public.admin_data_quality_issues_view CASCADE;

CREATE VIEW public.admin_data_quality_issues_view
WITH (security_invoker = true)
AS
SELECT 'schools'::text AS area, 'missing_name_or_slug'::text AS issue, count(*) AS issue_count
FROM public.schools
WHERE NULLIF(TRIM(name), '') IS NULL OR NULLIF(TRIM(slug), '') IS NULL
UNION ALL
SELECT 'schools'::text AS area, 'duplicate_slug'::text AS issue, count(*) AS issue_count
FROM (SELECT lower(slug) FROM public.schools WHERE slug IS NOT NULL GROUP BY lower(slug) HAVING count(*) > 1) d
UNION ALL
SELECT 'packs'::text AS area, 'missing_title_or_slug'::text AS issue, count(*) AS issue_count
FROM public.school_packs
WHERE NULLIF(TRIM(title), '') IS NULL OR NULLIF(TRIM(slug), '') IS NULL
UNION ALL
SELECT 'packs'::text AS area, 'negative_price'::text AS issue, count(*) AS issue_count
FROM public.school_packs
WHERE price < 0
UNION ALL
SELECT 'products'::text AS area, 'missing_sku_or_name'::text AS issue, count(*) AS issue_count
FROM public.master_products
WHERE NULLIF(TRIM(sku), '') IS NULL OR NULLIF(TRIM(name), '') IS NULL
UNION ALL
SELECT 'products'::text AS area, 'duplicate_sku'::text AS issue, count(*) AS issue_count
FROM (SELECT upper(sku) FROM public.master_products WHERE sku IS NOT NULL GROUP BY upper(sku) HAVING count(*) > 1) d
UNION ALL
SELECT 'products'::text AS area, 'negative_price'::text AS issue, count(*) AS issue_count
FROM public.master_products
WHERE current_selling_price < 0
UNION ALL
SELECT 'pack_composition'::text AS area, 'missing_pack_or_product_reference'::text AS issue, count(*) AS issue_count
FROM public.school_pack_items spi
LEFT JOIN public.school_packs p ON p.id = spi.pack_id
LEFT JOIN public.master_products mp ON mp.id = spi.product_id
WHERE p.id IS NULL OR mp.id IS NULL
UNION ALL
SELECT 'pack_composition'::text AS area, 'bad_quantity_or_price'::text AS issue, count(*) AS issue_count
FROM public.school_pack_items
WHERE pack_quantity <= 0 OR COALESCE(selling_price_override, 0) < 0
UNION ALL
SELECT 'orders'::text AS area, 'orders_without_order_items'::text AS issue, count(*) AS issue_count
FROM public.orders o
WHERE NOT EXISTS (SELECT 1 FROM public.order_items oi WHERE oi.order_id = o.id)
UNION ALL
SELECT 'orders'::text AS area, 'bad_order_item_quantity_or_total'::text AS issue, count(*) AS issue_count
FROM public.order_items
WHERE quantity <= 0 OR unit_selling_price < 0 OR line_total < 0;

GRANT SELECT ON public.admin_data_quality_issues_view TO authenticated, service_role;

-- 2. Drop Legacy Columns on Canonical Tables
ALTER TABLE public.school_pack_items 
  DROP COLUMN IF EXISTS legacy_item_id;

-- 3. Permanently Drop Archive Schema and Deprecated Data
DROP SCHEMA IF EXISTS legacy_archive CASCADE;

COMMIT;

-- 4. VACUUM & REINDEX for Optimal Database Performance
VACUUM ANALYZE public.master_products;
VACUUM ANALYZE public.school_packs;
VACUUM ANALYZE public.school_pack_items;
