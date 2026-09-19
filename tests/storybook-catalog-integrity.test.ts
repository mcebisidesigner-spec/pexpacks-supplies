import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Storybook Design-System Living Catalogue Integrity", () => {
  it("verifies Storybook core configuration files exist and inject tokens", () => {
    const mainPath = resolve(root, ".storybook/main.ts");
    expect(existsSync(mainPath), ".storybook/main.ts must exist").toBe(true);
    const mainContent = readFileSync(mainPath, "utf8");
    expect(mainContent).toContain("stories:");
    expect(mainContent).toContain(".stories.@(js|jsx|mjs|ts|tsx)");

    const previewPath = resolve(root, ".storybook/preview.tsx");
    expect(existsSync(previewPath), ".storybook/preview.tsx must exist").toBe(true);
    const previewContent = readFileSync(previewPath, "utf8");
    expect(previewContent).toContain("admin-dark.css");
    expect(previewContent).toContain("db-tokens.css");
  });

  const stories = [
    {
      file: "components/admin/stories/AdminButton.stories.tsx",
      title: "Admin/Primitives/AdminButton",
      expectedExports: ["Primary", "Secondary", "Danger", "Loading"],
    },
    {
      file: "components/admin/stories/StatusBadge.stories.tsx",
      title: "Admin/Primitives/StatusBadge",
      expectedExports: ["Success", "Warning", "Danger", "Info", "Neutral"],
    },
    {
      file: "components/admin/stories/AdminEmptyState.stories.tsx",
      title: "Admin/Compound/AdminEmptyState",
      expectedExports: ["Default", "SearchResultsEmpty", "WithAction"],
    },
    {
      file: "components/admin/stories/AdminToolbar.stories.tsx",
      title: "Admin/Compound/AdminToolbar",
      expectedExports: ["DefaultComposite"],
    },
    {
      file: "components/admin/stories/AdminInfoPanel.stories.tsx",
      title: "Admin/Compound/AdminInfoPanel",
      expectedExports: ["Default", "Warning", "Success", "WithAction"],
    },
    {
      file: "components/admin/stories/QuickMetricsGrid.stories.tsx",
      title: "Admin/Domain/QuickMetricsGrid",
      expectedExports: ["Default"],
    },
  ];

  for (const story of stories) {
    it(`verifies story file ${story.file} has valid Storybook metadata and variants`, () => {
      const filePath = resolve(root, story.file);
      expect(existsSync(filePath), `Story ${story.file} must exist`).toBe(true);

      const content = readFileSync(filePath, "utf8");
      expect(content).toContain(`title: "${story.title}"`);
      expect(content).toContain("export default");

      for (const exportName of story.expectedExports) {
        expect(content).toContain(`export function ${exportName}`);
      }
    });
  }
});
