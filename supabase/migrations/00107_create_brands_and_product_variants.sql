-- Migration 00107: Create Brands and Product Variants for Master Products
-- Enables multi-brand variant management across the Pexpacks catalog

-- 1. Brands Directory Table
create table if not exists public.brands (
  id text primary key default gen_random_uuid()::text,
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Pre-seed South African Stationery Brands
insert into public.brands (name) values
  ('Aspire'),
  ('Bantex'),
  ('Bic'),
  ('Croxley'),
  ('Faber-Castell'),
  ('Freedom'),
  ('Lion'),
  ('Mondi'),
  ('Oxford'),
  ('Pilot'),
  ('Pritt'),
  ('Sasco'),
  ('Sigma'),
  ('Staedtler'),
  ('Typek')
on conflict (name) do nothing;

-- 2. Product Variants Table
create table if not exists public.product_variants (
  id text primary key default gen_random_uuid()::text,
  master_product_id uuid not null references public.master_products(id) on delete cascade,
  brand_id text not null references public.brands(id) on delete restrict,
  sku text not null,
  cost_price numeric(10,2) not null default 0,
  selling_price numeric(10,2) not null default 0,
  supplier_id uuid references public.suppliers(id) on delete set null,
  visible_on_catalogue boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_product_variants_master_brand unique (master_product_id, brand_id)
);

create index if not exists idx_product_variants_master on public.product_variants(master_product_id);
create index if not exists idx_product_variants_brand on public.product_variants(brand_id);
create index if not exists idx_product_variants_sku on public.product_variants(sku);

-- 3. Row Level Security Policies
alter table public.brands enable row level security;
alter table public.product_variants enable row level security;

-- Brands and variants are internal catalogue records. Public pages use
-- server-side read models and must never receive supplier or cost pricing.
REVOKE ALL ON TABLE public.brands, public.product_variants FROM anon, authenticated;

DROP POLICY IF EXISTS "Brands viewable by authenticated users" ON public.brands;
DROP POLICY IF EXISTS "Brands viewable by anon" ON public.brands;
DROP POLICY IF EXISTS "Brands manageable by admin" ON public.brands;
CREATE POLICY "Catalogue readers view brands"
  ON public.brands FOR SELECT TO authenticated
  USING (public.has_permission('catalogue.view'));
CREATE POLICY "Catalogue managers manage brands"
  ON public.brands FOR ALL TO authenticated
  USING (public.has_permission('catalogue.manage'))
  WITH CHECK (public.has_permission('catalogue.manage'));

DROP POLICY IF EXISTS "Product variants viewable by authenticated users" ON public.product_variants;
DROP POLICY IF EXISTS "Product variants viewable by anon" ON public.product_variants;
DROP POLICY IF EXISTS "Product variants manageable by admin" ON public.product_variants;
CREATE POLICY "Catalogue readers view product variants"
  ON public.product_variants FOR SELECT TO authenticated
  USING (public.has_permission('catalogue.view'));
CREATE POLICY "Catalogue managers manage product variants"
  ON public.product_variants FOR ALL TO authenticated
  USING (public.has_permission('catalogue.manage'))
  WITH CHECK (public.has_permission('catalogue.manage'));