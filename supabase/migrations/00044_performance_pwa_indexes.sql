-- ============================================================================
-- Migration: 00044_performance_pwa_indexes.sql
-- Purpose: PostGIS spatial performance, catalog lookup acceleration, and
--          high-concurrency query optimization for back-to-school traffic.
-- ============================================================================

-- 1. Enable PostGIS extension if not already present
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Spatial GIST Index for Sub-5ms Geo Distance Queries
CREATE INDEX IF NOT EXISTS idx_schools_location_gist
  ON public.schools USING GIST (location);

-- 3. Composite Index for Public School Directory and Search Lookups
CREATE INDEX IF NOT EXISTS idx_schools_search_composite
  ON public.schools (status, published, is_partner DESC, is_featured DESC, name ASC)
  WHERE status = 'active' AND published = true;

-- 4. District and City Indexes for Regional Filtering
CREATE INDEX IF NOT EXISTS idx_schools_district_trgm
  ON public.schools (district)
  WHERE district IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schools_city_trgm
  ON public.schools (city)
  WHERE city IS NOT NULL;

-- 5. Stationery Packs Grade-Level Composite Index
CREATE INDEX IF NOT EXISTS idx_stationery_packs_school_grade
  ON public.stationery_packs (school_id, grade_level, visible)
  WHERE visible = true;

-- 6. Stationery Items Pack Association and Price Calculation
CREATE INDEX IF NOT EXISTS idx_stationery_items_pack_calc
  ON public.stationery_items (pack_id, required_quantity, unit_price);

-- 7. High-Volume Cart / Checkout Idempotency Lookups
CREATE INDEX IF NOT EXISTS idx_orders_lookup_status
  ON public.orders (customer_email, status, created_at DESC);
