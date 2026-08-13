-- ===================================================
-- Pexpacks Supplies — Phase 7: Scale & Sync Hardening
-- Migration 00010: indexes on hot query paths
-- ===================================================
-- Keeps Supabase fast under heavy traffic by indexing the columns the
-- public pages, admin lists and report RPCs filter/order on.

-- CMS read paths (public pages: testimonial + FAQ marquees)
create index if not exists idx_testimonials_visible_sort
  on public.testimonials (visible, sort_order);

create index if not exists idx_faqs_visible_sort
  on public.faqs (visible, sort_order);

create index if not exists idx_website_content_updated
  on public.website_content (updated_at desc);

-- Media library (assets admin lists / folder browsing)
create index if not exists idx_assets_folder
  on public.assets (bucket, folder);

create index if not exists idx_assets_created
  on public.assets (created_at desc);

-- Orders analytics: every report RPC filters by a created_at date range
-- and then groups/filters on status, pack_type or school_name.
create index if not exists idx_orders_created_status
  on public.orders (created_at, status);

create index if not exists idx_orders_created_pack_type
  on public.orders (created_at, pack_type);

create index if not exists idx_orders_created_school
  on public.orders (created_at, school_name);

-- School directory: public search index rebuilds + admin name lookups,
-- plus grade containment queries against the grades jsonb column.
create index if not exists idx_schools_name
  on public.schools (lower(name));

create index if not exists idx_schools_grades
  on public.schools using gin (grades);

-- Admin lists
create index if not exists idx_audit_logs_action_created
  on public.audit_logs (action, created_at desc);

create index if not exists idx_form_submissions_created
  on public.form_submissions (created_at desc);

-- Add custom_badge column to schools table for custom search tray pill text
alter table public.schools add column if not exists custom_badge text default '2026 Packs';

