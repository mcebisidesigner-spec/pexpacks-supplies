/**
 * scripts/quality-gate.cjs
 * Unified Multi-Layer Pre-Merge Quality Gate for Pexpacks Platform.
 */

const { execSync } = require("node:child_process");

console.log("================================================================");
console.log(" 🛡️  PEXPACKS PLATFORM UNIFIED CI / QUALITY GATE");
console.log("================================================================");

const steps = [
  {
    name: "Gate 1: TypeScript Static Type Safety",
    command: "npx tsc --noEmit",
  },
  {
    name: "Gate 2: Database Migration & Governance Integrity",
    command: "node scripts/verify-migration-governance.cjs",
  },
  {
    name: "Gate 3: Full Vitest Automated Regression Suite",
    command: "npx vitest run",
  },
];

let allPassed = true;
const startTime = Date.now();

for (const step of steps) {
  process.stdout.write(`⏳ Running ${step.name}... `);
  const stepStart = Date.now();

  try {
    execSync(step.command, { stdio: "pipe" });
    const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
    console.log(`✅ Passed (${duration}s)`);
  } catch (error) {
    console.log(`❌ Failed!`);
    console.error(`\nCommand: ${step.command}`);
    if (error.stdout) console.error(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    allPassed = false;
    break;
  }
}

console.log("----------------------------------------------------------------");
const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);

if (allPassed) {
  console.log(`🎉 ALL QUALITY GATES PASSED in ${totalDuration}s`);
  console.log("   Platform is healthy, type-safe, and ready for deployment.");
  console.log("================================================================");
  process.exit(0);
} else {
  console.error(`❌ QUALITY GATE FAILED after ${totalDuration}s`);
  console.error("   Fix the reported issues before merging or deploying.");
  console.error("================================================================");
  process.exit(1);
}
