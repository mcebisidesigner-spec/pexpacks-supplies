import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const routeSource = readFileSync(
  new URL("../app/api/ai-convert-list/route.ts", import.meta.url),
  "utf8",
);

describe("AI conversion draft privacy", () => {
  it("persists only the approved non-sensitive draft cart fields", () => {
    const insertBlock = routeSource.slice(
      routeSource.indexOf('.from("draft_carts")'),
      routeSource.indexOf('.select("id")'),
    );

    expect(insertBlock).toContain("items: matchedItems");
    expect(insertBlock).toContain("item_count: totalItemCount");
    expect(insertBlock).not.toContain("raw_extracted:");
    expect(insertBlock).not.toContain("document_name:");
    expect(insertBlock).not.toContain("document_type:");
    expect(insertBlock).not.toContain("learnerName");
    expect(insertBlock).not.toContain("metadata:");
  });
});