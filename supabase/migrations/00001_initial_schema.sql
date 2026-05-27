-- ─────────────────────────────────────────────────────────────
-- Pexpacks Supplies — Supabase Schema Migration
-- Paste this entire file into your Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────

-- ── 1. Extensions ──
create extension if not exists "uuid-ossp";

-- ── 2. Helper: updated_at trigger ──
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────────────────────
-- 3. TABLES
-- ─────────────────────────────────────────────────────────────

-- 3a. form_submissions — unified inbox for every form on the site
create table form_submissions (
  id          uuid primary key default gen_random_uuid(),
  form_type   text not null,
  -- contact | order | lay-by | brand-package | office-quote | add-school | track-order | discount | waitlist
  status      text not null default 'new',
  -- new | read | replied | archived
  data        jsonb not null,
  source_url  text,
  user_agent  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_form_submissions_updated_at
  before update on form_submissions
  for each row execute function set_updated_at();

-- 3b. orders — structured order data
create table orders (
  id                uuid primary key default gen_random_uuid(),
  submission_id     uuid references form_submissions(id) on delete set null,
  order_reference   text unique not null,
  school_slug       text,
  school_name       text not null,
  grade             text not null,
  pack_type         text not null default 'full',
  -- full | custom | multi-school
  items             jsonb,
  removed_items     jsonb,
  estimated_total   numeric(10,2),
  pexcover_requested boolean not null default false,
  pexcover_data     jsonb,
  fulfilment_option text,
  -- School collection | Home delivery | Arrange collection
  delivery_address   jsonb,
  buyer_name         text not null,
  buyer_phone        text not null,
  buyer_email        text,
  learner_name       text,
  consent            boolean not null default false,
  sibling_group_id   uuid,
  status             text not null default 'pending',
  -- pending | confirmed | fulfilled | cancelled
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- 3c. lay_by_applications
create table lay_by_applications (
  id                    uuid primary key default gen_random_uuid(),
  submission_id         uuid references form_submissions(id) on delete set null,
  applicant_name        text not null,
  id_number             text not null,
  phone                 text not null,
  email                 text,
  residential_address   text not null,
  learner_name          text not null,
  school_name           text not null,
  grade                 text not null,
  pack_name             text not null,
  pexcover_requested    boolean not null default false,
  delivery_preference   text,
  estimated_total       numeric(10,2),
  deposit_amount        numeric(10,2),
  payment_term_months   smallint,
  debit_date_preference text,
  notes                 text,
  signature_name        text not null,
  signature_date        date not null,
  status                text not null default 'pending',
  -- pending | approved | active | completed | cancelled
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger trg_lay_by_applications_updated_at
  before update on lay_by_applications
  for each row execute function set_updated_at();

-- 3d. waitlist_entries — school waitlist (was localStorage)
create table waitlist_entries (
  id          uuid primary key default gen_random_uuid(),
  school_name text not null,
  email       text not null,
  status      text not null default 'pending',
  -- pending | notified | converted
  created_at  timestamptz not null default now()
);

-- 3e. brand_package_claims
create table brand_package_claims (
  id                   uuid primary key default gen_random_uuid(),
  submission_id        uuid references form_submissions(id) on delete set null,
  business_name        text not null,
  applicant_name       text not null,
  phone                text not null,
  email                text not null,
  website              text,
  business_description text not null,
  branding_preferences text not null,
  existing_branding    text,
  target_audience      text,
  deadline             text,
  notes                text,
  consent              boolean not null default false,
  status               text not null default 'new',
  -- new | reviewing | approved | rejected
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger trg_brand_package_claims_updated_at
  before update on brand_package_claims
  for each row execute function set_updated_at();

-- 3f. brand_package_assets — uploaded files
create table brand_package_assets (
  id           uuid primary key default gen_random_uuid(),
  claim_id     uuid not null references brand_package_claims(id) on delete cascade,
  file_path    text not null,
  file_name    text not null,
  file_size    integer,
  content_type text,
  uploaded_at  timestamptz not null default now()
);

-- 3g. schools — migrated from school-records.json
create table schools (
  id           text primary key,
  name         text not null,
  slug         text unique not null,
  city         text,
  province     text,
  logo         text,
  is_partner   boolean not null default false,
  is_featured  boolean not null default false,
  lowest_price numeric(10,2),
  grades       jsonb,
  search_vector tsvector
    generated always as (
      to_tsvector('english',
        coalesce(name, '') || ' ' ||
        coalesce(city, '') || ' ' ||
        coalesce(province, '')
      )
    ) stored,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_schools_updated_at
  before update on schools
  for each row execute function set_updated_at();

-- 3h. blog_posts
create table blog_posts (
  id         text primary key,
  slug       text unique not null,
  title      text not null,
  excerpt    text,
  content    jsonb,
  author     text,
  category   text,
  image      text,
  published  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 4. INDEXES
-- ─────────────────────────────────────────────────────────────

create index idx_form_submissions_type_status on form_submissions(form_type, status);
create index idx_form_submissions_created   on form_submissions(created_at desc);
create index idx_orders_reference            on orders(order_reference);
create index idx_orders_school               on orders(school_slug);
create index idx_orders_created              on orders(created_at desc);
create index idx_lay_by_status               on lay_by_applications(status);
create index idx_waitlist_school             on waitlist_entries(school_name);
create index idx_waitlist_status             on waitlist_entries(status);
create index idx_claims_status               on brand_package_claims(status);
create index idx_assets_claim                on brand_package_assets(claim_id);
create index idx_schools_search              on schools using gin(search_vector);
create index idx_schools_partner             on schools(is_partner) where is_partner = true;
create index idx_blog_posts_slug             on blog_posts(slug);
create index idx_blog_posts_published        on blog_posts(published) where published = true;


-- ─────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- Enable RLS on all tables
alter table form_submissions       enable row level security;
alter table orders                 enable row level security;
alter table lay_by_applications    enable row level security;
alter table waitlist_entries       enable row level security;
alter table brand_package_claims   enable row level security;
alter table brand_package_assets   enable row level security;
alter table schools                enable row level security;
alter table blog_posts             enable row level security;

-- Anon role: can INSERT into submission-related tables (contact forms)
-- but cannot read or update (prevent data scraping).

create policy "anon can insert form_submissions"
  on form_submissions for insert to anon
  with check (true);

create policy "anon can insert waitlist_entries"
  on waitlist_entries for insert to anon
  with check (true);

-- Anon can read published blog posts and schools (public data)
create policy "anon can read published blog_posts"
  on blog_posts for select to anon
  using (published = true);

create policy "anon can read schools"
  on schools for select to anon
  using (true);

-- Authenticated role (admin dashboard): full access to everything
create policy "admin all form_submissions"
  on form_submissions for all to authenticated
  using (true) with check (true);

create policy "admin all orders"
  on orders for all to authenticated
  using (true) with check (true);

create policy "admin all lay_by_applications"
  on lay_by_applications for all to authenticated
  using (true) with check (true);

create policy "admin all waitlist_entries"
  on waitlist_entries for all to authenticated
  using (true) with check (true);

create policy "admin all brand_package_claims"
  on brand_package_claims for all to authenticated
  using (true) with check (true);

create policy "admin all brand_package_assets"
  on brand_package_assets for all to authenticated
  using (true) with check (true);

create policy "admin all schools"
  on schools for all to authenticated
  using (true) with check (true);

create policy "admin all blog_posts"
  on blog_posts for all to authenticated
  using (true) with check (true);


-- ─────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('brand-assets', 'brand-assets', false, 41943040, -- 40 MB
    '{image/png,image/jpeg,image/webp,image/svg+xml,application/pdf,application/zip}'),
  ('blog-images', 'blog-images', true, 10485760,    -- 10 MB
    '{image/png,image/jpeg,image/webp}'),
  ('school-logos', 'school-logos', true, 2097152    -- 2 MB
    '{image/png,image/jpeg,image/webp}')
on conflict (id) do nothing;

-- Storage RLS: anon can read public buckets, upload to brand-assets
create policy "anon can read blog-images"
  on storage.objects for select to anon
  using (bucket_id = 'blog-images');

create policy "anon can read school-logos"
  on storage.objects for select to anon
  using (bucket_id = 'school-logos');

create policy "anon can upload brand-assets"
  on storage.objects for insert to anon
  with check (bucket_id = 'brand-assets');

-- Authenticated users have full storage access
create policy "admin all storage"
  on storage.objects for all to authenticated
  using (true) with check (true);
