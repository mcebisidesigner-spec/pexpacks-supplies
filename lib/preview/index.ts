/**
 * Pexpacks Production Excellence — Preview Environments & Sandbox Governance
 *
 * Guarantees:
 * 1. Safe non-production seeding and sandbox test execution.
 * 2. Strict isolation preventing destructive or mock operations from executing against production.
 * 3. Ephemeral preview branch awareness (Vercel Git Commit & Supabase DB Branching).
 */

export type AppEnvironment = "production" | "preview" | "development" | "test";

/**
 * Returns the current application deployment environment.
 */
export function getDeploymentEnvironment(): AppEnvironment {
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  if (process.env.NODE_ENV === "test") return "test";
  if (process.env.VERCEL_ENV === "development" || process.env.NODE_ENV === "development") {
    return "development";
  }
  return "development";
}

/**
 * Indicates if the current runtime is an ephemeral preview deployment (PR or feature branch).
 */
export function isPreviewDeployment(): boolean {
  return process.env.VERCEL_ENV === "preview";
}

/**
 * Indicates if the current runtime is production.
 */
export function isProductionDeployment(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/**
 * Retrieves Git and deployment branch metadata for preview tracking.
 */
export function getBranchContext(): {
  branch: string;
  commitSha: string;
  isPreview: boolean;
} {
  return {
    branch: process.env.VERCEL_GIT_COMMIT_REF || "local",
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || "local-head",
    isPreview: isPreviewDeployment(),
  };
}

/**
 * Security Guard: strictly blocks test scripts, seeders, or destructive wipes
 * from executing in production. Throws a fatal Error if called in production.
 */
export function assertNonProduction(operationName: string): void {
  const env = getDeploymentEnvironment();
  if (env === "production") {
    throw new Error(
      `[SECURITY VIOLATION] Operation "${operationName}" is prohibited in production environment!`,
    );
  }
}

/**
 * Validates that sandbox payment mode is explicitly approved for preview or dev testing.
 */
export function isPaymentSandboxApproved(): boolean {
  return (
    process.env.OZOW_IS_TEST === "true" &&
    process.env.OZOW_TEST_MODE_APPROVED === "true"
  );
}
