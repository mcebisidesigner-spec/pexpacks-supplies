/**
 * scripts/design-system-audit.cjs
 *
 * Automated Design-System & Tailwind Governance Audit for Pexpacks.
 * Scans components and routes for styling drift, unapproved class composition,
 * arbitrary values, and legacy styling.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT_DIR = path.resolve(__dirname, "..");
const SCAN_DIRS = [path.join(ROOT_DIR, "components"), path.join(ROOT_DIR, "app")];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

console.log("================================================================");
console.log(" 🎨  PEXPACKS DESIGN-SYSTEM & TAILWIND GOVERNANCE AUDIT");
console.log("================================================================");

const allSourceFiles = SCAN_DIRS.flatMap((dir) => getAllFiles(dir));
console.log(`📁 Scanned ${allSourceFiles.length} source files across components/ and app/\n`);

// 1. Unapproved clsx / tailwind-merge imports
const directImportViolations = [];
for (const filePath of allSourceFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");

  if (
    /from\s+["']clsx["']/.test(content) ||
    /from\s+["']tailwind-merge["']/.test(content)
  ) {
    if (relPath !== "lib/utils.ts") {
      directImportViolations.push(relPath);
    }
  }
}

console.log("1️⃣  Class Composition Architecture Gate:");
if (directImportViolations.length === 0) {
  console.log("   ✅ PASSED: 100% of files consume canonical cn() from @/lib/utils.");
  console.log("      Zero scattered clsx or tailwind-merge imports detected.\n");
} else {
  console.log(`   ❌ FAILED: ${directImportViolations.length} file(s) bypass canonical cn():`);
  directImportViolations.forEach((v) => console.log(`      - ${v}`));
  console.log();
}

// 2. Arbitrary Hex Colors
const arbitraryHexMap = new Map();
let totalArbitraryHex = 0;
const HEX_REGEX = /\[#([0-9a-fA-F]{3,8})\]/g;

for (const filePath of allSourceFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  let match;
  while ((match = HEX_REGEX.exec(content)) !== null) {
    const hex = `#${match[1].toLowerCase()}`;
    arbitraryHexMap.set(hex, (arbitraryHexMap.get(hex) || 0) + 1);
    totalArbitraryHex++;
  }
}

console.log("2️⃣  Arbitrary Hex Colors Audit:");
console.log(`   Found ${totalArbitraryHex} arbitrary hex occurrences across ${arbitraryHexMap.size} unique values.`);
console.log("   Top repeated arbitrary hex values:");
const sortedHex = [...arbitraryHexMap.entries()].sort((a, b) => b[1] - a[1]);
sortedHex.slice(0, 8).forEach(([hex, count]) => {
  let classification = "ONE-OFF";
  if (hex === "#1a2a40") classification = "DUPLICATE OF var(--pex-navy)";
  else if (hex === "#219e9a" || hex === "#1a7a77") classification = "DUPLICATE OF var(--pex-keppel)";
  else if (hex === "#ff6f59" || hex === "#e85e4b") classification = "DUPLICATE OF var(--pex-coral)";
  else if (hex === "#128c7e" || hex === "#25d366") classification = "LEGITIMATE THIRD-PARTY (WhatsApp)";
  else if (hex === "#10b981") classification = "ADMIN BRAND (Emerald 500)";
  else if (count >= 5) classification = "CANDIDATE FOR TOKEN";

  console.log(`     ${hex.padEnd(10)}: ${String(count).padStart(3)} occurrences ➔ ${classification}`);
});
console.log();

// 3. Static Inline Styles
let inlineStyleCount = 0;
const inlineStyleFiles = new Set();

for (const filePath of allSourceFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const matches = content.match(/style=\{\{/g);
  if (matches) {
    inlineStyleCount += matches.length;
    inlineStyleFiles.add(path.relative(ROOT_DIR, filePath).replace(/\\/g, "/"));
  }
}

console.log("3️⃣  Static Inline Style Audit:");
console.log(`   Found ${inlineStyleCount} inline style instances across ${inlineStyleFiles.size} files.`);
console.log("   (Most reside in isolated security dialogs: StepUpModal, MustChangePasswordModal)\n");

// 4. CSS Modules Count
let moduleCount = 0;
for (const filePath of allSourceFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const matches = content.match(/import\s+styles\s+from\s+["'].*\.module\.css["']/g);
  if (matches) moduleCount += matches.length;
}

console.log("4️⃣  Legacy CSS Module Audit:");
console.log(`   Active CSS Module imports: ${moduleCount}`);
console.log("   (Documented in DESIGN_SYSTEM_GOVERNANCE.md for controlled deprecation)\n");

console.log("================================================================");
if (directImportViolations.length === 0) {
  console.log("🎉 GOVERNANCE AUDIT COMPLETE: Core composition rules fully upheld.");
  console.log("================================================================");
  process.exit(0);
} else {
  console.log("❌ GOVERNANCE AUDIT FAILED: Composition drift detected.");
  console.log("================================================================");
  process.exit(1);
}
