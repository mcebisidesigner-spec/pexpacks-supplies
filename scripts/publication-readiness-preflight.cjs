/**
 * Fails when any published school pack violates the public catalogue policy.
 * Requires the Supabase service-role key because the database preflight RPC is
 * intentionally unavailable to browser-facing roles.
 */
const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

function readLocalEnv() {
  const envPath = ".env.local";
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [
          line.slice(0, index),
          line.slice(index + 1).replace(/^['"]|['"]$/g, ""),
        ];
      }),
  );
}

const localEnv = readLocalEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || localEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Publication readiness preflight failed: Supabase service-role configuration is missing.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

(async () => {
  const { error } = await supabase.rpc("assert_public_catalogue_ready");
  if (error) {
    throw new Error(error.message || "Published catalogue readiness check failed.");
  }
  console.log("Publication readiness preflight passed: every published pack satisfies the strict public policy.");
})().catch((error) => {
  console.error("Publication readiness preflight failed: " + error.message);
  process.exit(1);
});