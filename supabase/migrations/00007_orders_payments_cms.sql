-- 00007_orders_payments_cms.sql
-- Phase 4: reconcile live orders schema with what the checkout/forms code
-- writes (several columns the app inserts do not exist yet, so orders were
-- silently failing to persist), add admin-friendly indexes, an updated_at
-- trigger, and the missing brand_package_claims table.

-- 1. Columns the application writes that the live table lacked.
alter table public.orders
  add column if not exists school_slug text,
  add column if not exists fulfilment_option text,
  add column if not exists metadata jsonb,
  add column if not exists pexcover_requested boolean not null default false,
  add column if not exists consent boolean not null default false,
  add column if not exists submission_id uuid,
  add column if not exists removed_items jsonb,
  add column if not exists gateway_reference text,
  add column if not exists paid_at timestamptz,
  add column if not exists payment_gateway text,
  add column if not exists payment_reference text,
  add column if not exists delivery_address jsonb,
  add column if not exists pack_type text,
  add column if not exists pexcover_data jsonb,
  add column if not exists sibling_group_id text;

-- 2. Relax NOT NULL constraints the code legitimately writes as NULL.
alter table public.orders alter column learner_name drop not null;
alter table public.orders alter column items drop not null;

-- 3. delivery_address is written as a JSON object by saveOrderRecord; live
-- column is text. Convert (orders table is empty in production).
alter table public.orders
  alter column delivery_address type jsonb using
    case
      when delivery_address is null then null
      when pg_typeof(delivery_address)::text = 'jsonb' then delivery_address::jsonb
      else to_jsonb(delivery_address)
    end;

-- 4. Admin-friendly indexes.
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_buyer_email on public.orders(buyer_email);
create index if not exists idx_orders_paid_at on public.orders(paid_at)
  where paid_at is not null;
create index if not exists idx_orders_pack_type on public.orders(pack_type)
  where pack_type is not null;

-- 5. updated_at trigger (reuses the shared set_updated_at function).
drop trigger if exists orders_updated_at_trg on public.orders;
create trigger orders_updated_at_trg
  before update on public.orders
  for each row execute function public.set_updated_at();

-- 6. brand_package_claims: referenced by saveBrandPackageRecord but never
-- created, so brand-package enquiries were silently lost.
create table if not exists public.brand_package_claims (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid,
  business_name text not null,
  applicant_name text not null,
  phone text,
  email text,
  website text,
  business_description text,
  branding_preferences text,
  existing_branding text,
  target_audience text,
  deadline date,
  notes text,
  consent boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_brand_package_claims_status
  on public.brand_package_claims(status);
create index if not exists idx_brand_package_claims_created_at
  on public.brand_package_claims(created_at desc);

drop trigger if exists brand_package_claims_updated_at_trg
  on public.brand_package_claims;
create trigger brand_package_claims_updated_at_trg
  before update on public.brand_package_claims
  for each row execute function public.set_updated_at();

alter table public.brand_package_claims enable row level security;

create policy "Brand package claims: anonymous insert"
  on public.brand_package_claims for insert to anon with check (true);

create policy "Brand package claims: staff full access"
  on public.brand_package_claims for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
