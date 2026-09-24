export const STORAGE_KEY = "Pexpacks:recent-school-visits";
export const RECENT_SCHOOL_VISITS_EVENT = "Pexpacks:recent-school-visits-updated";
export const RECENT_VISIT_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

export type LastVisit = {
  schoolName: string;
  schoolSlug: string;
  grade?: string;
  gradeSlug?: string;
  city?: string;
  image?: string | null;
  timestamp: number;
};

/**
 * Retrieve recent school visits from localStorage filtered by maximum age (30 days).
 */
export function getRecentSchoolVisits(): LastVisit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const visits: LastVisit[] = Array.isArray(parsed) ? parsed : [parsed];
    const now = Date.now();
    return visits.filter(
      (v) =>
        Boolean(v) &&
        typeof v.schoolSlug === "string" &&
        typeof v.schoolName === "string" &&
        now - (v.timestamp || 0) < RECENT_VISIT_MAX_AGE,
    );
  } catch {
    return [];
  }
}

/**
 * Save the user's current school/grade visit for behavioral personalization.
 * Stores up to 6 recent unique schools.
 */
export function saveSchoolVisit(data: Omit<LastVisit, "timestamp">) {
  if (typeof window === "undefined") return;
  try {
    const history = getRecentSchoolVisits();
    const existing = history.find((v) => v.schoolSlug === data.schoolSlug);

    const entry: LastVisit = {
      ...existing,
      ...data,
      image: data.image ?? existing?.image ?? null,
      city: data.city ?? existing?.city,
      timestamp: Date.now(),
    };

    // Remove previous entries for the same school to avoid duplicates
    const filtered = history.filter((v) => v.schoolSlug !== entry.schoolSlug);

    // Add to front and keep top 6
    filtered.unshift(entry);
    const trimmed = filtered.slice(0, 6);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new Event(RECENT_SCHOOL_VISITS_EVENT));
  } catch {
    // localStorage may be unavailable
  }
}


