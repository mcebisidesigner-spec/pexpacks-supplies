#!/usr/bin/env node

const { spawnSync } = require("node:child_process");

const strict = process.argv.includes("--strict");
const advisorArgs = [
  "db",
  "advisors",
  "--linked",
  "--type",
  "security",
  "--level",
  "warn",
  "--fail-on",
  "none",
];
const result = process.platform === "win32"
  ? spawnSync(
      process.env.ComSpec || "cmd.exe",
      ["/d", "/s", "/c", ["supabase.cmd", ...advisorArgs].join(" ")],
      { encoding: "utf8" },
    )
  : spawnSync("supabase", advisorArgs, { encoding: "utf8" });

if (result.error || result.status !== 0) {
  console.error("[db-security-advisor] Unable to run the Supabase security advisor.");
  process.stderr.write(result.stderr || result.error?.message || "Unknown error\n");
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(result.stdout);
} catch {
  console.error("[db-security-advisor] Supabase returned an unreadable advisor response.");
  process.stderr.write(result.stdout);
  process.exit(1);
}

const findings = Array.isArray(payload.results) ? payload.results : [];
if (findings.length === 0) {
  console.log("[db-security-advisor] No linked-database security warnings.");
  process.exit(0);
}

console.warn(`[db-security-advisor] ${findings.length} security warning(s):`);
for (const finding of findings) {
  console.warn(`- ${finding.name}: ${finding.title}`);
}

if (strict) {
  process.exit(1);
}

