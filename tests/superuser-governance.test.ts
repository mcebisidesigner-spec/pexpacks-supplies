import { describe, it, expect } from "vitest";
import { SUPERUSER_EMAILS, isSuperUserEmail, displayName } from "@/lib/admin/rbac";
import { MAX_SUPERUSERS } from "@/lib/admin/users";
import type { User } from "@supabase/supabase-js";

describe("Superuser Governance & Security Alerting", () => {
  it("defines exactly the designated superusers and MAX_SUPERUSERS = 2", () => {
    expect(MAX_SUPERUSERS).toBe(2);
    expect(SUPERUSER_EMAILS.has("mcebisimhayise@gmail.com")).toBe(true);
    expect(SUPERUSER_EMAILS.has("pexpacks@gmail.com")).toBe(true);
  });

  it("identifies superuser emails case-insensitively", () => {
    expect(isSuperUserEmail("mcebisimhayise@gmail.com")).toBe(true);
    expect(isSuperUserEmail("MCEBISIMHAYISE@GMAIL.COM")).toBe(true);
    expect(isSuperUserEmail("PexPacks@gmail.com")).toBe(true);
    expect(isSuperUserEmail("regular.staff@school.co.za")).toBe(false);
    expect(isSuperUserEmail(null)).toBe(false);
  });

  it("displays Mcebisi Hlatshwayo for mcebisimhayise@gmail.com", () => {
    const user: User = {
      id: "super-1",
      app_metadata: {},
      user_metadata: {},
      email: "mcebisimhayise@gmail.com",
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    expect(displayName(user)).toBe("Mcebisi Hlatshwayo");
  });

  it("displays custom full_name if provided in metadata", () => {
    const user: User = {
      id: "staff-1",
      app_metadata: {},
      user_metadata: { full_name: "Sarah Bell" },
      email: "sarah@pexpacks.co.za",
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    expect(displayName(user)).toBe("Sarah Bell");
  });
});
