-- High-concurrency performance indexes for Supabase Postgres
-- Optimizes query performance for 10+ concurrent dashboard users, order checkout, & school catalog loading

-- 1. Stationery items indexes (pack lookup, item code search, name sorting)
CREATE INDEX IF NOT EXISTS idx_stationery_items_pack_id ON public.stationery_items (pack_id);
CREATE INDEX IF NOT EXISTS idx_stationery_items_category ON public.stationery_items (category);
CREATE INDEX IF NOT EXISTS idx_stationery_items_pack_price ON public.stationery_items (pack_id, unit_price, quantity);

-- 2. Stationery packs indexes (school lookup, slug matching, visibility)
CREATE INDEX IF NOT EXISTS idx_stationery_packs_school_id ON public.stationery_packs (school_id);
CREATE INDEX IF NOT EXISTS idx_stationery_packs_slug ON public.stationery_packs (slug);
CREATE INDEX IF NOT EXISTS idx_stationery_packs_school_visible ON public.stationery_packs (school_id, visible);

-- 3. Schools indexes (slug lookup, status)
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools (slug);
CREATE INDEX IF NOT EXISTS idx_schools_visible ON public.schools (visible);

-- 4. Orders & order items indexes (dashboard metrics, status filtering)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
