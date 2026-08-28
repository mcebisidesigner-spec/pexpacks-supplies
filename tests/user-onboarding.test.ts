import { describe, it, expect } from "vitest";
import { SYSTEM_SETTING_CATEGORIES } from "@/lib/admin/system-settings-shared";
import { displayName } from "@/lib/admin/rbac";
import type { User } from "@supabase/supabase-js";

describe("User Onboarding & Add Users Settings Tab", () => {
  it("includes add_users category in SYSTEM_SETTING_CATEGORIES", () => {
    const addUsersCat = SYSTEM_SETTING_CATEGORIES.find((c) => c.key === "add_users");
    expect(addUsersCat).toBeDefined();
    expect(addUsersCat?.label).toBe("Add Users");
    expect(addUsersCat?.iconName).toBe("UserPlus");
  });

  it("extracts full name correctly from user metadata for dashboard greeting", () => {
    const mockUser1: User = {
      id: "u-123",
      app_metadata: {},
      user_metadata: { full_name: "Thandi Nkosi" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    expect(displayName(mockUser1)).toBe("Thandi Nkosi");

    const mockUser2: User = {
      id: "u-456",
      app_metadata: {},
      user_metadata: { name: "Mcebisi Hlongwane" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    expect(displayName(mockUser2)).toBe("Mcebisi Hlongwane");

    const mockUser3: User = {
      id: "u-789",
      app_metadata: {},
      user_metadata: {},
      email: "finance@school.co.za",
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    expect(displayName(mockUser3)).toBe("finance@school.co.za");
  });

  it("calculates appropriate time-of-day greeting", () => {
    const getGreeting = (hour: number) => {
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon";
      return "Good evening";
    };

    expect(getGreeting(9)).toBe("Good morning");
    expect(getGreeting(14)).toBe("Good afternoon");
    expect(getGreeting(19)).toBe("Good evening");
  });
});
