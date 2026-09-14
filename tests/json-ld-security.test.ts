import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/components/ui/JsonLd";

describe("JSON-LD serialization", () => {
  it("escapes script-context characters without changing structured values", () => {
    const value = serializeJsonLd({
      name: "</script><script>alert(1)</script>",
      separator: "one\u2028two\u2029three",
    });

    expect(value).not.toContain("</script>");
    expect(value).not.toContain("<script>");
    expect(value).toContain("\\u003c/script>");
    expect(value).toContain("\\u2028");
    expect(value).toContain("\\u2029");
  });
});
