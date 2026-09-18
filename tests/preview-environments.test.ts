import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDeploymentEnvironment,
  isPreviewDeployment,
  isProductionDeployment,
  assertNonProduction,
  isPaymentSandboxApproved,
  getBranchContext,
} from "@/lib/preview";

describe("Preview Environments & Sandbox Governance", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("identifies test environment correctly", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(getDeploymentEnvironment()).toBe("test");
  });

  it("identifies preview environment correctly when VERCEL_ENV is preview", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(getDeploymentEnvironment()).toBe("preview");
    expect(isPreviewDeployment()).toBe(true);
    expect(isProductionDeployment()).toBe(false);
  });

  it("identifies production environment correctly when VERCEL_ENV is production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(getDeploymentEnvironment()).toBe("production");
    expect(isPreviewDeployment()).toBe(false);
    expect(isProductionDeployment()).toBe(true);
  });

  it("assertNonProduction allows safe execution in preview and test", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(() => assertNonProduction("mock-seeder")).not.toThrow();

    vi.stubEnv("NODE_ENV", "test");
    expect(() => assertNonProduction("test-wipe")).not.toThrow();
  });

  it("assertNonProduction throws a fatal security error in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(() => assertNonProduction("destructive-wipe")).toThrowError(
      /SECURITY VIOLATION.*prohibited in production environment/,
    );
  });

  it("validates payment sandbox approval flags correctly", () => {
    vi.stubEnv("OZOW_IS_TEST", "true");
    vi.stubEnv("OZOW_TEST_MODE_APPROVED", "true");
    expect(isPaymentSandboxApproved()).toBe(true);

    vi.stubEnv("OZOW_IS_TEST", "false");
    expect(isPaymentSandboxApproved()).toBe(false);

    vi.stubEnv("OZOW_IS_TEST", "true");
    vi.stubEnv("OZOW_TEST_MODE_APPROVED", "false");
    expect(isPaymentSandboxApproved()).toBe(false);
  });

  it("extracts branch context from Vercel environment variables", () => {
    vi.stubEnv("VERCEL_GIT_COMMIT_REF", "feature/phase-q-preview");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "a1b2c3d4e5f6");
    vi.stubEnv("VERCEL_ENV", "preview");

    const context = getBranchContext();
    expect(context.branch).toBe("feature/phase-q-preview");
    expect(context.commitSha).toBe("a1b2c3d4e5f6");
    expect(context.isPreview).toBe(true);
  });
});
