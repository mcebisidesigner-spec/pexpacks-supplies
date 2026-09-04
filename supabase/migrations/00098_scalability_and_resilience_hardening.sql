-- ============================================================================
-- Migration 00098: Scalability & Resilience Hardening for Peak Concurrency
-- ============================================================================

-- 1. High-Frequency Composite Indexes for Peak Parent & Warehouse Concurrency
CREATE INDEX IF NOT EXISTS idx_orders_school_slug_grade 
  ON public.orders (school_slug, grade);

CREATE INDEX IF NOT EXISTS idx_orders_school_name_grade 
  ON public.orders (school_name, grade);

CREATE INDEX IF NOT EXISTS idx_orders_status_school_slug 
  ON public.orders (status, school_slug);

CREATE INDEX IF NOT EXISTS idx_orders_status_created_composite 
  ON public.orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_composite 
  ON public.order_items (order_id, pack_id);

CREATE INDEX IF NOT EXISTS idx_school_packs_school_visible_order 
  ON public.school_packs (school_id, visible, sort_order)
  WHERE visible IS TRUE;

-- 2. Optimize Public Read RLS on school_packs (Eliminate Correlated Subqueries & Support Authenticated Parents)
DROP POLICY IF EXISTS "Public read school_packs" ON public.school_packs;

CREATE POLICY "Public read school_packs"
  ON public.school_packs
  FOR SELECT
  TO anon, authenticated
  USING (
    visible IS TRUE 
    AND (
      publication_status = 'published' 
      OR publication_status IS NULL
    )
  );

-- 3. Idempotency Column for Receipt Email Dispatch
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS receipt_email_sent_at timestamp with time zone DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_paid_receipt_pending 
  ON public.orders (id) 
  WHERE status = 'paid' AND receipt_email_sent_at IS NULL;
