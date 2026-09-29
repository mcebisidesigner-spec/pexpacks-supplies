import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const dateField = readFileSync(
  resolve(process.cwd(), "components/admin/DateField.tsx"),
  "utf8",
);

describe("admin popup design system", () => {
  it("uses the branded calendar instead of native date controls", () => {
    expect(dateField).toContain("Pexpacks");
    expect(dateField).toContain("CalendarDays");
    expect(dateField).not.toContain('type="date"');
    expect(dateField).not.toContain('type="datetime-local"');
  });

  it("does not use browser alert, confirm or prompt APIs in admin code", () => {
    const files = [
      "components/admin/ConfirmButton.tsx",
      "components/admin/DeviceActivityPrompt.tsx",
      "components/admin/IdleLogout.tsx",
      "components/admin/schools/SchoolForm.tsx",
      "components/admin/packs/VisibleToggle.tsx",
      "components/admin/packs/SchoolVisibleToggle.tsx",
      "components/admin/letters/LettersListView.tsx",
      "components/admin/content/AnnouncementsTab.tsx",
      "components/admin/content/ResourcesTab.tsx",
      "components/admin/content/TestimonialsTab.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(resolve(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/window\.(alert|confirm|prompt)\s*\(/);
    }
  });

  it("AdminDialogContext provides web app design language with Tailwind utilities", () => {
    const dialogSource = readFileSync(
      resolve(process.cwd(), "components/admin/ui/AdminDialogContext.tsx"),
      "utf8",
    );
    expect(dialogSource).toContain("bg-[#0c1424]");
    expect(dialogSource).toContain("backdrop-blur");
    expect(dialogSource).toContain("PEXPACKS BACK-OFFICE");
    expect(dialogSource).toContain('role="dialog"');
    expect(dialogSource).toContain('aria-modal="true"');
    expect(dialogSource).toContain("border-amber-500/30");
  });
});

