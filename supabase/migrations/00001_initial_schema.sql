-- ===================================================
-- Pexpacks Supplies — Supabase Schema Migration
-- ===================================================

-- 1. ENUMS & EXTENSIONS
create extension if not exists "pgcrypto";

-- 2. ORDERS TABLE (Core E-Commerce & Lay-By Tracker)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  order_reference text unique not null,               -- e.g. PEX-1721700000
  
  -- Customer & Delivery Details
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  preferred_contact_method text default 'WhatsApp',  -- 'WhatsApp' | 'Phone' | 'Email'
  
  -- School & Learner Information (For Bag Tagging & Handover)
  school_name text not null,
  learner_name text not null,
  grade text not null,
  delivery_type text default 'School collection',
  
  -- Items & Financials
  items jsonb not null,                              -- Customized list of stationery items
  pexcover_addon boolean default false,              -- Pexcover book-covering service
  estimated_total numeric(10,2) not null,
  
  -- Status Pipeline
  -- Status options: 'pending_payment', 'paid', 'layby_active', 'packing', 'delivered', 'cancelled'
  status text default 'pending_payment'::text not null
);

-- 3. FORM SUBMISSIONS TABLE (General Inquiries & School Onboarding)
create table if not exists public.form_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  form_type text not null,                            -- 'school_partner_request' | 'general_contact'
  payload jsonb not null,
  status text default 'new'::text not null
);

-- 4. ROW LEVEL SECURITY (RLS)
alter table public.orders enable row level security;
alter table public.form_submissions enable row level security;

-- Public (Anonymous) users can create orders & submissions
drop policy if exists "Enable anonymous insert for orders" on public.orders;
create policy "Enable anonymous insert for orders" 
  on public.orders for insert to anon with check (true);

drop policy if exists "Enable anonymous insert for submissions" on public.form_submissions;
create policy "Enable anonymous insert for submissions" 
  on public.form_submissions for insert to anon with check (true);

-- Authenticated Admins have FULL ACCESS to manage everything
drop policy if exists "Admin full access to orders" on public.orders;
create policy "Admin full access to orders" 
  on public.orders for all to authenticated using (true) with check (true);

drop policy if exists "Admin full access to submissions" on public.form_submissions;
create policy "Admin full access to submissions" 
  on public.form_submissions for all to authenticated using (true) with check (true);

-- 5. STORAGE BUCKETS SETUP
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('brand-assets', 'brand-assets', false, 41943040, -- 40 MB
    '{image/png,image/jpeg,image/webp,image/svg+xml,application/pdf,application/zip}'),
  ('blog-images', 'blog-images', true, 10485760,    -- 10 MB
    '{image/png,image/jpeg,image/webp}'),
  ('school-logos', 'school-logos', true, 2097152,   -- 2 MB
    '{image/png,image/jpeg,image/webp}')
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Public read blog-images" on storage.objects;
drop policy if exists "Public read school-logos" on storage.objects;
drop policy if exists "Admin all storage access" on storage.objects;

create policy "Public read blog-images"
  on storage.objects for select to anon using (bucket_id = 'blog-images');

create policy "Public read school-logos"
  on storage.objects for select to anon using (bucket_id = 'school-logos');

create policy "Admin all storage access"
  on storage.objects for all to authenticated using (true) with check (true);
