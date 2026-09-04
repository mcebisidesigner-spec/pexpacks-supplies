BEGIN;

-- 1. Create Document Management Tables
CREATE TABLE IF NOT EXISTS public.admin_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT NOT NULL UNIQUE, -- e.g. PX-DOC-2026-0042
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  
  -- Recipient Metadata (Works for DB schools or private international clients)
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('registered_school', 'private_client')),
  recipient_organization TEXT NOT NULL,
  recipient_title TEXT,                  -- e.g. "The Principal & SGB"
  recipient_name TEXT NOT NULL,           -- e.g. "Dr. Sarah Jenkins"
  recipient_email TEXT NOT NULL,
  recipient_country TEXT DEFAULT 'South Africa',
  recipient_address TEXT,
  
  -- Letter Payload
  subject TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  include_quotation BOOLEAN DEFAULT false,
  quotation_data JSONB DEFAULT '{}'::jsonb, -- Snapshot of item rows, totals, currency
  
  -- Signatory Metadata
  signatory_name TEXT NOT NULL DEFAULT 'Mcebisi Hlatshwayo',
  signatory_title TEXT NOT NULL DEFAULT 'Managing Director',
  
  -- Audit & Delivery Tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'emailed', 'archived')),
  last_emailed_at TIMESTAMPTZ,
  pdf_storage_path TEXT,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Indexes for Fast Admin Lookups
CREATE INDEX IF NOT EXISTS idx_admin_letters_school ON public.admin_letters(school_id);
CREATE INDEX IF NOT EXISTS idx_admin_letters_ref ON public.admin_letters(reference_number);
CREATE INDEX IF NOT EXISTS idx_admin_letters_quotation ON public.admin_letters(quotation_id);
CREATE INDEX IF NOT EXISTS idx_admin_letters_status ON public.admin_letters(status);
CREATE INDEX IF NOT EXISTS idx_admin_letters_created ON public.admin_letters(created_at DESC);

-- 3. RLS Security Policies
ALTER TABLE public.admin_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated staff full access" 
  ON public.admin_letters 
  FOR ALL 
  TO authenticated 
  USING (true)
  WITH CHECK (true);

COMMIT;
