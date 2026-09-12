import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("transactional customer-care routing", () => {
  it("uses one current support address in shared legal and order-status email paths", () => {
    const legal = readFileSync(
      resolve(process.cwd(), "lib/email/legalNotice.ts"),
      "utf8",
    );
    const status = readFileSync(
      resolve(process.cwd(), "lib/email/orderStatusUpdate.ts"),
      "utf8",
    );
    const forms = readFileSync(
      resolve(process.cwd(), "lib/email/formNotification.ts"),
      "utf8",
    );

    expect(legal).toContain('CUSTOMER_CARE_EMAIL = "care@pexpacks.co.za"');
    expect(status).toContain("bcc: [CUSTOMER_CARE_EMAIL");
    expect(status).toContain("|| CUSTOMER_CARE_EMAIL");
    expect(forms).toContain("|| CUSTOMER_CARE_EMAIL");
    expect(`${legal}\n${status}\n${forms}`).not.toContain(
      "helpme@pexpacks.co.za",
    );
    expect(`${status}\n${forms}`).not.toContain('"${CUSTOMER_CARE_EMAIL}"');
  });
});
