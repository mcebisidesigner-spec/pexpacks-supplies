-- ===================================================
-- Pexpacks Supplies — Admin Role Management & RLS
-- ===================================================
-- Run this in the Supabase SQL Editor.
-- Then assign an admin with:  SELECT set_user_as_admin('<USER-UUID>');
-- and sign out / sign back in so the session token picks up
-- app_metadata.role = 'admin'.

-- 1. Helper function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
as $$
begin
  return (
    coalesce(
      (auth.jwt() -> 'app_metadata' ->> 'role'),
      ''
    ) = 'admin'
  );
end;
$$;

-- 2. Helper function to assign an admin role to a user by ID
-- (service-role / SQL editor only — users cannot set their own role)
create or replace function public.set_user_as_admin(target_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', 'admin')
  where id = target_user_id;
end;
$$;

-- ===================================================
-- SECURING ORDERS (admin-only read/manage; public can still place orders)
-- ===================================================

-- RLS is already enabled on orders; ensure it stays on.
alter table public.orders enable row level security;

-- Public (Anonymous) users can still create orders.
drop policy if exists "Enable anonymous insert for orders" on public.orders;
create policy "Enable anonymous insert for orders"
  on public.orders
  for insert to anon
  with check (true);

-- Replace the old "any authenticated user" policy with an admin-only policy.
drop policy if exists "Admin full access to orders" on public.orders;
drop policy if exists "Admins have full access to orders" on public.orders;
create policy "Admins have full access to orders"
  on public.orders
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ===================================================
-- SECURING FORM SUBMISSIONS
-- ===================================================
-- NOTE: The public checkout-draft route and contact/quote forms insert
-- as anonymous users, so the anonymous INSERT policy must remain.
-- Authenticated (non-admin) access is now gated to admins only.

alter table public.form_submissions enable row level security;

drop policy if exists "Enable anonymous insert for submissions" on public.form_submissions;
create policy "Enable anonymous insert for submissions"
  on public.form_submissions
  for insert to anon
  with check (true);

drop policy if exists "Admin full access to submissions" on public.form_submissions;
drop policy if exists "Admins have full access to submissions" on public.form_submissions;
create policy "Admins have full access to submissions"
  on public.form_submissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
