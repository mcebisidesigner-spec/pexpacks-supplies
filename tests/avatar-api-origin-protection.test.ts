import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("avatar API origin protection", () => {
  it("requires a same-origin request for both mutations", () => {
    const route = readFileSync(
      resolve(process.cwd(), "app/api/admin/profile/avatar/route.ts"),
      "utf8",
    );

    expect(route).toContain("export async function POST(request: NextRequest)");
    expect(route).toContain("export async function DELETE(request: NextRequest)");
    expect(route.match(/isSameOriginRequest\(request\)/g)).toHaveLength(2);
  });
});
