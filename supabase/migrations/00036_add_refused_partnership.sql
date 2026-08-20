-- ===================================================
-- Migration: Add refused_partnership to public.schools
-- ===================================================

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS refused_partnership boolean DEFAULT false NOT NULL;
