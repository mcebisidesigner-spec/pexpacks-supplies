-- 00051_create_quotations.sql
-- Quotations Master Table and Quotation Line Items Table

-- 1. Quotations Master Table
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(32) UNIQUE NOT NULL, -- e.g. "PX-Q-2027-0104"
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_phone TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'converted_to_order')),
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  vat_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  valid_until DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  notes TEXT,
  pdf_storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Quotation Line Items Table
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  master_product_id UUID REFERENCES public.master_products(id) ON DELETE SET NULL,
  item_title TEXT NOT NULL,
  sku TEXT,
  unit TEXT DEFAULT 'Each',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 3. Indexes & Covering Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_quotations_school ON public.quotations(school_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON public.quotations(quote_number);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON public.quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_master_product ON public.quotation_items(master_product_id);

-- 4. Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Admin full access to quotations" ON public.quotations;
CREATE POLICY "Admin full access to quotations" ON public.quotations
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'service_role'))
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'service_role'));

DROP POLICY IF EXISTS "Admin full access to quotation items" ON public.quotation_items;
CREATE POLICY "Admin full access to quotation items" ON public.quotation_items
  FOR ALL TO authenticated
  USING ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'service_role'))
  WITH CHECK ((SELECT auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin', 'service_role'));

-- 6. Storage bucket for quotations
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotations', 'quotations', true)
ON CONFLICT (id) DO UPDATE SET public = true;
