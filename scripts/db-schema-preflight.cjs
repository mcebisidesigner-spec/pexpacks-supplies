const { createHash } = require("node:crypto");
const { existsSync, readFileSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const root = process.cwd();
const snapshotDirectory = join(root, "supabase", "schema-snapshots");
const snapshotFile = join(snapshotDirectory, "remote-public-2026-09-10.sql");
const manifestFile = join(snapshotDirectory, "README.md");
const cli = process.platform === "win32" ? "supabase.cmd" : "supabase";

function fail(message) {
  console.error(`Schema preflight failed: ${message}`);
  process.exit(1);
}

function snapshotHash(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function expectedSnapshotHash(manifest) {
  const match = manifest.match(/SHA-256:\s*([a-f0-9]{64})/i);
  return match?.[1]?.toLowerCase() || null;
}

function parseMigrationList(output) {
  const parsed = JSON.parse(output);
  if (!Array.isArray(parsed.migrations)) {
    throw new Error("Supabase CLI did not return a migrations array.");
  }
  return parsed.migrations;
}

function verifySnapshot() {
  if (!existsSync(snapshotFile) || !existsSync(manifestFile)) {
    fail("schema recovery snapshot or manifest is missing.");
  }

  const expected = expectedSnapshotHash(readFileSync(manifestFile, "utf8"));
  const actual = snapshotHash(snapshotFile);
  if (!expected || expected !== actual) {
    fail("schema recovery snapshot checksum does not match its manifest.");
  }

  console.log("schema recovery snapshot checksum: verified");
}

function verifyMigrationHistory() {
  const args = ["migration", "list", "--linked", "--output-format", "json", "--log-level", "error"];
  const result =
    process.platform === "win32"
      ? spawnSync(
          process.env.ComSpec || "cmd.exe",
          ["/d", "/s", "/c", `${cli} ${args.join(" ")}`],
          { cwd: root, encoding: "utf8", shell: false },
        )
      : spawnSync(cli, args, { cwd: root, encoding: "utf8", shell: false });

  if (result.error) fail(`could not run Supabase CLI: ${result.error.message}`);
  if (result.status !== 0) fail(result.stderr.trim() || "Supabase migration list failed.");

  let migrations;
  try {
    migrations = parseMigrationList(result.stdout);
  } catch (error) {
    fail(`could not parse Supabase migration output: ${error.message}`);
  }

  const mismatches = migrations.filter(({ local, remote }) => local !== remote);
  if (mismatches.length > 0) {
    fail(`local and remote migration history differ: ${JSON.stringify(mismatches)}`);
  }

  console.log(`migration history: verified (${migrations.length} migrations)`);
}

verifySnapshot();
verifyMigrationHistory();