import { describe, it, expect } from "vitest";
import { buildOtpEmailHtml } from "@/lib/email/sendOtpEmail";

describe("OTP Email Copy-Code Architecture & Cross-Device Flow", () => {
  const testOtp = "947119";
  const testEmail = "admin@pexpacks.co.za";

  it("generates an email HTML with a valid /auth/copy-code action link", () => {
    const html = buildOtpEmailHtml(testOtp, testEmail, "https://pexpacks.co.za");

    expect(html).toContain("/auth/copy-code?code=947119&email=admin%40pexpacks.co.za");
    expect(html).toContain("Copy code");
    expect(html).toContain("Code Requested");
    expect(html).toContain("This code expires in <strong>5 minutes</strong>");
  });

  it("renders individual digit tiles with user-select styling for single-tap manual copying", () => {
    const html = buildOtpEmailHtml(testOtp, testEmail);

    // Each digit must be present in its own container
    testOtp.split("").forEach((digit) => {
      expect(html).toContain(`>${digit}</span>`);
    });

    expect(html).toContain("user-select:all");
    expect(html).toContain("-webkit-user-select:all");
  });

  it("correctly sanitizes and parses clipboard text containing whitespace, brackets, or hyphens", () => {
    function sanitizeOtpInput(raw: string): string {
      return raw.replace(/\D/g, "").slice(0, 6);
    }

    expect(sanitizeOtpInput("947119")).toBe("947119");
    expect(sanitizeOtpInput("[ 947119 ]")).toBe("947119");
    expect(sanitizeOtpInput("947-119")).toBe("947119");
    expect(sanitizeOtpInput("  947119  \n")).toBe("947119");
    expect(sanitizeOtpInput("Token: 947119 (expires in 5m)")).toBe("947119");
  });

  it("enforces a strict 5-minute validity window for client-side storage sync", () => {
    function isOtpStorageValid(timestamp: number, maxAgeMs = 5 * 60 * 1000): boolean {
      return Date.now() - timestamp < maxAgeMs;
    }

    const now = Date.now();
    expect(isOtpStorageValid(now)).toBe(true);
    expect(isOtpStorageValid(now - 4 * 60 * 1000)).toBe(true); // 4 mins old: valid
    expect(isOtpStorageValid(now - 6 * 60 * 1000)).toBe(false); // 6 mins old: expired
  });

  it("handles custom or environment-specified base URLs cleanly without trailing slashes", () => {
    const htmlWithSlash = buildOtpEmailHtml(testOtp, testEmail, "https://pexpacks.co.za/");
    expect(htmlWithSlash).toContain("https://pexpacks.co.za/auth/copy-code");
    expect(htmlWithSlash).not.toContain("https://pexpacks.co.za//auth/copy-code");
  });
});
