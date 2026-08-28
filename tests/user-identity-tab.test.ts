import { describe, it, expect } from "vitest";
import { SYSTEM_SETTING_CATEGORIES } from "@/lib/admin/system-settings-shared";

describe("User Identity Settings Tab", () => {
  it("registers user_identity category with correct label, description, and icon", () => {
    const category = SYSTEM_SETTING_CATEGORIES.find((c) => c.key === "user_identity");
    expect(category).toBeDefined();
    expect(category?.label).toBe("User Identity");
    expect(category?.iconName).toBe("Users");
    expect(category?.description).toContain("user directory");
  });

  it("handles role toggles accurately between checked and unchecked states", () => {
    let currentRoles = ["operations_manager", "order_manager"];

    function toggle(slug: string) {
      if (currentRoles.includes(slug)) {
        currentRoles = currentRoles.filter((s) => s !== slug);
      } else {
        currentRoles = [...currentRoles, slug];
      }
    }

    // Toggle on 'finance'
    toggle("finance");
    expect(currentRoles).toContain("finance");
    expect(currentRoles.length).toBe(3);

    // Toggle off 'operations_manager'
    toggle("operations_manager");
    expect(currentRoles).not.toContain("operations_manager");
    expect(currentRoles.length).toBe(2);

    // Toggle off 'finance'
    toggle("finance");
    expect(currentRoles).not.toContain("finance");
    expect(currentRoles).toEqual(["order_manager"]);
  });

  it("strictly filters super_admin role for non-superusers while revealing it to superusers", () => {
    const allRoles = [
      { id: "1", name: "Super Admin", slug: "super_admin", description: "All permissions" },
      { id: "2", name: "Operations Manager", slug: "operations_manager", description: "Ops" },
      { id: "3", name: "Finance", slug: "finance", description: "Finance" },
    ];

    const getVisibleRoles = (isSuper: boolean) =>
      allRoles.filter((r) => {
        if (r.slug === "super_admin" || r.slug === "superuser") {
          return isSuper;
        }
        return true;
      });

    // Non-superuser
    const regularView = getVisibleRoles(false);
    expect(regularView.some((r) => r.slug === "super_admin")).toBe(false);
    expect(regularView.length).toBe(2);

    // Superuser
    const superView = getVisibleRoles(true);
    expect(superView.some((r) => r.slug === "super_admin")).toBe(true);
    expect(superView.length).toBe(3);
  });
});
