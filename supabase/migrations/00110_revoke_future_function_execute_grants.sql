-- The remote project had explicit future-function grants for anon and
-- authenticated in addition to PostgreSQL's PUBLIC default. Remove all of
-- them; functions must opt in with an explicit, reviewed grant.
BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT EXECUTE ON FUNCTIONS TO service_role;

COMMIT;