import { getCachedSchoolBySlug } from "@/lib/school-utils";
import { getActivePublicSeason } from "./seasons";
import { getPublicSiteSettings } from "./settings";
import {
  mapSchoolToPublicPage,
  mapPackToPublicDetail,
} from "./mappers";
import type {
  PublicPackDetail,
  PublicSchoolPage,
} from "./contracts";

/**
 * Retrieves the complete public school landing page model
 * scoped to the active commercial season.
 */
export async function getPublicSchoolPage(
  slug: string
): Promise<PublicSchoolPage | null> {
  const [school, season] = await Promise.all([
    getCachedSchoolBySlug(slug),
    getActivePublicSeason(),
  ]);

  if (!school) return null;

  return mapSchoolToPublicPage(school, season);
}

/**
 * Retrieves the complete pack detail model for a specific grade pack
 */
export async function getPublicPackDetail(
  schoolSlug: string,
  gradeSlug: string
): Promise<PublicPackDetail | null> {
  const [school, season, settings] = await Promise.all([
    getCachedSchoolBySlug(schoolSlug),
    getActivePublicSeason(),
    getPublicSiteSettings(),
  ]);

  if (!school) return null;

  const pack = school.grades.find((g) => g.gradeSlug === gradeSlug);
  if (!pack) return null;

  return mapPackToPublicDetail(
    pack,
    school,
    String(season.academicYear),
    settings.pexcoverPrice
  );
}
