-- The original float overload predates the hardened numeric matcher in 00126.
-- Remove it so PostgREST cannot select the public legacy function.
BEGIN;

DROP FUNCTION IF EXISTS public.match_stationery_product(text, double precision, integer);

COMMIT;