import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("public contact routing", () => {
  it("uses helpme in the shared footer and care for legal and query contacts", () => {
    const footer = readFileSync(
      resolve(process.cwd(), "components/layout/Footer.tsx"),
      "utf8",
    );
    const contact = readFileSync(
      resolve(process.cwd(), "data/contact.ts"),
      "utf8",
    );
    const disclaimer = readFileSync(
      resolve(process.cwd(), "app/email-disclaimer/page.tsx"),
      "utf8",
    );

    expect(footer).toContain('FOOTER_EMAIL = "helpme@pexpacks.co.za"');
    expect(contact).toContain('generalEmail = "care@pexpacks.co.za"');
    expect(contact).toContain('legalEmail = "care@pexpacks.co.za"');
    expect(disclaimer).toContain('careEmail = "care@pexpacks.co.za"');
  });
});
