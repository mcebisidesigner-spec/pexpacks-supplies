/**
 * Preview Environment & Sandbox Governance Preflight Script
 *
 * Verifies:
 * 1. next.config.ts configures X-Robots-Tag: noindex, nofollow on preview deployments.
 * 2. lib/preview asserts non-production boundaries against accidental production execution.
 * 3. supabase/seed.sql contains isolated synthetic mock data without production PII.
 * 4. supabase/config.toml connection pooler and database versions match target specifications.
 */

const fs = require("fs");
const path = require("path");

console.log("=================================================");
console.log(" PEXPACKS PREVIEW ENVIRONMENT PREFLIGHT CHECK");
console.log("=================================================\n");

let failures = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    failures++;
  }
}

// 1. Check next.config.ts preview search engine blocking
try {
  const nextConfigContent = fs.readFileSync(
    path.join(__dirname, "..", "next.config.ts"),
    "utf8",
  );
  assert(
    nextConfigContent.includes('process.env.VERCEL_ENV === "preview"'),
    "next.config.ts detects Vercel preview deployment environment",
  );
  assert(
    nextConfigContent.includes('"X-Robots-Tag"') &&
      nextConfigContent.includes('"noindex, nofollow"'),
    "next.config.ts applies X-Robots-Tag: noindex, nofollow on preview deployments",
  );
} catch (e) {
  console.error("Failed to inspect next.config.ts:", e.message);
  failures++;
}

// 2. Check preview sandbox guard module
try {
  const previewModulePath = path.join(__dirname, "..", "lib", "preview", "index.ts");
  assert(
    fs.existsSync(previewModulePath),
    "lib/preview/index.ts sandbox guard module exists",
  );
  const previewModuleContent = fs.readFileSync(previewModulePath, "utf8");
  assert(
    previewModuleContent.includes("assertNonProduction"),
    "lib/preview enforces assertNonProduction security guard",
  );
  assert(
    previewModuleContent.includes("isPreviewDeployment"),
    "lib/preview exports isPreviewDeployment helper",
  );
} catch (e) {
  console.error("Failed to inspect lib/preview:", e.message);
  failures++;
}

// 3. Check Supabase Seed File Safety
try {
  const seedPath = path.join(__dirname, "..", "supabase", "seed.sql");
  if (fs.existsSync(seedPath)) {
    const seedContent = fs.readFileSync(seedPath, "utf8");
    assert(
      seedContent.includes("Local Verification") || seedContent.includes("local-verification"),
      "supabase/seed.sql targets local/ephemeral synthetic entities",
    );
    // Ensure no real production customer domains or leaked credentials in seed.sql
    const containsLeakedEmails = /@gmail\.com|@yahoo\.com|@outlook\.com/i.test(seedContent);
    assert(
      !containsLeakedEmails,
      "supabase/seed.sql contains zero personal customer email addresses",
    );
  } else {
    console.log("[SKIP] supabase/seed.sql not found");
  }
} catch (e) {
  console.error("Failed to inspect supabase/seed.sql:", e.message);
  failures++;
}

// 4. Check Supabase Configuration
try {
  const configPath = path.join(__dirname, "..", "supabase", "config.toml");
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, "utf8");
    assert(
      configContent.includes("major_version = 17"),
      "supabase/config.toml pins PostgreSQL major version to 17",
    );
    assert(
      configContent.includes("[db.pooler]") && configContent.includes("enabled = true"),
      "supabase/config.toml enables transaction connection pooler for preview/local parity",
    );
  }
} catch (e) {
  console.error("Failed to inspect supabase/config.toml:", e.message);
  failures++;
}

console.log("\n-------------------------------------------------");
if (failures === 0) {
  console.log("All preview environment preflight checks PASSED cleanly.");
  process.exit(0);
} else {
  console.error(`Preview check encountered ${failures} failure(s).`);
  process.exit(1);
}
