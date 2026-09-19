/**
 * Performance & Bundle Audit Preflight Script
 *
 * Verifies:
 * 1. Package import optimizations in next.config.ts
 * 2. Static asset caching headers configuration
 * 3. Image budget constraints (per-file & total payload)
 * 4. Above-the-fold hero image priority compliance
 */

const fs = require("fs");
const path = require("path");

console.log("=================================================");
console.log(" PEXPACKS PERFORMANCE & ASSET AUDIT SUITE");
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

// 1. Check next.config.ts for optimizePackageImports
try {
  const nextConfigContent = fs.readFileSync(
    path.join(__dirname, "..", "next.config.ts"),
    "utf8",
  );
  assert(
    nextConfigContent.includes("@tanstack/react-table"),
    "next.config.ts optimizes @tanstack/react-table imports",
  );
  assert(
    nextConfigContent.includes("tailwind-merge"),
    "next.config.ts optimizes tailwind-merge imports",
  );
  assert(
    nextConfigContent.includes("class-variance-authority"),
    "next.config.ts optimizes class-variance-authority imports",
  );
  assert(
    nextConfigContent.includes("lucide-react"),
    "next.config.ts optimizes lucide-react imports",
  );
  assert(
    nextConfigContent.includes("compress: true"),
    "next.config.ts enables gzip/brotli compression",
  );
  assert(
    nextConfigContent.includes('output: "standalone"'),
    "next.config.ts enables standalone build output",
  );
} catch (e) {
  console.error("Failed to inspect next.config.ts:", e.message);
  failures++;
}

// 2. Check Static Asset Caching Headers in next.config.ts
try {
  const nextConfigContent = fs.readFileSync(
    path.join(__dirname, "..", "next.config.ts"),
    "utf8",
  );
  assert(
    nextConfigContent.includes("public, max-age=31536000, immutable"),
    "next.config.ts sets 1-year immutable caching for fonts and icons",
  );
  assert(
    nextConfigContent.includes("stale-while-revalidate=2592000"),
    "next.config.ts sets stale-while-revalidate for images",
  );
  assert(
    nextConfigContent.includes("no-store, no-cache, must-revalidate"),
    "next.config.ts enforces no-store for admin and pex-console-secure",
  );
} catch (e) {
  console.error("Failed to verify caching headers:", e.message);
  failures++;
}

// 3. Check Image Budget
try {
  const imageDir = path.join(__dirname, "..", "public", "images");
  if (fs.existsSync(imageDir)) {
    const maxKb = 300;
    const totalKbLimit = 3072;

    function walk(root) {
      const out = [];
      for (const entry of fs.readdirSync(root)) {
        const full = path.join(root, entry);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) out.push(...walk(full));
        else out.push(full);
      }
      return out;
    }

    const files = walk(imageDir);
    let totalBytes = 0;
    const oversized = [];

    for (const f of files) {
      const sz = fs.statSync(f).size;
      totalBytes += sz;
      if (sz / 1024 > maxKb) {
        oversized.push(`${path.relative(process.cwd(), f)} (${(sz / 1024).toFixed(0)}KB)`);
      }
    }

    const totalKb = totalBytes / 1024;
    assert(
      oversized.length === 0,
      `All images within ${maxKb}KB individual limit (found ${oversized.length} oversized)`,
    );
    assert(
      totalKb <= totalKbLimit,
      `Total image weight ${(totalKb).toFixed(0)}KB is within ${totalKbLimit}KB budget`,
    );
  }
} catch (e) {
  console.error("Failed to verify image budgets:", e.message);
  failures++;
}

// 4. Check LCP Optimization on Hero Components
try {
  const homeHero = fs.readFileSync(
    path.join(__dirname, "..", "app", "page.tsx"),
    "utf8",
  );
  assert(
    homeHero.includes("priority") && homeHero.includes("placeholder=\"blur\""),
    "Homepage hero image has priority and blur placeholder for LCP optimization",
  );

  const schoolHero = fs.readFileSync(
    path.join(__dirname, "..", "app", "schools", "[schoolSlug]", "page.tsx"),
    "utf8",
  );
  assert(
    schoolHero.includes("priority"),
    "School detail page crest/logo has priority attribute",
  );
} catch (e) {
  console.error("Failed to verify hero LCP optimizations:", e.message);
  failures++;
}

console.log("\n-------------------------------------------------");
if (failures === 0) {
  console.log("All performance checks PASSED cleanly.");
  process.exit(0);
} else {
  console.error(`Audit encountered ${failures} failure(s).`);
  process.exit(1);
}
