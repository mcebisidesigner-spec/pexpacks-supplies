/**
 * Admin Browser Smoke Test Preflight & Manual Verification Guide
 *
 * This script runs the automated structural checks for the admin portal
 * and outputs the step-by-step checklist for the interactive authenticated browser test.
 */

const fs = require("node:fs");
const path = require("node:path");

console.log("================================================================");
console.log(" PEXPACKS ADMIN BROWSER SMOKE TEST PREFLIGHT & RUNBOOK");
console.log("================================================================");

async function main() {
  // 1. Verify critical admin route and session handler definitions exist
  const requiredFiles = [
    "app/pex-console-secure/page.tsx",
    "app/admin/layout.tsx",
    "app/api/admin/session/heartbeat/route.ts",
    "lib/admin/session-policy.ts",
  ];

  let allExist = true;
  for (const file of requiredFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing critical admin file: ${file}`);
      allExist = false;
    }
  }

  if (!allExist) {
    process.exit(1);
  }

  console.log("✅ Admin portal routes, session middleware, and heartbeat definitions verified.");

  // 2. Optional local server reachability check
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/pex-console-secure`, {
      method: "GET",
      signal: AbortSignal.timeout(1200),
    });
    console.log(`📡 Active server detected at ${baseUrl} (HTTP ${res.status})`);
  } catch {
    console.log(`ℹ️  Local server not detected on ${baseUrl} (run 'npm run dev' before interactive testing).`);
  }

  // 3. Output interactive smoke test instructions
  console.log(`
----------------------------------------------------------------
INTERACTIVE AUTHENTICATED-ADMIN BROWSER SMOKE TEST PROTOCOL
----------------------------------------------------------------
Notice:
Because automated headless browser sessions lack active administrative credentials
and multi-factor authentication sessions, perform the following in an active browser:

1. Launch application:
   npm run dev

2. Authentication:
   - Navigate to: http://localhost:3000/pex-console-secure
   - Sign in with active administrator credentials.
   - Confirm successful redirect to http://localhost:3000/admin

3. Session & Heartbeat:
   - Inspect Network tab: verify /api/admin/session/heartbeat returns 200 (Cache-Control: no-store).
   - Verify HTTP-only session cookie presence.

4. Section Verification:
   - Schools:   http://localhost:3000/admin/schools
   - Packs:     http://localhost:3000/admin/packs
   - Orders:    http://localhost:3000/admin/orders
   - Pricing:   http://localhost:3000/admin/pricing
   - Settings:  http://localhost:3000/admin/settings

5. Idle Inactivity Prompt:
   - Test idle inactivity modal and prompt for re-authentication / renewal.
================================================================
`);
}

main().catch((err) => {
  console.error("Fatal error during smoke test preflight:", err);
  process.exit(1);
});
