export const STORAGE_KEY = "Pexpacks:recent-school-visits";
export const RECENT_SCHOOL_VISITS_EVENT = "Pexpacks:recent-school-visits-updated";

export type LastVisit = {
  schoolName: string;
  schoolSlug: string;
  grade: string;
  gradeSlug: string;
  timestamp: number;
};

/**
 * Save the user's current school/grade visit for the "Continue where you left off" feature.
 * Stores up to 3 recent unique schools.
 */
export function saveSchoolVisit(data: Omit<LastVisit, "timestamp">) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let history: LastVisit[] = [];
    if (raw) {
      // Handle legacy single-object format or new array format
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        history = parsed;
      } else if (parsed && typeof parsed === "object") {
        history = [parsed];
      }
    }

    const entry: LastVisit = { ...data, timestamp: Date.now() };
    
    // Remove previous entries for the same school to avoid duplicates
    history = history.filter(v => v.schoolSlug !== entry.schoolSlug);
    
    // Add to front and keep only top 3
    history.unshift(entry);
    if (history.length > 3) {
      history = history.slice(0, 3);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event(RECENT_SCHOOL_VISITS_EVENT));
  } catch {
    // localStorage may be unavailable
  }
}


