import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const idleMonitor = readFileSync(
  resolve(process.cwd(), "components/admin/IdleLogout.tsx"),
  "utf8",
);
const brandedPrompt = readFileSync(
  resolve(process.cwd(), "components/admin/DeviceActivityPrompt.tsx"),
  "utf8",
);

describe("admin inactivity prompt", () => {
  it("does not request Chrome idle-detection permission", () => {
    expect(idleMonitor).not.toContain("IdleDetector");
    expect(idleMonitor).not.toContain("requestPermission");
    expect(idleMonitor).not.toContain('name: "idle-detection"');
  });

  it("keeps the Pexpacks-branded session notice", () => {
    expect(brandedPrompt).toContain("Pexpacks protects this dashboard");
    expect(brandedPrompt).toContain("Continue");
    expect(idleMonitor).toContain("pex_dashboard_security_notice_v2");
  });
});
