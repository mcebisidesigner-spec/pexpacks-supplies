-- Current Pexpacks suppliers. Contact and commercial details remain editable
-- from the admin supplier workspace.
insert into public.suppliers (code, name, active)
values
  ('MAKRO', 'Makro', true),
  ('BSC', 'BSC Supplies', true)
on conflict (code) do update
set
  name = excluded.name,
  active = true,
  updated_at = now();
