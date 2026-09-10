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
const sessionProvider = readFileSync(
  resolve(process.cwd(), "components/security/SessionSecurityProvider.tsx"),
  "utf8",
);
const proxy = readFileSync(resolve(process.cwd(), "proxy.ts"), "utf8");

describe("admin inactivity prompt", () => {
  it("does not request Chrome idle-detection permission", () => {
    expect(idleMonitor).not.toContain("IdleDetector");
    expect(idleMonitor).not.toContain("requestPermission");
    expect(idleMonitor).not.toContain('name: "idle-detection"');
  });

  it("keeps the Pexpacks-branded session notice", () => {
    expect(brandedPrompt).toContain(
      "Pexpacks shields sensitive dashboard data",
    );
    expect(brandedPrompt).toContain("Continue");
    expect(idleMonitor).toContain("pex_dashboard_security_notice_v2");
  });

  it("uses a 15-minute shield and server-enforced 40-minute standard timeout", () => {
    expect(sessionProvider).toContain("15 * 60 * 1000");
    expect(sessionProvider).toContain("40 * 60 * 1000");
    expect(sessionProvider).toContain("2 * 60 * 60 * 1000");
    expect(sessionProvider).toContain("/api/admin/session/heartbeat");
    expect(sessionProvider).toContain("RUNTIME_SESSION_REQUEST");
    expect(sessionProvider).toContain("RUNTIME_SESSION_ACTIVE");
    expect(proxy).toContain("verifyAdminSessionValue");
    expect(proxy).toContain("ADMIN_SESSION_COOKIE");
  });
});
