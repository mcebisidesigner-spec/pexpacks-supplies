-- Migration 00072: Add PEXCO05/PEXCO06 rows to pexco_rates
-- Required so master_products.pexco_code (FK -> pexco_rates.code) can accept the
-- full PEXCO classification set shown in the admin product form dropdown and the
-- System Control Centre covering-rates grid.
-- Covering defaults below are placeholders only: superusers set the authoritative
-- rates in System Control Centre -> Pricing & Margin (PEXCO Classification grid).

INSERT INTO public.pexco_rates (code, title, description, covering_price_cents, cost_price_cents, is_active)
VALUES
  ('PEXCO05', 'Heavy Hardcover Textbooks, Atlases & Dictionaries', 'Heavy hardcover textbooks, atlases, and dictionaries with maximum-protection bound covering & learner label', 2200, 1200, true),
  ('PEXCO06', 'Files & Ring Binders (Lever arch, display files)', 'Lever arch files, display files, and ring binders with specialized spine labeling/insert protection', 1000, 550, true)
ON CONFLICT (code) DO NOTHING;