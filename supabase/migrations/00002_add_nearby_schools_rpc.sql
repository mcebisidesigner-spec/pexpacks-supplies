-- ===================================================
-- Pexpacks Supplies — PostGIS Nearby Schools RPC
-- ===================================================
-- FUTURE MIGRATION: Run this when schools table data
-- is migrated from static JSON to Supabase with
-- lat/lng coordinates populated.
-- ===================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. ADD SPATIAL COLUMNS TO SCHOOLS TABLE
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision,
  ADD COLUMN IF NOT EXISTS location geometry(Point, 4326);

-- 3. POPULATE GEOMETRY FROM LAT/LNG (run after data migration)
UPDATE public.schools
SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
WHERE lat IS NOT NULL AND lng IS NOT NULL AND location IS NULL;

-- 4. SPATIAL INDEX
CREATE INDEX IF NOT EXISTS idx_schools_location
  ON public.schools USING GIST (location);

-- 5. RPC: GET SCHOOLS NEAR USER (PostGIS distance query)
CREATE OR REPLACE FUNCTION public.get_schools_near_user(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 50000,
  limit_count integer DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  city text,
  province text,
  logo text,
  is_partner boolean,
  is_featured boolean,
  lowest_price numeric,
  distance_km double precision
)
LANGUAGE sql STABLE
AS $$
  SELECT
    s.id,
    s.name,
    s.slug,
    s.city,
    s.province,
    s.logo,
    s.is_partner,
    s.is_featured,
    s.lowest_price,
    ROUND(
      (ST_Distance(
        s.location::geography,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      ) / 1000.0)::numeric,
      1
    )::double precision AS distance_km
  FROM public.schools s
  WHERE s.location IS NOT NULL
    AND ST_DWithin(
      s.location::geography,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_km
  LIMIT limit_count;
$$;

-- 6. RPC: GET SCHOOLS BY DISTRICT/CITY (IP-based fallback)
CREATE OR REPLACE FUNCTION public.get_schools_by_district(
  target_district text,
  limit_count integer DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  city text,
  province text,
  logo text,
  is_partner boolean,
  is_featured boolean,
  lowest_price numeric
)
LANGUAGE sql STABLE
AS $$
  SELECT
    s.id,
    s.name,
    s.slug,
    s.city,
    s.province,
    s.logo,
    s.is_partner,
    s.is_featured,
    s.lowest_price
  FROM public.schools s
  WHERE LOWER(s.city) ILIKE '%' || LOWER(target_district) || '%'
     OR LOWER(target_district) ILIKE '%' || LOWER(s.city) || '%'
  ORDER BY s.is_partner DESC, s.is_featured DESC, s.name
  LIMIT limit_count;
$$;
