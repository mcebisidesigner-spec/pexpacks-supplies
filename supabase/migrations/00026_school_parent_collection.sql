-- Store the school's collection policy independently from individual pack
-- delivery modes so operations can manage it from the school profile.

alter table public.schools
  add column if not exists parent_collection_accepted boolean not null default false;

update public.schools as school
set parent_collection_accepted = true
where exists (
  select 1
  from public.stationery_packs as pack
  where pack.school_id = school.id
    and pack.visible = true
    and lower(pack.delivery_type) like '%collection%'
);

comment on column public.schools.parent_collection_accepted is
  'Whether parents may collect stationery for this school.';
