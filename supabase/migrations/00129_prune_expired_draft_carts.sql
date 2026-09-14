-- Draft carts are deliberately non-sensitive and expire after 24 hours.
-- Purge them on the scheduled reconciliation job to enforce data minimisation.
BEGIN;

CREATE OR REPLACE FUNCTION public.prune_expired_draft_carts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.draft_carts
  WHERE expires_at <= now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.prune_expired_draft_carts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prune_expired_draft_carts() TO service_role;

COMMIT;