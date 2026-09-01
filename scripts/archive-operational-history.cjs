const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [
          line.slice(0, index),
          line.slice(index + 1).replace(/^["']|["']$/g, ""),
        ];
      }),
  );
}

const env = loadEnvFile(".env.local");
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const retentionDays = Number(process.env.ARCHIVE_RETENTION_DAYS || 730);
const executeArchive = process.argv.includes("--execute");
const confirmed = process.env.CONFIRM_ARCHIVE === "true";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

if (!Number.isInteger(retentionDays) || retentionDays < 30) {
  console.error(
    "ARCHIVE_RETENTION_DAYS must be an integer of at least 30 days.",
  );
  process.exit(1);
}

if (executeArchive && !confirmed) {
  console.error(
    "Refusing to archive live data without CONFIRM_ARCHIVE=true. Run the dry-run first, then explicitly confirm.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  const { data, error } = await supabase.rpc("archive_operational_history", {
    retention_days: retentionDays,
    dry_run: !executeArchive,
  });

  if (error) {
    console.error(`archive_operational_history failed: ${error.message}`);
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));

  if (!executeArchive) {
    console.log(
      "Dry run only. To archive these rows, run: CONFIRM_ARCHIVE=true npm.cmd run db:archive",
    );
  }
})();
