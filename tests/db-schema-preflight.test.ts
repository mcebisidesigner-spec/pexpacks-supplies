import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("database schema preflight", () => {
  it("checks both remote migration history and the recovery snapshot checksum", () => {
    const script = read("scripts/db-schema-preflight.cjs");
    expect(script).toContain('"migration", "list", "--linked"');
    expect(script).toContain("schema recovery snapshot checksum does not match");
    expect(script).toContain("local and remote migration history differ");
  });
});