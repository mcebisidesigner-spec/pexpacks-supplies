-- ===================================================
-- Pexpacks Supplies — Live Schema Reconciliation
-- Migration 00020: record live-DB tables/columns that were
-- previously applied directly to the production database
-- outside the migration history.
--
-- SAFETY: purely additive. Every statement is guarded with
-- IF NOT EXISTS, so this is a no-op on the current live DB
-- (which already contains these objects) and only provisions
-- them for fresh environments. No drops, no type changes,
-- no data changes.
-- ===================================================

-- 1. payments ledger (written by lib/orders.ts markOrderPaid)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference TEXT,
  gateway_reference TEXT,
  amount NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  payment_gateway TEXT NOT NULL DEFAULT 'ozow',
  status TEXT NOT NULL DEFAULT 'Complete',
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. lay-by applications (public application form submissions)
CREATE TABLE IF NOT EXISTS public.lay_by_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES public.form_submissions(id),
  applicant_name TEXT NOT NULL,
  id_number TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  residential_address TEXT NOT NULL,
  learner_name TEXT NOT NULL,
  school_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  pack_name TEXT NOT NULL,
  pexcover_requested BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_preference TEXT,
  estimated_total NUMERIC(12,2),
  deposit_amount NUMERIC(12,2),
  payment_term_months INT,
  debit_date_preference TEXT,
  notes TEXT,
  signature_name TEXT NOT NULL,
  signature_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. school waitlist entries
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. orders columns applied outside migrations
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pack_type TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_gateway TEXT,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS street_address TEXT,
  ADD COLUMN IF NOT EXISTS suburb TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- 5. form_submissions columns applied outside migrations
ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS data JSONB,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
