import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Architecture Assessment Report Integrity", () => {
  const docPath = resolve(root, "docs/ARCHITECTURE_ASSESSMENT_RHF_ZOD_QUERY.md");

  it("verifies the architecture assessment document exists", () => {
    expect(existsSync(docPath), "Assessment report must exist").toBe(true);
  });

  it("verifies comprehensive coverage of React Hook Form vs React 19 native forms", () => {
    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("React Hook Form (RHF)");
    expect(doc).toContain("useActionState");
    expect(doc).toContain("FormData");
    expect(doc).toContain("Quotation Builder");
    expect(doc).toContain("Progressive Enhancement");
  });

  it("verifies coverage of Zod runtime validation across Server Actions", () => {
    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("Zod Runtime Schema Validation");
    expect(doc).toContain("safeParse");
    expect(doc).toContain("MasterProductSchema");
    expect(doc).toContain("End-to-End Type Inference");
  });

  it("verifies coverage of TanStack Query vs SWR and Server Components", () => {
    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("TanStack Query");
    expect(doc).toContain("SWR");
    expect(doc).toContain("Server Components");
    expect(doc).toContain("revalidatePath");
  });

  it("verifies structured, phased modernization roadmap", () => {
    const doc = readFileSync(docPath, "utf8");
    expect(doc).toContain("Strategic Modernization Roadmap");
    expect(doc).toContain("Phase 1: Zero-Risk Hardening");
    expect(doc).toContain("Phase 2: Zod Server Action Standardization");
    expect(doc).toContain("Phase 3: Targeted React Hook Form Adoption");
    expect(doc).toContain("Phase 4: TanStack Query Evaluation");
  });
});
