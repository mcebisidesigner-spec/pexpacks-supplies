import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("fulfilment workflow actions", () => {
  it("uses only guarded normalized packing and fulfilment transitions", () => {
    const actions = readFileSync(
      resolve(process.cwd(), "app/admin/fulfilment/actions.ts"),
      "utf8",
    );

    expect(actions).toContain('permission: "fulfilment.manage"');
    expect(actions).toContain("getFulfilmentWorkflow(orderId)");
    expect(actions).toContain("updatePackingRecord");
    expect(actions).toContain("updateFulfilmentRecord");
    expect(actions).toContain('"/admin/fulfilment/[orderNumber]", "page"');
    expect(actions).toContain('"pending", "scheduled", "ready"');
  });

  it("preserves courier details when a stage-only transition is performed", () => {
    const operations = readFileSync(
      resolve(process.cwd(), "lib/admin/operations.ts"),
      "utf8",
    );

    expect(operations).toContain("if (courierName !== undefined)");
    expect(operations).toContain("if (waybillNumber !== undefined)");
  });
});
