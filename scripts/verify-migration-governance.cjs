/**
 * verify-migration-governance.cjs
 * Validates Supabase migration files against Pexpacks Database Governance policies.
 */

const fs = require("node:fs");
const path = require("node:path");

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const FILENAME_REGEX = /^\d{5}_[a-z0-9_]+\.sql$/;
const KNOWN_HISTORICAL_GAPS = new Set([79]); // Historical gap between 00078 and 00080

function verifyMigrationGovernance() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`Migrations directory not found at: ${MIGRATIONS_DIR}`);
  }

  const entries = fs.readdirSync(MIGRATIONS_DIR);
  const sqlFiles = entries.filter((f) => f.endsWith(".sql"));

  if (sqlFiles.length === 0) {
    throw new Error("No SQL migration files found.");
  }

  const errors = [];
  const numbersSeen = new Map();
  const parsedMigrations = [];

  for (const filename of sqlFiles) {
    if (!FILENAME_REGEX.test(filename)) {
      errors.push(
        `Invalid migration filename '${filename}'. Must match format ^\\d{5}_[a-z0-9_]+\\.sql$`
      );
      continue;
    }

    const prefix = filename.slice(0, 5);
    const num = parseInt(prefix, 10);

    if (numbersSeen.has(num)) {
      errors.push(
        `Duplicate migration number ${prefix}: '${filename}' conflicts with '${numbersSeen.get(
          num
        )}'`
      );
    } else {
      numbersSeen.set(num, filename);
    }

    parsedMigrations.push({ num, filename });
  }

  // Sort by migration number
  parsedMigrations.sort((a, b) => a.num - b.num);

  const minNum = parsedMigrations[0]?.num ?? 1;
  const maxNum = parsedMigrations[parsedMigrations.length - 1]?.num ?? 0;

  if (minNum !== 1) {
    errors.push(`First migration does not start at 00001 (found: ${minNum})`);
  }

  // Check sequence continuity
  for (let i = minNum; i <= maxNum; i++) {
    if (KNOWN_HISTORICAL_GAPS.has(i)) {
      continue;
    }
    if (!numbersSeen.has(i)) {
      errors.push(
        `Sequence gap detected: Migration ${String(i).padStart(
          5,
          "0"
        )} is missing.`
      );
    }
  }

  return {
    totalMigrations: sqlFiles.length,
    latestMigration: parsedMigrations[parsedMigrations.length - 1]?.filename,
    latestNumber: maxNum,
    errors,
  };
}

if (require.main === module) {
  try {
    const result = verifyMigrationGovernance();
    if (result.errors.length > 0) {
      console.error(
        `❌ Migration governance check failed with ${result.errors.length} error(s):`
      );
      for (const err of result.errors) {
        console.error(`  - ${err}`);
      }
      process.exit(1);
    }

    console.log(`✅ Migration governance verified successfully:`);
    console.log(`   Total migrations: ${result.totalMigrations}`);
    console.log(`   Latest migration: ${result.latestMigration}`);
    console.log(`   Sequence continuity: 00001 to ${String(result.latestNumber).padStart(5, "0")} (verified)`);
  } catch (err) {
    console.error(`❌ Unexpected error during migration check:`, err);
    process.exit(1);
  }
}

module.exports = {
  verifyMigrationGovernance,
};
