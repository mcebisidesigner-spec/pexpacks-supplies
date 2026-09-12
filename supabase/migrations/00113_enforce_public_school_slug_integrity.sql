-- Every public school URL depends on a stable nonblank slug. The reconciliation
-- audit verified all existing rows before this constraint was introduced.
BEGIN;

ALTER TABLE public.schools
  ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_slug_not_blank;
ALTER TABLE public.schools
  ADD CONSTRAINT schools_slug_not_blank
  CHECK (btrim(slug) <> '') NOT VALID;
ALTER TABLE public.schools
  VALIDATE CONSTRAINT schools_slug_not_blank;

COMMIT;