/** Milliseconds of continuous inactivity before the admin session is force-signed-out. */
export const ADMIN_IDLE_MS = 45 * 60 * 1000;

/** Cookie used by middleware to track the last admin activity server-side. */
export const ADMIN_LAST_ACTIVITY_COOKIE = "px_admin_last_activity";

/** Tab-scoped marker used to reject an admin session restored after a restart. */
export const ADMIN_RUNTIME_SESSION_KEY = "px_admin_runtime_session";

/** Cross-tab activity state for open dashboard tabs in the same browser profile. */
export const ADMIN_ACTIVITY_STORAGE_KEY = "px_admin_activity";
export const ADMIN_ACTIVITY_CHANNEL = "px_admin_activity_channel";
