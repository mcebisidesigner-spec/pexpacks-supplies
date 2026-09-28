-- Migration: 00133_create_school_websites.sql
-- Description: Create dedicated school_websites table for multi-tenant portal / website builder

create table if not exists public.school_websites (
  id text primary key, -- e.g. 'bryanston-primary' or slug
  school_id uuid references public.schools(id) on delete set null,
  name text not null,
  subdomain text unique not null, -- e.g. 'bryanston' -> bryanston.pexschools.co.za
  custom_domain text unique,      -- e.g. 'bryanstonprimary.co.za' (optional)
  logo_url text,
  primary_color text default '#1E3A8A',
  
  -- Font Customization
  heading_font text default 'Oswald',
  body_font text default 'Open Sans',
  
  -- Content Fields
  welcome_title text default 'Welcome to Our School',
  welcome_message text,
  principal_name text,
  principal_image_url text,
  contact_email text,
  contact_phone text,
  address text,
  
  -- Stationery Integration
  stationery_cta_url text, -- Link to pexpacks.co.za pack page
  
  -- Admin Access
  admin_user_id uuid references auth.users(id),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Fast lookup indexes for domain routing
create index if not exists idx_school_websites_subdomain on public.school_websites (subdomain);
create index if not exists idx_school_websites_custom_domain on public.school_websites (custom_domain);
create index if not exists idx_school_websites_school_id on public.school_websites (school_id);

-- Enable Row Level Security (RLS)
alter table public.school_websites enable row level security;

-- Allow public read access (parents and visitors browsing school websites)
create policy "Allow public read-only access"
  on public.school_websites for select
  using (true);

-- Allow school administrators to edit only their own school website
create policy "Allow school admins to update own record"
  on public.school_websites for update
  using (auth.uid() = admin_user_id)
  with check (auth.uid() = admin_user_id);

-- Allow staff full access (admin control)
do $$
begin
  if exists (
    select 1 from pg_proc where proname = 'is_staff' and pronamespace = 'public'::regnamespace
  ) then
    execute '
      create policy "Staff write school_websites"
        on public.school_websites
        for all
        to authenticated
        using (public.is_staff())
        with check (public.is_staff())
    ';
  end if;
end $$;

-- Grant select privileges to anon and authenticated roles
grant select on public.school_websites to anon, authenticated;

-- Insert a demo seed school website
insert into public.school_websites (
  id, name, subdomain, custom_domain, primary_color, heading_font, body_font,
  welcome_title, welcome_message, stationery_cta_url
) values (
  'demo-school',
  'Bryanston Exemplar School',
  'demo',
  'demo.pexschools.co.za',
  '#1E3A8A',
  'Oswald',
  'Open Sans',
  'Inspiring Excellence in Every Learner',
  'Welcome to our digital portal. Access term timetables, school notices, and official stationery kits.',
  'https://pexpacks.co.za'
) on conflict (id) do nothing;
