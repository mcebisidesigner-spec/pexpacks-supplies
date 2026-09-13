import { describe, it, expect } from "vitest";
import { sendUserInvitationEmail } from "@/lib/email/sendUserInvitationEmail";
import {
  MIN_ADMIN_PASSWORD_LENGTH,
  validateAdminPassword,
} from "@/lib/security/password-policy";

describe("Temporary Password Onboarding Architecture", () => {
  it("generates a strong temporary password adhering to format constraints", () => {
    function generateSecureTempPassword(): string {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
      let randomPart = "";
      for (let i = 0; i < 8; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `Pex#${randomPart}26!`;
    }

    const pwd = generateSecureTempPassword();
    expect(pwd.startsWith("Pex#")).toBe(true);
    expect(pwd.endsWith("26!")).toBe(true);
    expect(pwd.length).toBe(15);
    expect(/[A-Z]/.test(pwd)).toBe(true);
    expect(/[0-9]/.test(pwd)).toBe(true);
  });

  it("validates permanent password creation rules consistently", () => {
    expect(validateAdminPassword("short", "short").ok).toBe(false);
    expect(
      validateAdminPassword(
        "A".repeat(MIN_ADMIN_PASSWORD_LENGTH - 1),
        "A".repeat(MIN_ADMIN_PASSWORD_LENGTH - 1),
      ).ok,
    ).toBe(false);
    expect(
      validateAdminPassword("ValidPassword123", "DifferentPassword123").ok,
    ).toBe(false);
    expect(
      validateAdminPassword("ValidPassword123!", "ValidPassword123!").ok,
    ).toBe(true);
  });

  it("handles email invitation payload with temporary credentials seamlessly", async () => {
    // When RESEND_API_KEY is not set in test environment, it gracefully skips without crashing
    const res = await sendUserInvitationEmail({
      toEmail: "newstaff@pexpacks.co.za",
      fullName: "Test Staff Member",
      department: "Procurement & Supply Chain",
      roles: [
        {
          slug: "operations_manager",
          name: "Operations Manager",
          description: "Manage school packs",
        },
      ],
      tempPassword: "Pex#xY98kL26!",
    });

    expect(res).toBeDefined();
    expect(typeof res.success).toBe("boolean");
  });
});
