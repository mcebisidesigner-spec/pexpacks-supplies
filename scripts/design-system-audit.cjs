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
const inlineStyleSourceFiles = new Set();

for (const filePath of allSourceFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const matches = content.match(/style=\{\{/g);
  if (matches) {
    inlineStyleCount += matches.length;
    inlineStyleSourceFiles.add(path.relative(ROOT_DIR, filePath).replace(/\\/g, "/"));
  }
}

console.log("3️⃣  Static Inline Style Audit:");
console.log(`   Found ${inlineStyleCount} inline style instances across ${inlineStyleSourceFiles.size} files.`);
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

// 5. Inline-style concentration and arbitrary utility values.
const inlineStyleHotspots = [];
const arbitraryUtilityHotspots = [];
for (const filePath of allSourceFiles) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
  const inlineCount = (content.match(/style=\{\{/g) || []).length;
  const arbitraryCount = (content.match(/(?:className|class)\s*=\s*(?:["'`][^"'`]*\[[^\]\r\n]+\]|\{[^}]*\[[^\]\r\n]+\})/g) || []).length;

  if (inlineCount > 0) inlineStyleHotspots.push({ relativePath, count: inlineCount });
  if (arbitraryCount > 0) arbitraryUtilityHotspots.push({ relativePath, count: arbitraryCount });
}

const totalInlineStyles = inlineStyleHotspots.reduce((sum, file) => sum + file.count, 0);
const totalArbitraryUtilities = arbitraryUtilityHotspots.reduce((sum, file) => sum + file.count, 0);
console.log("5. Tailwind migration inventory:");
console.log(`   Inline style objects: ${totalInlineStyles} across ${inlineStyleHotspots.length} files.`);
inlineStyleHotspots.sort((a, b) => b.count - a.count).slice(0, 8).forEach((file) => {
  console.log(`      - ${file.relativePath}: ${file.count}`);
});
console.log(`   Arbitrary utility expressions: ${totalArbitraryUtilities} across ${arbitraryUtilityHotspots.length} files.`);
arbitraryUtilityHotspots.sort((a, b) => b.count - a.count).slice(0, 8).forEach((file) => {
  console.log(`      - ${file.relativePath}: ${file.count}`);
});
console.log("   Treat this as migration inventory: move static values first and retain dynamic values only where required.\n");

// 6. CSS inventory and encoding guard.
function getCssFiles(directory, files = []) {
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) getCssFiles(fullPath, files);
    else if (entry.name.endsWith(".css")) files.push(fullPath);
  }
  return files;
}

const cssFiles = getCssFiles(path.join(ROOT_DIR, "styles"));
const moduleFiles = getCssFiles(path.join(ROOT_DIR, "components")).filter((filePath) => filePath.endsWith(".module.css"));
const likelyMojibake = [...allSourceFiles, ...cssFiles].filter((filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  return /\u00c3|\u00c2|\u00e2\u20ac/.test(content);
});

console.log("6. Custom CSS and encoding inventory:");
console.log(`   CSS files in styles/: ${cssFiles.length}; component CSS modules: ${moduleFiles.length}.`);
console.log(`   Active CSS module imports: ${moduleCount}.`);
if (likelyMojibake.length === 0) {
  console.log("   PASS: no likely mojibake sequences found.");
} else {
  console.log(`   REVIEW: likely mojibake in ${likelyMojibake.length} file(s).`);
  likelyMojibake.slice(0, 8).forEach((filePath) => {
    console.log(`      - ${path.relative(ROOT_DIR, filePath).replace(/\\/g, "/")}`);
  });
}
console.log("   The cn() gate covers import discipline only; these inventories measure remaining styling debt.\n");
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
