-- 00025_partner_school_flags.sql
-- Keep live DB-backed school pages/search consistent with the static school
-- data updates for partner-school status.

update public.schools
set is_partner = true
where slug in (
  'primrose-hill-primary-school',
  'african-union-international'
);
