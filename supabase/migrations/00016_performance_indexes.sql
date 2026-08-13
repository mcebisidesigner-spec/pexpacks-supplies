-- ===================================================
-- Pexpacks Supplies — Database Performance Optimization
-- Migration 00016: Production High-Frequency Query Indexes
-- ===================================================

-- 1. Orders lookup & Reporting optimizations
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email 
  ON public.orders (buyer_email);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_at 
  ON public.orders (status, created_at DESC);

-- 2. Public school & Stationery pack listing optimizations
CREATE INDEX IF NOT EXISTS idx_stationery_packs_school_visible 
  ON public.stationery_packs (school_id, visible) 
  INCLUDE (id, title, slug, price);

CREATE INDEX IF NOT EXISTS idx_stationery_items_pack_visible 
  ON public.stationery_items (pack_id, visible, sort_order);
