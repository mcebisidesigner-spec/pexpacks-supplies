/** Milliseconds of continuous inactivity before the admin session is force-signed-out. */
export const ADMIN_IDLE_MS = 15 * 60 * 1000;

/** Cookie used by middleware to track the last admin activity server-side. */
export const ADMIN_LAST_ACTIVITY_COOKIE = "px_admin_last_activity";
